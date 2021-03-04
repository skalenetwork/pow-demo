const Web3 = require('web3');
const mineGasForTransaction = require('./skale-miner').mineGasForTransaction;

/*

contract Payer {

    constructor () payable {
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {}

    // Fallback function is called when msg.data is not empty
    fallback() external payable {}

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    function pay(address payable receiver) external payable {
        receiver.transfer(1 ether);
    }
}

 */

function ensureStartsWith0x(str) {
    if (str.length < 2) {return false;}
    return (str[0] === '0' && str[1] === 'x');
}

function rmBytesSymbol(str) {
    if (!ensureStartsWith0x(str)) return str;
    return str.slice(2);
}

async function deployPayer(web3, ownerKey) {
    let payerAbi = JSON.parse('[ { "inputs": [], "stateMutability": "payable", "type": "constructor" }, { "stateMutability": "payable", "type": "fallback" }, { "inputs": [], "name": "getBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "receiver", "type": "address" } ], "name": "pay", "outputs": [], "stateMutability": "payable", "type": "function" }, { "stateMutability": "payable", "type": "receive" } ]')
    let payerBytecode = "0x608060405261014c806100136000396000f3fe60806040526004361061002d5760003560e01c80630c11dedd1461003657806312065fe01461007a57610034565b3661003457005b005b6100786004803603602081101561004c57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291905050506100a5565b005b34801561008657600080fd5b5061008f6100f7565b6040518082815260200191505060405180910390f35b8073ffffffffffffffffffffffffffffffffffffffff166108fc670de0b6b3a76400009081150290604051600060405180830381858888f193505050501580156100f3573d6000803e3d6000fd5b5050565b60003073ffffffffffffffffffffffffffffffffffffffff163190509056fea26469706673582212209d96fa3f8ceebc1f6b77e3efcf549b29df42a18bd96fd90b298e5391f504821e64736f6c63430007040033"
    const myContract = new web3.eth.Contract(payerAbi);

    let address = web3.eth.accounts.privateKeyToAccount(ownerKey)['address'];
    return send(web3, myContract.deploy({data: payerBytecode}), ownerKey, address, 10 ** 19);
}

async function deploy(web3, ownerKey){
    let abi = JSON.parse('[{ "inputs": [ { "internalType": "uint256", "name": "x", "type": "uint256" } ], "name": "setA", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "a", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" } ]')
    let bytecode = "0x608060405234801561001057600080fd5b50610129806100206000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c8063ee919d50146037578063f0fdf834146062575b600080fd5b606060048036036020811015604b57600080fd5b810190808035906020019092919050505060a5565b005b608b60048036036020811015607657600080fd5b810190808035906020019092919050505060d3565b604051808215151515815260200191505060405180910390f35b600160008083815260200190815260200160002060006101000a81548160ff02191690831515021790555050565b60006020528060005260406000206000915054906101000a900460ff168156fea26469706673582212209507c7b274ebb9fcddca5c090dc4c124f45548dfbcdcd574d4017a19fb4eb67b64736f6c63430006000033"
    const myContract = new web3.eth.Contract(abi);

    let address = web3.eth.accounts.privateKeyToAccount(ownerKey)['address'];
    return send(web3, myContract.deploy({data:bytecode}), ownerKey, address);
}


async function send(web3, tr, pk, address, value=0) {
    let gas = await tr.estimateGas({"from": address});
    let nonce = await web3.eth.getTransactionCount(address)
    let tx = {
        "to"  : tr._parent._address,
        "data": tr.encodeABI(),
        "gas" : gas,
        "nonce": nonce,
        "value": value
    };
    let signed = await web3.eth.accounts.signTransaction(tx, pk)
    return web3.eth.sendSignedTransaction(signed.rawTransaction)
}

async function test(web3, testKey, ad){
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

async function testReceive(web3, testKey, ad, receiverAddress){
    let address = web3.eth.accounts.privateKeyToAccount(testKey)['address'];
    let nonce = await web3.eth.getTransactionCount(address)
    let tx =  {
        from: address,
        to: ad,
        data: "0x0c11dedd000000000000000000000000"+receiverAddress,
        nonce: nonce
    }
    console.log(tx)
    await mineGasForTransaction(web3, tx);
    let signed = await web3.eth.accounts.signTransaction(tx, testKey)
    return web3.eth.sendSignedTransaction(signed.rawTransaction)
}

async function testWallet(web3, walletAddress, ad){
    let nonce = await web3.eth.getTransactionCount(walletAddress)
    let tx =  {
        from: walletAddress,
        to: ad,
        data: "0xee919d500000000000000000000000000000000000000000000000000000000000000017",
        nonce: nonce,
    }
    await mineGasForTransaction(web3, tx);
    return web3.eth.sendTransaction(tx)
}

async function run(endpoint, ownerKey, testKey) {
    console.log(endpoint, ownerKey, testKey);
    if (!window.ethereum.selectedAddress) {
        await window.ethereum.enable(); // <<< ask for permission
    }
    _web3 = new Web3(window.ethereum);
    userAccount = window.ethereum.selectedAddress;
    if (!window.sessionKey) {
        window.sessionKey = _web3.eth.accounts.create().privateKey;
    }
    console.log(userAccount, window.sessionKey);
    let ownerWeb3 = new Web3(endpoint);
    let addr = await deployPayer(ownerWeb3, ownerKey);
    console.log(addr);
    // res = await testWallet(_web3, userAccount, addr.contractAddress);
    res = await testReceive(_web3, window.sessionKey, addr.contractAddress, rmBytesSymbol(userAccount));
    console.log('Transaction is sent:', res);
}

module.exports = run