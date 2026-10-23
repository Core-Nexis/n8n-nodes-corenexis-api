import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class CorenexisApi implements ICredentialType {
	name = 'corenexisApi';

	displayName = 'Corenexis API';

	icon: Icon = { light: 'file:../icons/corenexis.svg', dark: 'file:../icons/corenexis.dark.svg' };

	documentationUrl =
		'https://github.com/Core-Nexis/n8n-nodes-corenexis-api?tab=readme-ov-file#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'Create a key at dash.corenexis.com under API Keys. One key works for every API you subscribe to; each API has a free plan.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
			},
		},
	};

	// The account check of the Corenexis MCP server is free and spends no quota.
	// A wrong key still answers HTTP 200, with result.isError set to true.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.corenexis.com',
			url: '/mcp/server',
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'User-Agent': 'n8n-nodes-corenexis-api',
			},
			body: {
				jsonrpc: '2.0',
				id: 1,
				method: 'tools/call',
				params: { name: 'corenexis_account', arguments: {} },
			},
		},
		rules: [
			{
				type: 'responseSuccessBody',
				properties: {
					key: 'result.isError',
					value: true,
					message: 'The API key was not accepted. Check it at dash.corenexis.com under API Keys.',
				},
			},
		],
	};
}
