import type { INodeProperties, INodePropertyOptions } from 'n8n-workflow';

/** Page sizes the PDF renderers accept. */
export const pageSizeOptions: INodePropertyOptions[] = [
	{ name: 'A3', value: 'a3' },
	{ name: 'A4', value: 'a4' },
	{ name: 'A5', value: 'a5' },
	{ name: 'Legal', value: 'legal' },
	{ name: 'Letter', value: 'letter' },
	{ name: 'Tabloid', value: 'tabloid' },
];

/** OCR languages, as the three letter codes the OCR APIs read. */
export const ocrLanguageOptions: INodePropertyOptions[] = [
	{ name: 'Arabic', value: 'ara' },
	{ name: 'Bengali', value: 'ben' },
	{ name: 'Chinese (Simplified)', value: 'chi_sim' },
	{ name: 'Chinese (Traditional)', value: 'chi_tra' },
	{ name: 'Dutch', value: 'nld' },
	{ name: 'English', value: 'eng' },
	{ name: 'French', value: 'fra' },
	{ name: 'German', value: 'deu' },
	{ name: 'Gujarati', value: 'guj' },
	{ name: 'Hebrew', value: 'heb' },
	{ name: 'Hindi', value: 'hin' },
	{ name: 'Indonesian', value: 'ind' },
	{ name: 'Italian', value: 'ita' },
	{ name: 'Japanese', value: 'jpn' },
	{ name: 'Kannada', value: 'kan' },
	{ name: 'Korean', value: 'kor' },
	{ name: 'Malayalam', value: 'mal' },
	{ name: 'Marathi', value: 'mar' },
	{ name: 'Persian', value: 'fas' },
	{ name: 'Polish', value: 'pol' },
	{ name: 'Portuguese', value: 'por' },
	{ name: 'Punjabi', value: 'pan' },
	{ name: 'Russian', value: 'rus' },
	{ name: 'Spanish', value: 'spa' },
	{ name: 'Tamil', value: 'tam' },
	{ name: 'Telugu', value: 'tel' },
	{ name: 'Thai', value: 'tha' },
	{ name: 'Turkish', value: 'tur' },
	{ name: 'Urdu', value: 'urd' },
	{ name: 'Vietnamese', value: 'vie' },
];

/** The four page margins, in millimetres (0 to 100). */
export function marginFields(defaults: {
	top: number;
	right: number;
	bottom: number;
	left: number;
}): INodeProperties[] {
	const margin = (side: string, value: number): INodeProperties => ({
		displayName: `Margin ${side} (Mm)`,
		name: `margin${side}`,
		type: 'number',
		typeOptions: { minValue: 0, maxValue: 100 },
		default: value,
		description: `${side} page margin in millimetres, 0 to 100`,
	});
	return [
		margin('Bottom', defaults.bottom),
		margin('Left', defaults.left),
		margin('Right', defaults.right),
		margin('Top', defaults.top),
	];
}

/** "Where does the input come from" plus its two inputs, for one resource. */
export function inputSourceFields(opts: {
	resource: string;
	operations: string[];
	kind: 'image' | 'pdf';
}): INodeProperties[] {
	const show = { resource: [opts.resource], operation: opts.operations };
	const noun = opts.kind === 'image' ? 'image' : 'PDF';
	return [
		{
			displayName: 'Input Type',
			name: 'inputType',
			type: 'options',
			options: [
				{ name: 'Binary File', value: 'binary', description: `The ${noun} from an earlier node` },
				{ name: 'URL', value: 'url', description: `A public link to the ${noun}` },
			],
			default: 'binary',
			displayOptions: { show },
		},
		{
			displayName: 'Input Binary Field',
			name: 'binaryPropertyName',
			type: 'string',
			default: 'data',
			required: true,
			hint: `The name of the input field holding the ${noun} file`,
			displayOptions: { show: { ...show, inputType: ['binary'] } },
		},
		{
			displayName: `${opts.kind === 'image' ? 'Image' : 'PDF'} URL`,
			name: 'fileUrl',
			type: 'string',
			default: '',
			required: true,
			placeholder:
				opts.kind === 'image' ? 'https://example.com/photo.jpg' : 'https://example.com/report.pdf',
			description: `Public http(s) link to the ${noun}`,
			displayOptions: { show: { ...show, inputType: ['url'] } },
		},
	];
}

/** "Download the result as a file" switch for APIs that answer with hosted links. */
export function downloadFields(
	resource: string,
	operations: string[],
	what: string,
): INodeProperties[] {
	const show = { resource: [resource], operation: operations };
	return [
		{
			displayName: 'Download Result',
			name: 'download',
			type: 'boolean',
			default: true,
			description: `Whether to download the ${what} into the item as a binary file. The hosted link is returned either way and expires after a while.`,
			displayOptions: { show },
		},
		{
			displayName: 'Put Output File in Field',
			name: 'outputBinaryPropertyName',
			type: 'string',
			default: 'data',
			required: true,
			hint: 'The name of the output binary field to put the file in',
			displayOptions: { show: { ...show, download: [true] } },
		},
	];
}
