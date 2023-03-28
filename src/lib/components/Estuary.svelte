<script lang="ts" >
    let pathToFile = "";
    let name = "";
    let fileHash = "";
    let fileSize = "";
    let response = "";
    let file : HTMLInputElement;
    let error = "";

    const uploadFile = async () => {
        if (!file.files || !file.files[0]) {
            error = "Please select a file";
            return;
        }
        if (!name) {
            error = "Please enter a file name";
            return;
        }
        const formData = {
            file: file.files[0].path,
            name: name
        }
        console.log(formData)
        const res = await fetch('api/upload', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        const resAwait = await res;
        if (!resAwait.ok) {
            error = resAwait.statusText;
            return;
        }
        console.log(res)
        const responseJson = await res.json();
        
        console.log(responseJson)
        if (responseJson.error) {
            error = responseJson.error;
            return;
        }
        response = responseJson.output;
    }

</script>

<div class="m-4 my-auto border-2 border-gray-600 rounded-md p-8">
    
    <h1>Upload a file to IPFS</h1>
    <h1>{pathToFile}</h1>
    <div class="mt-4">
        <label for="file" class="mr-4">File:</label>
        <input type="file" id="file" name="file" placeholder="Select a file" bind:this={file}>
    </div>

    <div class="mt-4 ">
        <label for="file" class="mr-4">File Name:</label>
        <input type="text" id="name" name="name" placeholder="Enter a file name" class="bg-black" bind:value="{name}">
    </div>

    <div class="mt-4">
        <label for="file" class="mr-4">File Hash:</label>
        <input type="text" id="fileHash" name="fileHash" placeholder="Enter a file hash" class="bg-black" bind:value="{fileHash}">
    </div>

    <div class="mt-4">
        <label for="file" class="mr-4">File Size:</label>
        <input type="text" id="fileSize" name="fileSize" placeholder="Enter a file size" class="bg-black" bind:value="{fileSize}">
    </div>

    <div class="mt-4">
        <button class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition-all" on:click={uploadFile}>Upload</button>
    </div>
    
</div>
{#if error}
<div class="m-4 my-auto text-red-400">
    <h1>Error</h1>
    <p>{error}</p>
</div>
{/if}
{#if response}
<div class="m-4 mt-8 my-auto w-full flex-wrap">
    <h1>Response</h1>
    <p>{response}</p>
</div>
{/if}