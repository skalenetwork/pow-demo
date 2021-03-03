const Web3 = require('web3');
const mineGasForTransaction = require('./skale-miner').mineGasForTransaction;

async function deploy(ownerKey){
    let abi = JSON.parse('[{ "inputs": [ { "internalType": "uint256", "name": "x", "type": "uint256" } ], "name": "setA", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "a", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" } ]')
    let bytecode = "0x608060405234801561001057600080fd5b50610129806100206000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c8063ee919d50146037578063f0fdf834146062575b600080fd5b606060048036036020811015604b57600080fd5b810190808035906020019092919050505060a5565b005b608b60048036036020811015607657600080fd5b810190808035906020019092919050505060d3565b604051808215151515815260200191505060405180910390f35b600160008083815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b60006020528060005260406000206000915054906101000a900460ff168156fea26469706673582212209507c7b274ebb9fcddca5c090dc4c124f45548dfbcdcd574d4017a19fb4eb67b64736f6c63430006000033"
    const myContract = new web3.eth.Contract(abi);

    let address = web3.eth.accounts.privateKeyToAccount(ownerKey)['address'];
    return send(myContract.deploy({data:bytecode}), ownerKey, address);
}


async function send(tr, pk, address) {
    let gas = await tr.estimateGas({"from": address});
    let nonce = await web3.eth.getTransactionCount(address)
    let tx = {
        "to"  : tr._parent._address,
        "data": tr.encodeABI(),
        "gas" : gas,
        "nonce": nonce
    };
    let signed = await web3.eth.accounts.signTransaction(tx, pk)
    return web3.eth.sendSignedTransaction(signed.rawTransaction)
}

async function test(testKey, ad){
    let address = web3.eth.accounts.privateKeyToAccount(testKey)['address'];
    let nonce = await web3.eth.getTransactionCount(address)
    let tx =  {
        from: address,
        to: ad,
        data: "0xee919d500000000000000000000000000000000000000000000000000000000000000017",
        nonce: nonce
    }
    await mineGasForTransaction(web3, tx);
    let signed = await web3.eth.accounts.signTransaction(tx, testKey)
    return web3.eth.sendSignedTransaction(signed.rawTransaction)
}

async function run(endpoint, ownerKey, testKey) {
    console.log(endpoint, ownerKey, testKey);
    web3 = new Web3(endpoint);
    let addr = await deploy(ownerKey);
    res = await test(testKey, addr.contractAddress);
    console.log('Transaction is sent:', res);
}

module.exports = run