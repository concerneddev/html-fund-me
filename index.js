import { TransactionReceipt, ethers } from "./ethers-6.10.esm.min.js"
import { abi } from "./constants.js"
import { contractAddress } from "./constants.js"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw


console.log(ethers)

// Connecting to the MetaMask Wallet
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Please intall MetaMask!"
    }
}

// Funding
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner() //returns the connect account
        const contract = new ethers.Contract(contractAddress, abi, signer) //contract object

        try {
            const transactionResponse = await contract.fund({
                value: ethers.parseEther(ethAmount),
            })
            console.log(transactionResponse)

            await listenTransactionMined(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please intall MetaMask!"
    }
}

// Getting the balance of the smart contract
async function getBalance(){
    if(typeof window.ethereum != "undefined"){
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.formatEther(balance))
    }
}

async function withdraw(){
    console.log("Withdrawing...")
    if(typeof window.ethereum != "undefined"){
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try{
            const transactionResponse = await contract.withdraw()
            await listenTransactionMined(transactionResponse, provider)
        } catch(e){
            console.log(e)
        }
    }
}

// Listening the transaction to be mined
function listenTransactionMined(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // once() method intakes the hash and gives out transaction receipt
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, async (transactionReceipt) => {
            const confirmations = await transactionReceipt.confirmations()
            console.log(`Completed with ${confirmations} confirmations.`)
            resolve()
        })
    })
}
