import type { INodeProperties } from 'n8n-workflow';
import { downloadFields, inputSourceFields } from '../shared/fields';

// ---------------------------------------------------------------- Account

export const accountDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['account'] } },
		options: [
			{
				name: 'Get',
				value: 'get',
				action: 'Get the account',
				description: 'The API key, its owner, active subscriptions and wallet balance. Free.',
			},
			{
				name: 'Get Subscriptions',
				value: 'getSubscriptions',
				action: 'Get subscriptions',
				description:
					'Every subscribed API with plan, renewal date and calls used this month. Free.',
			},
		],
		default: 'get',
	},
];

// ---------------------------------------------------------------- Email Validator

export const emailValidatorDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['emailValidator'] } },
		options: [
			{
				name: 'Validate',
				value: 'validate',
				action: 'Validate an email address',
				description:
					'Syntax, domain, MX, SPF, DMARC and mailbox checks, plus disposable, role and free provider flags',
			},
		],
		default: 'validate',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		required: true,
		description: 'The address to check',
		displayOptions: { show: { resource: ['emailValidator'], operation: ['validate'] } },
	},
];

// ---------------------------------------------------------------- Disposable Email Detector

export const disposableEmailDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['disposableEmail'] } },
		options: [
			{
				name: 'Check',
				value: 'check',
				action: 'Check for a disposable email',
				description:
					'Whether an address or domain belongs to a disposable or temporary mail provider',
			},
		],
		default: 'check',
	},
	{
		displayName: 'Email or Domain',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		required: true,
		description: 'An email address, a domain or a URL; the domain is taken from it',
		displayOptions: { show: { resource: ['disposableEmail'], operation: ['check'] } },
	},
];

// ---------------------------------------------------------------- Image Conversion

const CONV = 'imageConversion';

export const imageConversionDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [CONV] } },
		options: [
			{
				name: 'Convert',
				value: 'convert',
				action: 'Convert an image',
				description:
					'Change the format, and optionally resize or compress. Reads HEIC, TIFF, PSD, AVIF and more.',
			},
		],
		default: 'convert',
	},
	...inputSourceFields({ resource: CONV, operations: ['convert'], kind: 'image' }),
	{
		displayName: 'Target Format',
		name: 'format',
		type: 'options',
		options: [
			{ name: 'AVIF', value: 'avif' },
			{ name: 'BMP', value: 'bmp' },
			{ name: 'DDS', value: 'dds' },
			{ name: 'EPS', value: 'eps' },
			{ name: 'EXR', value: 'exr' },
			{ name: 'GIF', value: 'gif' },
			{ name: 'HDR', value: 'hdr' },
			{ name: 'HEIC', value: 'heic' },
			{ name: 'HEIF', value: 'heif' },
			{ name: 'ICO', value: 'ico' },
			{ name: 'JPEG', value: 'jpg' },
			{ name: 'JPEG 2000', value: 'jp2' },
			{ name: 'JPEG XL', value: 'jxl' },
			{ name: 'PCX', value: 'pcx' },
			{ name: 'PDF', value: 'pdf' },
			{ name: 'PNG', value: 'png' },
			{ name: 'PSD', value: 'psd' },
			{ name: 'TGA', value: 'tga' },
			{ name: 'TIFF', value: 'tiff' },
			{ name: 'WBMP', value: 'wbmp' },
			{ name: 'WebP', value: 'webp' },
			{ name: 'XBM', value: 'xbm' },
			{ name: 'XPM', value: 'xpm' },
		],
		default: 'webp',
		description: 'Format to convert to',
		displayOptions: { show: { resource: [CONV], operation: ['convert'] } },
	},
	...downloadFields(CONV, ['convert'], 'converted image'),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [CONV], operation: ['convert'] } },
		options: [
			{
				displayName: 'Height (Px)',
				name: 'height',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 0,
				description:
					'Resize to this height. With only one of width and height the aspect ratio is kept; with both the image takes that exact size.',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'number',
				typeOptions: { minValue: 0, maxValue: 100 },
				default: 85,
				description: 'Compression quality from 0 to 100, for formats that use it',
			},
			{
				displayName: 'Width (Px)',
				name: 'width',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 0,
				description:
					'Resize to this width. With only one of width and height the aspect ratio is kept; with both the image takes that exact size.',
			},
		],
	},
];

// ---------------------------------------------------------------- Image CDN

const CDN = 'imageCdn';

export const imageCdnDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [CDN] } },
		options: [
			{
				name: 'Upload',
				value: 'upload',
				action: 'Upload an image',
				description: 'Host an image and get a fast delivery link, optionally resized or compressed',
			},
		],
		default: 'upload',
	},
	...inputSourceFields({ resource: CDN, operations: ['upload'], kind: 'image' }),
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [CDN], operation: ['upload'] } },
		options: [
			{
				displayName: 'Keep For (Hours)',
				name: 'duration',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 2,
				description: 'How long the link stays live, in hours. Your plan sets the maximum.',
			},
			{
				displayName: 'Height (Px)',
				name: 'height',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 0,
				description: 'Resize to this height',
			},
			{
				displayName: 'Quality',
				name: 'quality',
				type: 'number',
				typeOptions: { minValue: 40, maxValue: 100 },
				default: 85,
				description: 'Compression quality from 40 to 100',
			},
			{
				displayName: 'Width (Px)',
				name: 'width',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 0,
				description: 'Resize to this width',
			},
		],
	},
];

// ---------------------------------------------------------------- QR Code and Barcode

const QR = 'qrBarcode';

export const qrBarcodeDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: [QR] } },
		options: [
			{
				name: 'Generate',
				value: 'generate',
				action: 'Generate a QR code or barcode',
				description:
					'A QR code, a UPI payment QR, a QR for a hosted picture, or a Code 128, EAN-13 or UPC-A barcode',
			},
		],
		default: 'generate',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'Barcode: Code 128', value: 'code128', description: 'Up to 80 characters' },
			{
				name: 'Barcode: EAN-13',
				value: 'ean13',
				description: 'Exactly 13 digits with a valid check digit',
			},
			{
				name: 'Barcode: UPC-A',
				value: 'upc',
				description: 'Exactly 12 digits with a valid check digit',
			},
			{ name: 'QR Code', value: 'qr', description: 'Any text or link' },
			{
				name: 'QR Code for an Image',
				value: 'image',
				description: 'The picture is hosted for 30 days and the QR code links to it',
			},
			{ name: 'UPI Payment QR', value: 'upi', description: 'An Indian UPI payment code' },
		],
		default: 'qr',
		displayOptions: { show: { resource: [QR], operation: ['generate'] } },
	},
	{
		displayName: 'Data',
		name: 'data',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com',
		description: 'What to encode',
		displayOptions: {
			show: { resource: [QR], operation: ['generate'], type: ['qr', 'code128', 'ean13', 'upc'] },
		},
	},
	{
		displayName: 'Image URL',
		name: 'data',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'https://example.com/photo.png',
		description: 'Public link to a PNG, JPG, WEBP or GIF picture',
		displayOptions: { show: { resource: [QR], operation: ['generate'], type: ['image'] } },
	},
	{
		displayName: 'Payee UPI ID',
		name: 'pa',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'name@bank',
		description: 'The payee address, up to 50 characters',
		displayOptions: { show: { resource: [QR], operation: ['generate'], type: ['upi'] } },
	},
	{
		displayName: 'Payee Name',
		name: 'pn',
		type: 'string',
		default: '',
		description: 'Shown to the payer, up to 100 characters',
		displayOptions: { show: { resource: [QR], operation: ['generate'], type: ['upi'] } },
	},
	{
		displayName: 'Amount (INR)',
		name: 'am',
		type: 'string',
		default: '',
		placeholder: '499.00',
		description: 'More than 0 and at most 100000. Leave empty to let the payer choose.',
		displayOptions: { show: { resource: [QR], operation: ['generate'], type: ['upi'] } },
	},
	{
		displayName: 'Note',
		name: 'tn',
		type: 'string',
		default: '',
		description: 'A note shown to the payer, up to 80 characters',
		displayOptions: { show: { resource: [QR], operation: ['generate'], type: ['upi'] } },
	},
	{
		displayName: 'Output',
		name: 'output',
		type: 'options',
		options: [
			{
				name: 'Binary File',
				value: 'binary',
				description: 'The PNG in the item, ready to send or save',
			},
			{
				name: 'Hosted Link',
				value: 'url',
				description: 'A link to the PNG, valid for about two hours',
			},
		],
		default: 'binary',
		displayOptions: { show: { resource: [QR], operation: ['generate'] } },
	},
	{
		displayName: 'Put Output File in Field',
		name: 'outputBinaryPropertyName',
		type: 'string',
		default: 'data',
		required: true,
		hint: 'The name of the output binary field to put the file in',
		displayOptions: { show: { resource: [QR], operation: ['generate'], output: ['binary'] } },
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: [QR], operation: ['generate'] } },
		options: [
			{
				displayName: 'Logo URL',
				name: 'logo',
				type: 'string',
				default: '',
				placeholder: 'https://example.com/logo.png',
				description:
					'Public link to a logo placed in the middle of a QR code (QR, UPI and image types). Your plan sets the largest logo.',
			},
			{
				displayName: 'Size (Px)',
				name: 'size',
				type: 'number',
				typeOptions: { minValue: 100, maxValue: 1000 },
				default: 300,
				description: 'Image width in pixels, 100 to 1000. Your plan sets the maximum.',
			},
		],
	},
];
