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

async function testReceive(web3, testKey, contractAddress, receiverAddress){
    let address = web3.eth.accounts.privateKeyToAccount(testKey)['address'];
    let nonce = await web3.eth.getTransactionCount(address)
    let tx =  {
        from: address,
        to: contractAddress,
        data: "0x0c11dedd000000000000000000000000"+receiverAddress,
        nonce: nonce
    }
    await mineGasForTransaction(web3, tx);
    let signed = await web3.eth.accounts.signTransaction(tx, testKey)
    return web3.eth.sendSignedTransaction(signed.rawTransaction)
}

async function deploy(endpoint, ownerKey) {
    console.log('Deploying contract...');
    let ownerWeb3 = new Web3(endpoint);
    let receipt = await deployPayer(ownerWeb3, ownerKey);
    let address = receipt.contractAddress
    console.log('Contract deployed at ' + address);
    return address;
}

async function receiveFunds(contractAddress) {
    if (!window.ethereum.selectedAddress) {
        await window.ethereum.enable(); // <<< ask for permission
    }
    _web3 = new Web3(window.ethereum);
    userAccount = window.ethereum.selectedAddress;
    if (!window.sessionKey) {
        let sessionKeyCredentials = await _web3.eth.accounts.create()
        window.sessionKey = sessionKeyCredentials.privateKey;
        console.log('New sessionKey generated: ' + sessionKeyCredentials.address);
    }
    res = await testReceive(_web3, window.sessionKey, contractAddress, rmBytesSymbol(userAccount));
    console.log('Transaction is sent:', res);
}

async function generateKey(){
    if (!window.ethereum.selectedAddress) {
        await window.ethereum.enable(); // <<< ask for permission
    }
    _web3 = new Web3(window.ethereum);
    userAccount = window.ethereum.selectedAddress;
    if (!window.sessionKey) {
        let sessionKeyCredentials = await _web3.eth.accounts.create()
        window.sessionKey = sessionKeyCredentials.privateKey;
        window.sessionKeyAddress = sessionKeyCredentials.address;
        console.log('New sessionKey generated: ' + sessionKeyCredentials.address);
    }
}

module.exports.deploy = deploy
module.exports.generateKey = generateKey
module.exports.receiveFunds = receiveFunds