import { ESTUARY_KEY_DEMO } from '$lib/server/config';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
export const POST = async ({ request }) => {
	const body = await request.json();
	const file = body.file;
	const name = body.name;
	console.log('name', name);
	console.log('file', file);
	let data = new FormData();
	data.append('data', fs.createReadStream(file));
	data.append('filename', name);

	let config = {
		method: 'post',
		url: 'https://api.estuary.tech/content/add',
		headers: {
			Accept: 'application/json',
			Authorization: 'Bearer ' + ESTUARY_KEY_DEMO,
			...data.getHeaders(),
		},
		data: data,
	};
	let responseData = '';

	return axios(config)
		.then((response: any) => {
			console.log(JSON.stringify(response.data));
			responseData = JSON.stringify(response.data);
			let body = JSON.stringify({
				message: 'success',
				output: responseData,
			});
			return new Response(body, {
				status: 200,
			});
		})
		.catch((error: any) => {
			console.log(error);
			return 'error';
		})
		.finally(() => {
			if (responseData === '') {
				responseData = 'error';
			}
			let bodyText = JSON.stringify({
				message: 'success',
				output: responseData,
			});
			return new Response(bodyText, {
				status: 200,
			});
		});
};
