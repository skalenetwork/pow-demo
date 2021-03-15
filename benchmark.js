const Web3 = require('web3');
const mineGasForTransaction = require('./skale-miner').mineGasForTransaction

// Variables definition
const addressFrom = '0x6Be02d1d3665660d22FF9624b7BE0551ee1Ac91b';
const addressTo = '0xB90168C8CBcd351D069ffFdA7B71cd846924d551';
const web3 = new Web3('https://data-seed-prebsc-1-s1.binance.org:8545/');

async function main() {
    const numberOfRuns = process.argv[2] ? process.argv[2] : 10;

    const tx = {
        from: addressFrom,
        to: addressTo,
        value: web3.utils.toWei('100', 'ether'),
        gas: web3.utils.toHex('21000'),
        nonce: 0,
    };

    for (let i = 0; i < numberOfRuns; ++i) {
        await mineGasForTransaction(web3, tx)
        console.log(tx.gasPrice)
        //mineFreeGas(21000, addressFrom, 0, web3)
    }
}

main()
