import { sveltekit } from '@sveltejs/kit/vite';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
const config = {
	plugins: [sveltekit(),
		NodeGlobalsPolyfillPlugin({
			process: true,
			Buffer: true,
			buffer: true,
			__dirname: true,
			__filename: true,
			global: true,
		})
		],
};

export default config;
