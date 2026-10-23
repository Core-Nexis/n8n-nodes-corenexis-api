import {
	NodeApiError,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type IHttpRequestMethods,
	type IHttpRequestOptions,
	type JsonObject,
} from 'n8n-workflow';

export const CORENEXIS_BASE_URL = 'https://api.corenexis.com';

/**
 * The API sits behind a firewall that rejects requests with a missing or
 * generic client User-Agent, so every request names this package.
 */
export const CORENEXIS_USER_AGENT =
	'n8n-nodes-corenexis-api (+https://github.com/Core-Nexis/n8n-nodes-corenexis-api)';

/** Rendering, OCR and image work can take a while; the API itself stops at about 90 seconds. */
export const REQUEST_TIMEOUT_MS = 120_000;

/** One authenticated call to the Corenexis API. Returns the parsed JSON body. */
export async function corenexisApiRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	method: IHttpRequestMethods,
	path: string,
	body?: IDataObject,
	qs?: IDataObject,
): Promise<IDataObject> {
	const options: IHttpRequestOptions = {
		method,
		url: `${CORENEXIS_BASE_URL}${path}`,
		json: true,
		timeout: REQUEST_TIMEOUT_MS,
		headers: {
			Accept: 'application/json',
			'User-Agent': CORENEXIS_USER_AGENT,
		},
	};
	if (body !== undefined) options.body = body;
	if (qs !== undefined) options.qs = qs;

	try {
		return (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'corenexisApi',
			options,
		)) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
	}
}

/** An authenticated call whose answer is a file (the QR and barcode API's binary output). */
export async function corenexisApiBinaryRequest(
	this: IExecuteFunctions,
	itemIndex: number,
	path: string,
	qs: IDataObject,
): Promise<{ data: Buffer; headers: IDataObject }> {
	// Sent as a query string: the QR and barcode API reads the query first, and
	// the answer is the raw PNG rather than JSON.
	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${CORENEXIS_BASE_URL}${path}`,
		qs,
		encoding: 'arraybuffer',
		returnFullResponse: true,
		timeout: REQUEST_TIMEOUT_MS,
		headers: {
			Accept: 'image/png, application/json',
			'User-Agent': CORENEXIS_USER_AGENT,
		},
	};

	try {
		const response = (await this.helpers.httpRequestWithAuthentication.call(
			this,
			'corenexisApi',
			options,
		)) as { body: ArrayBuffer; headers: IDataObject };
		return { data: Buffer.from(response.body), headers: response.headers ?? {} };
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex });
	}
}

/**
 * Calls one of the free account tools of the Corenexis MCP server. They read the
 * key, the account and its subscriptions and never spend any quota.
 */
export async function corenexisAccountTool(
	this: IExecuteFunctions,
	itemIndex: number,
	tool: 'corenexis_account' | 'corenexis_subscriptions',
): Promise<IDataObject> {
	const response = await corenexisApiRequest.call(this, itemIndex, 'POST', '/mcp/server', {
		jsonrpc: '2.0',
		id: 1,
		method: 'tools/call',
		params: { name: tool, arguments: {} },
	});

	const result = (response.result ?? {}) as IDataObject;
	const content = (result.content as IDataObject[] | undefined) ?? [];
	const text = String(content[0]?.text ?? '');
	if (result.isError === true || response.error) {
		const message = text || String((response.error as IDataObject | undefined)?.message ?? '');
		throw new NodeOperationError(
			this.getNode(),
			message || 'The Corenexis API refused the request',
			{
				itemIndex,
			},
		);
	}
	try {
		return JSON.parse(text) as IDataObject;
	} catch {
		return { result: text };
	}
}

/** Downloads a hosted result file (the API answers with links that expire). */
export async function downloadFile(
	this: IExecuteFunctions,
	itemIndex: number,
	url: string,
): Promise<{ data: Buffer; mimeType?: string }> {
	try {
		const response = (await this.helpers.httpRequest({
			method: 'GET',
			url,
			encoding: 'arraybuffer',
			returnFullResponse: true,
			timeout: REQUEST_TIMEOUT_MS,
			headers: { 'User-Agent': CORENEXIS_USER_AGENT },
		})) as { body: ArrayBuffer; headers: IDataObject };
		const contentType = response.headers?.['content-type'];
		return {
			data: Buffer.from(response.body),
			mimeType: typeof contentType === 'string' ? contentType.split(';')[0] : undefined,
		};
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			itemIndex,
			message: `Could not download the result file: ${url}`,
		});
	}
}
