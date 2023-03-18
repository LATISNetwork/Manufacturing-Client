console.clear();
const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default;
const AppHBar = require('@ont-dev/hw-app-hbar');
const {listen} = require("@ledgerhq/logs");
const {
	AccountId,
	PrivateKey,
	Client,
	FileCreateTransaction,
	ContractCreateTransaction,
	ContractFunctionParameters,
	ContractExecuteTransaction,
	ContractCallQuery,
	Hbar,
	ContractCreateFlow,
	PublicKey,
  Transaction
} = require("@hashgraph/sdk");
const fs = require("fs");


async function getInfo(app, path){
  const publicKeyHex = await app.getPublicKey(path);
  const publicKey = PublicKey.fromString(publicKeyHex);
  console.log('publicKeyHex:', publicKeyHex);
  console.log('publicKey:', publicKey);
}

async function signTransaction(app, path, publicKey, transactionHex) {
  const transaction = Transaction.fromBytes(Buffer.from(transactionHex, 'hex'));
  await transaction.signWith(publicKey, async array => {
    const signatureHex = await app.signTransaction(path, Buffer.from(array).toString('hex'));
    return Buffer.from(signatureHex, 'hex');
  });
  const signedTransactionHex = Buffer.from(transaction.toBytes()).toString('hex');
  console.log('signedTransactionHex:', signedTransactionHex);

  return signedTransactionHex;
}

async function test() {
  const path0 = "44'/3030'/0'/0'/0'";
  const path1 = "44'/3030'/1'/0'/0'";
  const path2 = "44'/3030'/2'/0'/0'";
  const path3 = "44'/3030'/3'/0'/0'";

  const transport = await TransportNodeHid.create();
  const app = new AppHBar(transport);

  const publicKeyHex = await app.getPublicKey(path0);
  const publicKey = PublicKey.fromString(publicKeyHex);
  
  // Import the compiled contract bytecode
  // const contractBytecode = fs.readFileSync("Smart_Contract_Binary/LookupContract_sol_LookupContract.bin");
  let transactionHex = '1a0022410a130a0b08aac3baf80510e0a2ff2a1204189a8506120218041880c2d72f220308f001721c0a1a0a0b0a04189a850610ff83af5f0a0b0a0418cabe05108084af5f';
	const signedContractBytecode = await signTransaction(app, path0, publicKey, transactionHex);
// 	// Instantiate the smart contract
// 	const contractInstantiateTx = new ContractCreateFlow()
// 		.setBytecode(signedContractBytecode)
// 		.setGas(1000000)
//     .setMaxTransactionFee(new Hbar(20))
//     .setKey(publicKey);
//   const txResponse = await contractInstantiateTx.executeWithSigner(publicKey);
// //Get the transaction ID
//   const transactionId = txResponse.transactionId;

//   //Get the account ID of the node that processed the transaction
//   const nodeId = txResponse.nodeId;

//   //Get the transaction hash
//   const transactionHash = txResponse.transactionHash;
//   console.log(txResponse);
//   console.log("The transaction ID is " +transactionId);
//   console.log("The transaction hash is " +transactionHash);
//   console.log("The node ID is " +nodeId);
}

test().catch(console.error);
