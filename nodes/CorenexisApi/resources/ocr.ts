import type { INodeProperties } from 'n8n-workflow';
import { inputSourceFields, ocrLanguageOptions } from '../shared/fields';

// ---------------------------------------------------------------- Image to Text

const IMG = 'imageOcr';

export const imageOcrDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [IMG] } },
		options: [
			{
				name: 'Extract Text',
				value: 'extractText',
				action: 'Extract text from an image',
				description:
					'Read the text of a photo, screenshot, scan or receipt, as plain text and as Markdown',
			},
		],
		default: 'extractText',
	},
	...inputSourceFields({ resource: IMG, operations: ['extractText'], kind: 'image' }),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [IMG], operation: ['extractText'] } },
		options: [
			{
				displayName: 'Languages',
				name: 'lang',
				type: 'multiOptions',
				options: ocrLanguageOptions,
				default: [],
				description:
					'Languages in the image. Leave empty to detect automatically. Any language other than English alone needs a plan with language selection.',
			},
		],
	},
];

// ---------------------------------------------------------------- PDF to Text

const PDF = 'pdfToText';

export const pdfToTextDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [PDF] } },
		options: [
			{
				name: 'Extract Text and Wait',
				value: 'extract',
				action: 'Extract text from a PDF and wait for it',
				description: 'Submit the PDF, wait until the job finishes and return the text',
			},
			{
				name: 'Get Job',
				value: 'getJob',
				action: 'Get a PDF to text job',
				description: 'Status of a job and, once it is done, its text. Spends no quota.',
			},
			{
				name: 'Submit Job',
				value: 'submit',
				action: 'Submit a PDF to text job',
				description:
					'Start a job and return its job ID at once; collect the result later with Get Job or a webhook',
			},
		],
		default: 'extract',
	},
	...inputSourceFields({ resource: PDF, operations: ['extract', 'submit'], kind: 'pdf' }),
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		default: '',
		required: true,
		description: 'The job_id returned when the job was submitted',
		displayOptions: { show: { resource: [PDF], operation: ['getJob'] } },
	},
	{
		displayName: 'Include Text',
		name: 'includeText',
		type: 'boolean',
		default: true,
		description:
			'Whether to download the extracted text into the output once the job is complete. The text files are also linked under output.',
		displayOptions: { show: { resource: [PDF], operation: ['extract', 'getJob'] } },
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [PDF], operation: ['extract', 'submit'] } },
		options: [
			{
				displayName: 'Languages',
				name: 'lang',
				type: 'multiOptions',
				options: ocrLanguageOptions,
				default: [],
				description:
					'Languages in the document. Defaults to English. Any other choice needs a plan with language selection.',
			},
			{
				displayName: 'Max Wait (Seconds)',
				name: 'maxWait',
				type: 'number',
				typeOptions: { minValue: 10, maxValue: 1800 },
				default: 300,
				description:
					'With Extract Text and Wait: give up after this long and return the job as it stands',
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Markdown',
						value: 'md',
						description: 'Layout kept as Markdown. Needs a plan with Markdown output.',
					},
					{ name: 'Plain Text', value: 'text' },
					{
						name: 'Text and Markdown',
						value: 'both',
						description: 'Needs a plan with Markdown output',
					},
				],
				default: 'text',
			},
			{
				displayName: 'Pages',
				name: 'extractPages',
				type: 'string',
				default: 'all',
				placeholder: '1-5 or 2,4,9',
				description:
					'Which pages to read: all, one page (5), a range (2-9) or a list (2,7,9). Your plan sets the highest page number.',
			},
			{
				displayName: 'Poll Interval (Seconds)',
				name: 'pollInterval',
				type: 'number',
				typeOptions: { minValue: 2, maxValue: 60 },
				default: 5,
				description: 'With Extract Text and Wait: how often to check the job',
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				placeholder: 'https://your-n8n/webhook/pdf-done',
				description:
					'Public address notified with the result when the job finishes, for example an n8n Webhook node. Needs a plan with webhooks.',
			},
		],
	},
];
