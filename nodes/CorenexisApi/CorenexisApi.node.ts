import {
	NodeConnectionTypes,
	NodeOperationError,
	sleep,
	type IBinaryKeyData,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';
import { htmlToPdfDescription, markdownToPdfDescription } from './resources/documents';
import {
	accountDescription,
	disposableEmailDescription,
	emailValidatorDescription,
	imageCdnDescription,
	imageConversionDescription,
	qrBarcodeDescription,
} from './resources/misc';
import { imageOcrDescription, pdfToTextDescription } from './resources/ocr';
import {
	corenexisAccountTool,
	corenexisApiBinaryRequest,
	corenexisApiRequest,
	downloadFile,
} from './shared/transport';

type Ctx = IExecuteFunctions;

/** Drops options left empty so the API applies its own defaults. */
function compact(values: IDataObject): IDataObject {
	const out: IDataObject = {};
	for (const [key, value] of Object.entries(values)) {
		if (value === undefined || value === null || value === '') continue;
		if (Array.isArray(value) && value.length === 0) continue;
		out[key] = value;
	}
	return out;
}

/** Reads a binary input field as a Buffer. */
async function readBinary(ctx: Ctx, i: number, field: string): Promise<Buffer> {
	ctx.helpers.assertBinaryData(i, field);
	return await ctx.helpers.getBinaryDataBuffer(i, field);
}

/** Page and margin options shared by both PDF renderers, mapped to API names. */
function pageOptions(o: IDataObject): IDataObject {
	return {
		page_size: o.pageSize,
		orientation: o.orientation,
		margin_top: o.marginTop,
		margin_right: o.marginRight,
		margin_bottom: o.marginBottom,
		margin_left: o.marginLeft,
		png_mode: o.pngMode,
		png_page: o.pngPage,
		png_dpi: o.pngDpi,
		filename: o.filename,
	};
}

/**
 * Turns the hosted links of a PDF or image result into binary fields: the main
 * file goes in `field`, extra page images in `field_2`, `field_3` and so on.
 */
async function attachFiles(
	ctx: Ctx,
	i: number,
	data: IDataObject,
	field: string,
	fallbackName: string,
): Promise<IBinaryKeyData> {
	const files: Array<{ url: string; filename?: string }> = [];
	const images = data.images as IDataObject[] | undefined;
	if (Array.isArray(images) && images.length) {
		for (const img of images)
			files.push({ url: String(img.url), filename: img.filename as string });
	} else if (data.url) {
		files.push({ url: String(data.url), filename: data.filename as string | undefined });
	}

	const binary: IBinaryKeyData = {};
	for (let n = 0; n < files.length; n++) {
		const file = files[n];
		const { data: buffer, mimeType } = await downloadFile.call(ctx, i, file.url);
		const name = file.filename || `${fallbackName}${n ? `-${n + 1}` : ''}`;
		binary[n === 0 ? field : `${field}_${n + 1}`] = await ctx.helpers.prepareBinaryData(
			buffer,
			name,
			mimeType,
		);
	}
	return binary;
}

/** Fetches the text files of a finished PDF to text job into the job object. */
async function addJobText(ctx: Ctx, i: number, job: IDataObject): Promise<IDataObject> {
	const output = job.output as IDataObject | undefined;
	if (!output) return job;
	const result: IDataObject = { ...job };
	if (output.txt)
		result.text = (await downloadFile.call(ctx, i, String(output.txt))).data.toString('utf8');
	if (output.md)
		result.markdown = (await downloadFile.call(ctx, i, String(output.md))).data.toString('utf8');
	return result;
}

/** The source of an image or PDF input: a public URL or a binary field sent as base64. */
async function fileSource(
	ctx: Ctx,
	i: number,
	names: { url: string; base64: string },
): Promise<IDataObject> {
	const inputType = ctx.getNodeParameter('inputType', i) as string;
	if (inputType === 'url') {
		return { [names.url]: ctx.getNodeParameter('fileUrl', i) as string };
	}
	const field = ctx.getNodeParameter('binaryPropertyName', i) as string;
	return { [names.base64]: (await readBinary(ctx, i, field)).toString('base64') };
}

export class CorenexisApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Corenexis API',
		name: 'corenexisApi',
		icon: { light: 'file:../../icons/corenexis.svg', dark: 'file:../../icons/corenexis.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'PDF from HTML or Markdown, OCR for images and PDFs, email validation, image conversion and hosting, QR codes and barcodes',
		defaults: {
			name: 'Corenexis API',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'corenexisApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Account', value: 'account', description: 'Key, subscriptions and usage. Free.' },
					{ name: 'Disposable Email Detector', value: 'disposableEmail' },
					{ name: 'Email Validator', value: 'emailValidator' },
					{ name: 'HTML to PDF', value: 'htmlToPdf' },
					{ name: 'Image CDN', value: 'imageCdn', description: 'Host an image and get a link' },
					{ name: 'Image Conversion', value: 'imageConversion' },
					{ name: 'Image to Text (OCR)', value: 'imageOcr' },
					{ name: 'Markdown to PDF', value: 'markdownToPdf' },
					{ name: 'PDF to Text (OCR)', value: 'pdfToText' },
					{ name: 'QR Code and Barcode', value: 'qrBarcode' },
				],
				default: 'markdownToPdf',
			},
			...accountDescription,
			...markdownToPdfDescription,
			...htmlToPdfDescription,
			...imageOcrDescription,
			...pdfToTextDescription,
			...emailValidatorDescription,
			...disposableEmailDescription,
			...imageConversionDescription,
			...imageCdnDescription,
			...qrBarcodeDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;
				const result = await runOperation(this, i, resource, operation);
				returnData.push({ ...result, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returnData];
	}
}

async function runOperation(
	ctx: Ctx,
	i: number,
	resource: string,
	operation: string,
): Promise<INodeExecutionData> {
	const options = (ctx.getNodeParameter('options', i, {}) ?? {}) as IDataObject;

	switch (`${resource}:${operation}`) {
		// ------------------------------------------------------------ account
		case 'account:get':
			return { json: await corenexisAccountTool.call(ctx, i, 'corenexis_account') };
		case 'account:getSubscriptions':
			return { json: await corenexisAccountTool.call(ctx, i, 'corenexis_subscriptions') };

		// ------------------------------------------------------------ documents
		case 'markdownToPdf:convert': {
			const source = ctx.getNodeParameter('markdownSource', i) as string;
			const markdown =
				source === 'binary'
					? (
							await readBinary(ctx, i, ctx.getNodeParameter('binaryPropertyName', i) as string)
						).toString('utf8')
					: (ctx.getNodeParameter('markdown', i) as string);
			const palette = ((options.colors as IDataObject | undefined)?.palette ?? undefined) as
				| IDataObject
				| undefined;
			const body = compact({
				markdown,
				format: ctx.getNodeParameter('format', i),
				...pageOptions(options),
				theme: options.theme,
				font: options.font,
				mono_font: options.monoFont,
				font_size: options.fontSize,
				colors: palette && Object.keys(compact(palette)).length ? compact(palette) : undefined,
				header_text: options.headerText,
				footer_text: options.footerText,
			});
			return await documentResult(ctx, i, '/markdown-to-pdf/v1', body);
		}
		case 'htmlToPdf:convert': {
			const source = ctx.getNodeParameter('htmlSource', i) as string;
			const html =
				source === 'binary'
					? (
							await readBinary(ctx, i, ctx.getNodeParameter('binaryPropertyName', i) as string)
						).toString('utf8')
					: (ctx.getNodeParameter('html', i) as string);
			const body = compact({
				html,
				format: ctx.getNodeParameter('format', i),
				...pageOptions(options),
				width: options.pageWidth,
				height: options.pageHeight,
				scale: options.scale,
				js: options.js,
				wait_ms: options.js ? options.waitMs : undefined,
				header_html: options.headerHtml,
				footer_html: options.footerHtml,
			});
			return await documentResult(ctx, i, '/html-to-pdf/v1', body);
		}

		// ------------------------------------------------------------ OCR
		case 'imageOcr:extractText': {
			const lang = options.lang as string[] | undefined;
			const body = compact({
				...(await fileSource(ctx, i, { url: 'image_url', base64: 'image_base64' })),
				lang: lang?.length ? lang.join('+') : undefined,
			});
			const response = await corenexisApiRequest.call(ctx, i, 'POST', '/image-ocr/v1', body);
			return { json: withUsage(response) };
		}
		case 'pdfToText:submit':
		case 'pdfToText:extract': {
			const lang = options.lang as string[] | undefined;
			const body = compact({
				...(await fileSource(ctx, i, { url: 'pdf_url', base64: 'pdf_base64' })),
				lang: lang?.length ? lang.join('+') : undefined,
				output_format: options.outputFormat,
				extract_pages: options.extractPages,
				webhook_url: options.webhookUrl,
			});
			const submitted = await corenexisApiRequest.call(ctx, i, 'POST', '/pdf-to-text/v1', body);
			const job = (submitted.data ?? {}) as IDataObject;
			if (operation === 'submit') return { json: withUsage(submitted) };

			const interval = Math.max(2, Number(options.pollInterval ?? 5)) * 1000;
			const deadline = Date.now() + Math.max(10, Number(options.maxWait ?? 300)) * 1000;
			let state: IDataObject = job;
			while (Date.now() < deadline) {
				await sleep(interval);
				const status = await corenexisApiRequest.call(
					ctx,
					i,
					'GET',
					`/pdf-to-text/status/${encodeURIComponent(String(job.job_id))}`,
				);
				state = (status.data ?? {}) as IDataObject;
				if (state.status !== 'processing') break;
			}
			const includeText = ctx.getNodeParameter('includeText', i, true) as boolean;
			const final = includeText ? await addJobText(ctx, i, state) : state;
			return { json: { ...final, timed_out: state.status === 'processing' } };
		}
		case 'pdfToText:getJob': {
			const jobId = (ctx.getNodeParameter('jobId', i) as string).trim();
			const status = await corenexisApiRequest.call(
				ctx,
				i,
				'GET',
				`/pdf-to-text/status/${encodeURIComponent(jobId)}`,
			);
			const job = (status.data ?? {}) as IDataObject;
			const includeText = ctx.getNodeParameter('includeText', i, true) as boolean;
			return { json: includeText ? await addJobText(ctx, i, job) : job };
		}

		// ------------------------------------------------------------ email
		case 'emailValidator:validate': {
			const email = (ctx.getNodeParameter('email', i) as string).trim();
			const response = await corenexisApiRequest.call(ctx, i, 'POST', '/email-validator/v1', {
				email,
			});
			return { json: withUsage(response) };
		}
		case 'disposableEmail:check': {
			const email = (ctx.getNodeParameter('email', i) as string).trim();
			const response = await corenexisApiRequest.call(
				ctx,
				i,
				'POST',
				'/disposable-email-validator/v1',
				{ email },
			);
			return { json: withUsage(response) };
		}

		// ------------------------------------------------------------ images
		case 'imageConversion:convert': {
			const body = compact({
				...(await fileSource(ctx, i, { url: 'image_url', base64: 'base64' })),
				format: ctx.getNodeParameter('format', i),
				width: options.width || undefined,
				height: options.height || undefined,
				quality: options.quality,
			});
			const response = await corenexisApiRequest.call(ctx, i, 'POST', '/image-conversion/v1', body);
			return await hostedResult(ctx, i, response, `converted.${String(body.format)}`);
		}
		case 'imageCdn:upload': {
			const body = compact({
				...(await fileSource(ctx, i, { url: 'image_url', base64: 'image_base64' })),
				width: options.width || undefined,
				height: options.height || undefined,
				quality: options.quality,
				duration: options.duration,
			});
			const response = await corenexisApiRequest.call(ctx, i, 'POST', '/image-cdn/v3', body);
			return { json: withUsage(response) };
		}

		// ------------------------------------------------------------ QR and barcode
		case 'qrBarcode:generate': {
			const type = ctx.getNodeParameter('type', i) as string;
			const output = ctx.getNodeParameter('output', i) as string;
			const qs = compact(
				type === 'upi'
					? {
							type,
							pa: ctx.getNodeParameter('pa', i),
							pn: ctx.getNodeParameter('pn', i, ''),
							am: ctx.getNodeParameter('am', i, ''),
							tn: ctx.getNodeParameter('tn', i, ''),
						}
					: { type, data: ctx.getNodeParameter('data', i) },
			);
			Object.assign(qs, compact({ size: options.size, logo: options.logo, output }));

			if (output === 'url') {
				const response = await corenexisApiRequest.call(
					ctx,
					i,
					'GET',
					'/qr-barcode/v1',
					undefined,
					qs,
				);
				return { json: withUsage(response) };
			}
			const field = ctx.getNodeParameter('outputBinaryPropertyName', i) as string;
			const { data, headers } = await corenexisApiBinaryRequest.call(ctx, i, '/qr-barcode/v1', qs);
			const json: IDataObject = { type, size_kb: headers['x-size-kb'], plan: headers['x-plan'] };
			if (headers['x-remaining'] !== undefined) json.remaining = headers['x-remaining'];
			if (headers['x-hosted-image-url']) json.hosted_image_url = headers['x-hosted-image-url'];
			return {
				json: compact(json),
				binary: { [field]: await ctx.helpers.prepareBinaryData(data, `${type}.png`, 'image/png') },
			};
		}
	}

	throw new NodeOperationError(ctx.getNode(), `The operation "${operation}" is not supported`, {
		itemIndex: i,
	});
}

/** Flattens the API's { data, plan, usage } answer into one output item. */
function withUsage(response: IDataObject): IDataObject {
	const data = (response.data ?? response) as IDataObject;
	const out: IDataObject = { ...data };
	if (response.plan !== undefined) out.plan = response.plan;
	if (response.usage !== undefined) out.usage = response.usage;
	return out;
}

async function documentResult(
	ctx: Ctx,
	i: number,
	path: string,
	body: IDataObject,
): Promise<INodeExecutionData> {
	const response = await corenexisApiRequest.call(ctx, i, 'POST', path, body);
	return await hostedResult(
		ctx,
		i,
		response,
		`${String(body.filename ?? 'document')}.${String(body.format ?? 'pdf')}`,
	);
}

async function hostedResult(
	ctx: Ctx,
	i: number,
	response: IDataObject,
	fallbackName: string,
): Promise<INodeExecutionData> {
	const json = withUsage(response);
	if (!(ctx.getNodeParameter('download', i, false) as boolean)) return { json };
	const field = ctx.getNodeParameter('outputBinaryPropertyName', i) as string;
	return { json, binary: await attachFiles(ctx, i, json, field, fallbackName) };
}
