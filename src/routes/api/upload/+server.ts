import { ESTUARY_KEY_DEMO } from '$lib/server/config';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import spawn from 'child_process';
import path from 'path';

export const POST = async ({ request }) => {
	const body = await request.formData();
	const file = body.get('file');
	const name = body.get('name');

	console.log('name', name);
	console.log('file', file);
	const key = '0123456789abcdef';
	const salt = '0123456789abcdef';

	const filePath = `static/uploads/${name}`;
	await fs.promises.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

	let pyProg = spawn.spawn('python', [
		'src/aesEncryption.py',
		'-k',
		key,
		'-i',
		filePath,
		'-o',
		`${filePath}.enc`,
		'-c',
		path.join('static', 'uploads', `checksum${name}.txt`),
		'-m',
		'encrypt',
		'-s',
		salt,
	]);

	pyProg.stdout.on('data', function (data) {
		console.log(data.toString());
	});

	pyProg.stderr.on('data', (data) => {
		console.log(data.toString());
	});

	const response = await new Promise((resolve) => {
		pyProg.on('exit', (code) => {
			if (code !== 0) {
				console.log(`Node process exited with code ${code}`);
				resolve(
					new Response(JSON.stringify({ message: 'error' }), {
						status: 500,
					}),
				);
			} else {
				let fileName = 'static/uploads/' + name + '.enc';
				let data = new FormData();
				data.append('data', fs.createReadStream(fileName));
				data.append('fileName', name);
				console.log('data', data);
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
				axios(config)
					.then((response) => {
						console.log(JSON.stringify(response.data));
						responseData = JSON.stringify(response.data);
						let body = JSON.stringify({
							message: 'success',
							output: responseData,
						});
						resolve(
							new Response(body, {
								status: 200,
							}),
						);
					})
					.catch((error) => {
						console.log(error);
						resolve(
							new Response(JSON.stringify({ message: 'error' }), {
								status: 500,
							}),
						);
					});
			}
		});
	});

	return response;
};
