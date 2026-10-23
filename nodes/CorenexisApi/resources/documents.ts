import type { INodeProperties } from 'n8n-workflow';
import { downloadFields, marginFields, pageSizeOptions } from '../shared/fields';

// ---------------------------------------------------------------- Markdown to PDF

const MD = 'markdownToPdf';

export const markdownToPdfDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [MD] } },
		options: [
			{
				name: 'Convert',
				value: 'convert',
				action: 'Convert markdown to a PDF',
				description: 'Turn Markdown into a print-ready PDF or into page images',
			},
		],
		default: 'convert',
	},
	{
		displayName: 'Markdown Source',
		name: 'markdownSource',
		type: 'options',
		options: [
			{ name: 'Binary File', value: 'binary', description: 'A .md file from an earlier node' },
			{
				name: 'Text',
				value: 'text',
				description: 'Markdown typed here or mapped from an earlier node',
			},
		],
		default: 'text',
		displayOptions: { show: { resource: [MD], operation: ['convert'] } },
	},
	{
		displayName: 'Markdown',
		name: 'markdown',
		type: 'string',
		typeOptions: { rows: 8 },
		default: '',
		required: true,
		placeholder: '# Invoice\n\n| Item | Amount |\n|---|---|\n| Design | 400 |',
		description: 'The Markdown document itself, up to 4 MB',
		displayOptions: { show: { resource: [MD], operation: ['convert'], markdownSource: ['text'] } },
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		hint: 'The name of the input field holding the Markdown file',
		displayOptions: {
			show: { resource: [MD], operation: ['convert'], markdownSource: ['binary'] },
		},
	},
	{
		displayName: 'Output Format',
		name: 'format',
		type: 'options',
		options: [
			{ name: 'PDF', value: 'pdf' },
			{ name: 'PNG Images', value: 'png', description: 'Page images. Needs a paid plan.' },
		],
		default: 'pdf',
		displayOptions: { show: { resource: [MD], operation: ['convert'] } },
	},
	...downloadFields(MD, ['convert'], 'PDF or images'),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [MD], operation: ['convert'] } },
		options: [
			{
				displayName: 'Code Font',
				name: 'monoFont',
				type: 'options',
				options: [
					{ name: 'Fira Code', value: 'firacode' },
					{ name: 'IBM Plex Mono', value: 'ibmplexmono' },
					{ name: 'JetBrains Mono', value: 'jetbrainsmono' },
				],
				default: 'jetbrainsmono',
				description: 'Typeface for code blocks. Needs a plan with custom themes.',
			},
			{
				displayName: 'Colors',
				name: 'colors',
				type: 'fixedCollection',
				placeholder: 'Add Colors',
				default: {},
				description: 'Custom colour palette. Needs a plan with custom themes.',
				options: [
					{
						displayName: 'Palette',
						name: 'palette',
						values: [
							{ displayName: 'Accent', name: 'accent', type: 'color', default: '' },
							{ displayName: 'Background', name: 'background', type: 'color', default: '' },
							{ displayName: 'Border', name: 'border', type: 'color', default: '' },
							{ displayName: 'Code Background', name: 'code_bg', type: 'color', default: '' },
							{ displayName: 'Code Text', name: 'code_text', type: 'color', default: '' },
							{ displayName: 'Heading', name: 'heading', type: 'color', default: '' },
							{ displayName: 'Link', name: 'link', type: 'color', default: '' },
							{ displayName: 'Quote', name: 'quote', type: 'color', default: '' },
							{
								displayName: 'Table Header Background',
								name: 'table_header_bg',
								type: 'color',
								default: '',
							},
							{ displayName: 'Text', name: 'text', type: 'color', default: '' },
						],
					},
				],
			},
			{
				displayName: 'File Name',
				name: 'filename',
				type: 'string',
				default: 'document',
				description:
					'Name of the delivered file without extension: letters, digits, dot, dash and underscore, up to 80 characters',
			},
			{
				displayName: 'Font',
				name: 'font',
				type: 'options',
				options: [
					{ name: 'IBM Plex Sans', value: 'ibmplexsans' },
					{ name: 'IBM Plex Serif', value: 'ibmplexserif' },
					{ name: 'Lato', value: 'lato' },
					{ name: 'Liberation Serif', value: 'liberationserif' },
					{ name: 'Lohit Devanagari', value: 'lohitdevanagari' },
					{ name: 'Montserrat', value: 'montserrat' },
					{ name: 'Nunito', value: 'nunito' },
					{ name: 'Open Sans', value: 'opensans' },
					{ name: 'Roboto', value: 'roboto' },
				],
				default: 'roboto',
				description: 'Typeface for body text. Needs a plan with custom themes.',
			},
			{
				displayName: 'Font Size (Pt)',
				name: 'fontSize',
				type: 'number',
				typeOptions: { minValue: 7, maxValue: 18 },
				default: 11,
				description: 'Body text size in points, 7 to 18. Needs a plan with custom themes.',
			},
			{
				displayName: 'Footer Text',
				name: 'footerText',
				type: 'string',
				default: '',
				description:
					'Running footer on every page, up to 200 characters. {PAGENO} and {nb} become the page number and page count. Needs a plan with headers and footers.',
			},
			{
				displayName: 'Header Text',
				name: 'headerText',
				type: 'string',
				default: '',
				description:
					'Running header on every page, up to 200 characters. {PAGENO} and {nb} become the page number and page count. Needs a plan with headers and footers.',
			},
			...marginFields({ top: 20, right: 15, bottom: 20, left: 15 }),
			{
				displayName: 'Orientation',
				name: 'orientation',
				type: 'options',
				options: [
					{ name: 'Landscape', value: 'landscape' },
					{ name: 'Portrait', value: 'portrait' },
				],
				default: 'portrait',
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'options',
				options: pageSizeOptions,
				default: 'a4',
			},
			{
				displayName: 'PNG Mode',
				name: 'pngMode',
				type: 'options',
				options: [
					{ name: 'All Pages', value: 'stack', description: 'Every page, in order' },
					{ name: 'First Page', value: 'first', description: 'Page one only' },
					{ name: 'One Page', value: 'page', description: 'The page set in PNG Page' },
				],
				default: 'stack',
				description: 'Which pages to render when the output format is PNG',
			},
			{
				displayName: 'PNG Page',
				name: 'pngPage',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 1,
				description: 'Page to render when PNG Mode is One Page, counting from 1',
			},
			{
				displayName: 'PNG Resolution (DPI)',
				name: 'pngDpi',
				type: 'number',
				typeOptions: { minValue: 72, maxValue: 300 },
				default: 144,
				description: 'Resolution of PNG output, 72 to 300',
			},
			{
				displayName: 'Theme',
				name: 'theme',
				type: 'options',
				options: [
					{ name: 'Dark', value: 'dark', description: 'Needs a plan with custom themes' },
					{ name: 'Light', value: 'light' },
				],
				default: 'light',
			},
		],
	},
];

// ---------------------------------------------------------------- HTML to PDF

const HTML = 'htmlToPdf';

export const htmlToPdfDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [HTML] } },
		options: [
			{
				name: 'Convert',
				value: 'convert',
				action: 'Convert HTML to a PDF',
				description: 'Render HTML and CSS to a PDF or a screenshot with a real browser engine',
			},
		],
		default: 'convert',
	},
	{
		displayName: 'HTML Source',
		name: 'htmlSource',
		type: 'options',
		options: [
			{ name: 'Binary File', value: 'binary', description: 'An .html file from an earlier node' },
			{
				name: 'Text',
				value: 'text',
				description: 'HTML typed here or mapped from an earlier node',
			},
		],
		default: 'text',
		displayOptions: { show: { resource: [HTML], operation: ['convert'] } },
	},
	{
		displayName: 'HTML',
		name: 'html',
		type: 'string',
		typeOptions: { rows: 8 },
		default: '',
		required: true,
		placeholder: '<html><body><h1>Invoice</h1></body></html>',
		description: 'The full HTML document including any inline CSS, up to 2 MB',
		displayOptions: { show: { resource: [HTML], operation: ['convert'], htmlSource: ['text'] } },
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		hint: 'The name of the input field holding the HTML file',
		displayOptions: { show: { resource: [HTML], operation: ['convert'], htmlSource: ['binary'] } },
	},
	{
		displayName: 'Output Format',
		name: 'format',
		type: 'options',
		options: [
			{ name: 'PDF', value: 'pdf' },
			{
				name: 'PNG Images',
				value: 'png',
				description: 'Page images or a screenshot. Needs a paid plan.',
			},
		],
		default: 'pdf',
		displayOptions: { show: { resource: [HTML], operation: ['convert'] } },
	},
	...downloadFields(HTML, ['convert'], 'PDF or images'),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [HTML], operation: ['convert'] } },
		options: [
			{
				displayName: 'Custom Page Height (Mm)',
				name: 'pageHeight',
				type: 'number',
				typeOptions: { minValue: 20, maxValue: 2000 },
				default: 297,
				description:
					'Page height in millimetres, 20 to 2000. Set it together with Custom Page Width; it replaces Page Size.',
			},
			{
				displayName: 'Custom Page Width (Mm)',
				name: 'pageWidth',
				type: 'number',
				typeOptions: { minValue: 20, maxValue: 2000 },
				default: 210,
				description:
					'Page width in millimetres, 20 to 2000. Set it together with Custom Page Height; it replaces Page Size.',
			},
			{
				displayName: 'File Name',
				name: 'filename',
				type: 'string',
				default: 'document',
				description:
					'Name of the delivered file without extension: letters, digits, dot, dash and underscore, up to 80 characters',
			},
			{
				displayName: 'Footer HTML',
				name: 'footerHtml',
				type: 'string',
				default: '',
				placeholder:
					'<div style="font-size:9px;width:100%;text-align:center">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
				description:
					'Running footer, up to 2000 characters of HTML. The classes pageNumber and totalPages are filled in. Needs a plan with headers and footers.',
			},
			{
				displayName: 'Header HTML',
				name: 'headerHtml',
				type: 'string',
				default: '',
				description:
					'Running header, up to 2000 characters of HTML. The classes pageNumber and totalPages are filled in. Needs a plan with headers and footers.',
			},
			...marginFields({ top: 20, right: 15, bottom: 20, left: 15 }),
			{
				displayName: 'Orientation',
				name: 'orientation',
				type: 'options',
				options: [
					{ name: 'Landscape', value: 'landscape' },
					{ name: 'Portrait', value: 'portrait' },
				],
				default: 'portrait',
			},
			{
				displayName: 'Page Size',
				name: 'pageSize',
				type: 'options',
				options: pageSizeOptions,
				default: 'a4',
			},
			{
				displayName: 'PNG Mode',
				name: 'pngMode',
				type: 'options',
				options: [
					{ name: 'All Pages', value: 'stack', description: 'Every page, in order' },
					{ name: 'First Page', value: 'first', description: 'Page one only' },
					{ name: 'One Page', value: 'page', description: 'The page set in PNG Page' },
					{
						name: 'Viewport Screenshot',
						value: 'viewport',
						description: 'One continuous screenshot, for capturing a design rather than a document',
					},
				],
				default: 'stack',
				description: 'How to turn the render into images when the output format is PNG',
			},
			{
				displayName: 'PNG Page',
				name: 'pngPage',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 1,
				description: 'Page to render when PNG Mode is One Page, counting from 1',
			},
			{
				displayName: 'PNG Resolution (DPI)',
				name: 'pngDpi',
				type: 'number',
				typeOptions: { minValue: 72, maxValue: 300 },
				default: 144,
				description: 'Resolution of PNG output, 72 to 300',
			},
			{
				displayName: 'Run JavaScript',
				name: 'js',
				type: 'boolean',
				default: false,
				description:
					"Whether to run the page's JavaScript before capturing. Needs a plan with JavaScript rendering.",
			},
			{
				displayName: 'Scale',
				name: 'scale',
				type: 'number',
				typeOptions: { minValue: 0.1, maxValue: 2, numberPrecision: 2 },
				default: 1,
				description:
					'Zoom applied before rendering, 0.1 to 2, for example 0.8 to fit more on a page',
			},
			{
				displayName: 'Wait After Load (Ms)',
				name: 'waitMs',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 5000 },
				default: 0,
				description:
					'Milliseconds to wait after the page loads before capturing, 0 to 5000. Only used with Run JavaScript.',
			},
		],
	},
];
