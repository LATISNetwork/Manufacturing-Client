<script>
	import Signup from '$lib/components/Signup.svelte';
	import { componentType, loggedIn, ComponentType } from '$lib/stores/stores';
	import Icon from '@iconify/svelte';
	let email = '';
	let password = '';
	let error = '';
	let loggingIn = false;
	let signingUp = false;
	const login = async () => {
		if (!email.includes('@') || !email.includes('.')) return (error = 'Invalid email');
		if (password.length < 6) return (error = 'Password must be at least 6 characters long');
		error = '';
		loggingIn = true;
		const signIn_res = await fetch(`/api/auth`, {
			method: 'POST',
			headers: new Headers({ 'Content-Type': 'application/json' }),
			credentials: 'same-origin',
			body: JSON.stringify({ email, password }),
		});

		if (!signIn_res.ok) {
			loggingIn = false;
			return (error = 'User does not exist or incorrect password');
		}
		loggingIn = false;
		componentType.set(ComponentType.PORTAL);
		loggedIn.set(true);
	};
</script>

<div class="flex h-screen items-center justify-center w-full">
	<div class="bg-emerald-500 bg-opacity-10 rounded-lg shadow-md p-8 w-1/4">
		{#if !signingUp}
			<h2 class="text-4xl font-bold mb-4 text-center">Login</h2>
			<form>
				<div class="mb-4">
					<label class="block  font-bold mb-2" for="email">Email</label>
					<input
						class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black bg-opacity-30 border-emerald-500"
						id="email"
						type="email"
						placeholder="Enter your email"
						bind:value={email}
					/>
				</div>
				<div class="mb-4">
					<label class="block  font-bold mb-2" for="password">Password</label>
					<input
						class="border rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-black bg-opacity-30 border-emerald-500"
						id="password"
						type="password"
						placeholder="Enter your password"
						bind:value={password}
					/>
				</div>
				<button
					class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
					type="submit"
					on:click={login}
				>
					Login
				</button>
			</form>

			<button
				on:click={() => (signingUp = true)}
				class="mt-4 hover:opacity-80 transition-all"
			>
				Need an account? Sign Up Here.
			</button>
			{#if loggingIn}
				<div class=" text-white p-2 rounded-lg mt-4">Logging in...</div>
			{/if}
		{/if}
		{#if signingUp}
			<Signup />
			<button
				on:click={() => (signingUp = false)}
				class="mt-4 hover:opacity-80 transition-all"
			>
				Have an account? Login Here.
			</button>
		{/if}
		{#if error}
			<div class="bg-red-500 text-white p-2 rounded-lg mt-4">
				{error}
			</div>
		{/if}
	</div>
</div>
