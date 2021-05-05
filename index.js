require('dotenv').config();
const fs = require('fs');
const path = require('path');
const ethers = require('ethers');

let chainConfig = {
    rpcUrl: process.env.RPC_ENDPOINT,
    privateKey: process.env.PRIVATE_KEY,
    chainId: Number(process.env.CHAIN_ID),
    gasLimit: Number(process.env.GAS_LIMIT),
    gasPrice: Number(process.env.GAS_PRICE)
}

function getWalletAndProvider(rpcUrl, privateKey, chainNetworkId = undefined) {
    let chainProvider = chainNetworkId
      ? new ethers.providers.JsonRpcProvider(rpcUrl, {
          name: "custom",
          chainId: chainNetworkId,
        })
      : new ethers.providers.JsonRpcProvider(rpcUrl);
    let chainWallet = new ethers.Wallet(privateKey, chainProvider);
    return { chainProvider, chainWallet };
}

async function deployContract(name) {
    let { chainProvider, chainWallet } = getWalletAndProvider(chainConfig.rpcUrl, chainConfig.privateKey, chainConfig.chainId);
    let contractBuild = fs.readFileSync(path.join(__dirname + `/build/${name}.json`), 'utf-8');
    contractBuild = JSON.parse(contractBuild);

    let factory = new ethers.ContractFactory(contractBuild.abi, contractBuild.bytecode, chainWallet);
    let contract = await factory.deploy({ gasPrice: chainConfig.gasPrice, gasLimit: chainConfig.gasPrice });
    await contract.deployed();
    return contract.address;
}

async function main() {
    try {
        const address = await deployContract('WEDG10');
        console.log(address)
    } catch (er) {
        console.log(er);
    }
}

main()
    .then(res => console.log('Deployed'))
    .catch(err => { console.log(err);  process.exit(1); })