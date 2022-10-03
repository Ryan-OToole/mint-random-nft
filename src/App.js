import './App.css';
import twitterLogo from './twitter-logo.svg';
import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import myEpicNFT from './myEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'plentyWeb3';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const CONTRACT_ADDRESS = '0xff00c37B3075389b8e68D7d8b19D08B1C0cB2bad';
// const OPENSEA_LINK = '';
// const TOTAL_MINT_COUNT = 50;

const App = () => {
  // Render Methods
  const [currentAccount, setCurrentAccount] = useState("");
  const [nftCount, setNftCount] = useState(0);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("download metamask");
    } else {
      console.log('ethereum object:', ethereum);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    }
    else {
      console.log('no authorized account found');
    }

  }

  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
  );

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert('get MetaMask!');
        return;
      }
      let chainId = await ethereum.request({ method: 'eth_chainId' });
      console.log("Connected to chain " + chainId);
      // String, hex code of the chainId of the Rinkebey test network
      const goerliChainId = "0x5";
      if (chainId !== goerliChainId) {
        alert("You are not connected to the Goerli Test Network!");
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log('connected:', accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log('error:', error);
    }
  }

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);
        let totalSupply = await connectedContract.totalSupply();
        totalSupply = totalSupply.toNumber();
        console.log('totalSupply', totalSupply);
        setNftCount(totalSupply - 1);
        connectedContract.on("newEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setNftCount(tokenId.toNumber());
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on Opensea. Here's the link: https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        })
      }
    } catch (error) {
      console.log('error:', error);
    }
  }

  const askConractToMintNFT = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNFT.abi, signer);
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log('mining please wait');
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
      }
    } catch (error) {
      console.log('error', error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {
            nftCount === 25 
                ?
          <div>
            <p className="sub-text">
                {`${nftCount}/25 NFTs Minted. Max # of NFTs met for this contract`}
            </p>
            <p className="sub-text">
              <a href={`https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}/${nftCount}`}>Enjoy the last NFT of the collection here</a>
            </p>
          </div>
                :
            <div>
              <p className="sub-text">
                {`${nftCount}/25 NFTs Minted So Far... Get one before they run out...`}
              </p>
              <p className="sub-text">
                <a href={`https://testnets.opensea.io/assets/goerli/${CONTRACT_ADDRESS}/${nftCount}`}>Your NFT could look like this</a>
              </p>
          </div>
        }
 
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : (
              /** Add askContractToMintNft Action for the onClick event **/
              <button onClick={askConractToMintNFT} className="cta-button connect-wallet-button">
                Mint NFT
              </button>
            )
          }
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;