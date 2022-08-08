//in nodeJs:require()
//in front-end Js:import
import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constans.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const withdrawButton = document.getElementById("withdrawButton");
const balanceButton = document.getElementById("balanceButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
withdrawButton.onclick = withdraw;
balanceButton.onclick = getBalance;
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    console.log("I see a metamask");
    try {
      await ethereum.request({ method: "eth_requestAccounts" });
      connectButton.innerHTML = "Connected!!!!!!!!!!!!!!!!!!!!";
      const accounts = await ethereum.request({ method: "eth_accounts" });
      console.log(accounts);
    } catch (error) {
      console.log(error);
    }
  } else {
    console.log("No metaMask");
    document.getElementById("connectButton").innerHTML =
      "Please install MetaMask!";
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("withdrawing...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResponse = await contract.withdraw();
      await listenForTxMine(txResponse, provider);
    } catch (error) {
      console.log(error);
    }
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(balance);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    //provider/connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //signer/wallet/someone with some gas
    const signer = provider.getSigner();
    //contract taht we are interacting with
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const txResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      //listen for the tx to be mined
      await listenForTxMine(txResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTxMine(txResponse, provider) {
  console.log(`Mining ${txResponse.hash}...`);
  //create a listenr for blockchain this tx finish,ethers提供的once方法可以监听这个区块链上这个事件完成就触发；比如传入交易的hash，就是监听这个交易完成？
  //transactionReceipt是交易完成后自动生成的，就可以这样传入？
  //不返回promis的话，这个方法只是会启动一个监听器，并不会等监听器触发并完成才返回
  //resolve是正常执行完的触发，reject是超时后的触发，这里没有设置reject后的触发会一直卡住？
  return new Promise((resolve, reject) => {
    provider.once(txResponse.hash, (transactionReceipt) => {
      console.log(
        `Completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}
