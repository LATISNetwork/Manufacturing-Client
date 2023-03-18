console.clear();
require("dotenv").config();
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
	PublicKey
} = require("@hashgraph/sdk");
const fs = require("fs");

// Read in .env files
const accountId1 = process.env.MY_ACCOUNT_ID1;
const publicKey1 = process.env.MY_PUBLIC_KEY1;
const privateKey1 = process.env.MY_PRIVATE_KEY1;

const accountId2 = process.env.MY_ACCOUNT_ID2;
const publicKey2 = process.env.MY_PUBLIC_KEY2;
const privateKey2 = process.env.MY_PRIVATE_KEY2;

const accountId3 = process.env.MY_ACCOUNT_ID3;
const publicKey3 = process.env.MY_PUBLIC_KEY3;
const privateKey3 = process.env.MY_PRIVATE_KEY3;


// Configure accounts and client
const operatorId1 = AccountId.fromString(accountId1);
const operatorKey1 = PrivateKey.fromString(privateKey1);

const operatorId2 = AccountId.fromString(accountId2);
const operatorKey2 = PrivateKey.fromString(privateKey2);

const operatorId3 = AccountId.fromString(accountId3);
const operatorKey3 = PrivateKey.fromString(privateKey3);


// Create client for each account
const USER1 = Client.forTestnet().setOperator(operatorId1, operatorKey1);
const USER2 = Client.forTestnet().setOperator(operatorId2, operatorKey2);
const USER3 = Client.forTestnet().setOperator(operatorId3, operatorKey3);

async function main() {
	// Import the compiled contract bytecode
	const contractBytecode = fs.readFileSync("Smart_Contract_Binary/ManufacturerContract_sol_ManufacturerContract.bin");

	// Instantiate the smart contract
	const contractInstantiateTx = new ContractCreateFlow()
		.setBytecode(contractBytecode)
		.setGas(1000000)
		.setConstructorParameters(
			new ContractFunctionParameters()
		);
	const contractInstantiateSubmit = await contractInstantiateTx.execute(USER1);
	const contractInstantiateRx = await contractInstantiateSubmit.getReceipt(USER1);
	const contractId = contractInstantiateRx.contractId;
	const contractCost = contractInstantiateRx.exchangeRate.hbars;
	const contractAddress = contractId.toSolidityAddress();
	console.log(`- The smart contract ID is: ${contractId} \n`);
	console.log(`- The smart contract ID in Solidity format is: ${contractAddress} \n`);
	console.log('- The cost to create the smart contract is: ' + contractCost + ' Hbars \n');

	// Call contract to add assign update permissions
	const contractExecuteTx3 = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(1000000)
		.setFunction(
			"grantPermission",
			new ContractFunctionParameters().addAddress(publicKey2).addUint8(0x02)
		);
	const contractExecuteSubmit3 = await contractExecuteTx3.execute(USER1);
	const contractExecuteRx3 = await contractExecuteSubmit3.getReceipt(USER1);
	console.log(`- Contract function call status: ${contractExecuteRx3.status} \n`);

	// Call contract to add view permissions
	const contractExecuteTx4 = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(1000000)
		.setFunction(
			"grantPermission",
			new ContractFunctionParameters().addAddress(publicKey3).addUint8(0x01)
		);
	const contractExecuteSubmit4 = await contractExecuteTx4.execute(USER1);
	const contractExecuteRx4 = await contractExecuteSubmit4.getReceipt(USER1);
	console.log(`- Contract function call status: ${contractExecuteRx4.status} \n`);
	
	
	// Call contract function to update the state variable
	const contractExecuteTx = new ContractExecuteTransaction()
		.setContractId(contractId)
		.setGas(1000000)
		.setFunction(
			"assignUpdate",
			new ContractFunctionParameters().addAddress(publicKey3).addUint256(0x34).addUint256(0xff32).addAddress(publicKey1).addAddress(publicKey1)
		);
	const contractExecuteSubmit = await contractExecuteTx.execute(USER2);
	const contractExecuteRx = await contractExecuteSubmit.getReceipt(USER2);
	const getCost = contractExecuteRx.exchangeRate.hbars;
	console.log(`- Contract function call status: ${contractExecuteRx.status} \n`);
	console.log('- The cost to call the smart contract function is: ' + getCost + ' Hbars \n');

	// Query the contract to check changes in state variable
	const contractQueryTx1 = new ContractCallQuery()
		.setContractId(contractId)
		.setGas(100000)
		.setFunction("implementUpdate", new ContractFunctionParameters());
	const contractQuerySubmit1 = await contractQueryTx1.execute(USER3);
	const checksum = contractQuerySubmit1.getUint256(0);
	console.log(`- The checksum is: ${checksum} \n`);
	const minerId = contractQuerySubmit1.getUint256(1);
	console.log(`- The miner ID is: ${minerId} \n`);
	const CID = contractQuerySubmit1.getAddress(2);
	console.log(`- The CID is: ${CID} \n`);
	const userAddress = contractQuerySubmit1.getAddress(3);
	console.log(`- The user address is: ${userAddress} \n`);
}
main();