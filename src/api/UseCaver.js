import Caver from "caver-js";
import MARKET_ABI from "../abi/market.json";
import NFT_ABI from "../abi/nft.json";

import { NFT_CONTRACT_ADDRESS, MARKET_CONTRACT_ADDRESS, CHAIN_ID, ACCESS_KEY_ID, SECRET_ACCESS_KEY } from "../constants";
 
const option = {
  headers: [
    {
      name: "Authorization",
      value: "Basic " + Buffer.from(ACCESS_KEY_ID + ":" + SECRET_ACCESS_KEY).toString("base64"),
    },
    { name: "x-chain-id", value: CHAIN_ID },
  ],
};
const caver = new Caver(new Caver.providers.HttpProvider("https://node-api.klaytnapi.com/v1/klaytn", option));
const NFTcontract = new caver.contract(NFT_ABI, NFT_CONTRACT_ADDRESS);
const MarketContract = new caver.contract(MARKET_ABI, MARKET_CONTRACT_ADDRESS);

const addDeployer = (deployer) => {
  if (!caver.wallet.isExisted(deployer.address)) {
    caver.wallet.add(deployer);
  }
};
export const fetchCardsOf = async (address) => {
  // You can use an another klaytn api
  // curl -X GET "https://th-api.klaytnapi.com/v2/contract/nft/0x660a15ea27fd0707ca804ccf7a384a0dce8a7c4f/owner/0x5536F6FaB59Ff40cEce71D58BD94983BFc52E7A4" --header "x-chain-id: 8217" -u KASKX02VFJ23LZU6GFCH2WEK:jE7tt4GBW3F37PLxuhtkcwslEUeSBUDkCian29G0
  // {"items":[{"tokenId":"0x6e","owner":"0x5536f6fab59ff40cece71d58bd94983bfc52e7a4","previousOwner":"0x3c21785793ea7cea01e680430da45ebd8c4da08d","tokenUri":"https://i.pinimg.com/originals/c9/4e/c8/c94ec894c1bbe63c97ad5345e37e45e3.jpg","transactionHash":"0xc2e7508d48d837f80ba5e4bd2d8cb05f5f01b77d09ea65de4d82046d3f9a3fac","createdAt":1618934494,"updatedAt":1618935512},{"tokenId":"0xc","owner":"0x5536f6fab59ff40cece71d58bd94983bfc52e7a4","previousOwner":"0x0000000000000000000000000000000000000000","tokenUri":"wow","transactionHash":"0xb0a2b42da54bcd09a125f7a54161a5ff10e1bd6a489a5e51f349ef0ca4a50c97","createdAt":1618857434,"updatedAt":1618857434},{"tokenId":"0xb","owner":"0x5536f6fab59ff40cece71d58bd94983bfc52e7a4","previousOwner":"0x0000000000000000000000000000000000000000","tokenUri":"","transactionHash":"0xdfe852f12724095821e5883b879de1516cbb1cd6a70f31fcc1bf7b6c9628f1f6","createdAt":1618857377,"updatedAt":1618857377}],"cursor":""}
  const balance = await NFTcontract.methods.balanceOf(address).call(); // int
  console.log(`[NFT BALANCE]${balance}`);
  const cardIds = [];
  const cardUris = [];
  for (let i = 0; i < balance; i++) {
    const id = await NFTcontract.methods.tokenOfOwnerByIndex(address, i).call();
    cardIds.push(id);
  }
  console.log(`[CardID LIST]${cardIds}`);

  for (let i = 0; i < balance; i++) {
    const id = await NFTcontract.methods.tokenURI(cardIds[i]).call();
    cardUris.push(id);
  }
  console.log(`[CardURI LIST]${cardUris}`);
  const nfts = [];
  for (let i = 0; i < balance; i++) {
    nfts.push({ uri: cardUris[i], id: cardIds[i] });
  }
  return nfts;
};

export const mintCardWithURI = async (toAddress, tokenId, uri, privatekey) => {
  try {
    const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
    // caver.wallet.add(deployer);
    addDeployer(deployer);
    const receipt = await NFTcontract.methods.mintWithTokenURI(toAddress, tokenId, uri).send({
      from: deployer.address,
      gas: "0x4bfd200",
    });
    console.log(receipt);
    return true;
  } catch (e) {
    console.log(`MINT ERROR: ${e}`);
  }
  return false;
};

export const listingCard = async (tokenId, privatekey) => {
  // Send Token to Market Address
  try {
    const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
    addDeployer(deployer);
    const receipt = await NFTcontract.methods.safeTransferFrom(deployer.address, MARKET_CONTRACT_ADDRESS, tokenId).send({
      from: deployer.address,
      gas: "0x4bfd200",
    });
    console.log(receipt);
    return true;
  } catch (e) {
    console.log(`SAFE_TRANSFER_FROM ERROR: ${e}`);
  }
  return false;
};

export const buyCard = async (tokenId, privatekey) => {
  try {
    const deployer = caver.wallet.keyring.createFromPrivateKey(privatekey);
    addDeployer(deployer);
    const receipt = await MarketContract.methods.buyNFT(tokenId, NFT_CONTRACT_ADDRESS).send({
      from: deployer.address,
      value: 10 ** 16,
      gas: "0x4bfd200",
    });
    console.log(receipt);
    return true;
  } catch (e) {
    console.log(`BUY_CARD ERROR: ${e}`);
  }
  return false;
};
export const getBalance = (address) => {
  return caver.rpc.klay.getBalance(address).then((res) => {
    const balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(res));
    return balance;
  });
};





// import Caver from 'caver-js';       //컨트랙트 코드를 웹에서 사용할 수 있게 abi를 이용해서 16진수로 변환해서 전달
// import TestABI from '../abi/TestABI.json';   //ABI(Application Binary Interface): 컴퓨터가 이해할수있는 함수 호출 사용 설명서
// import {TEST_CA, ACCESS_KEY_ID, SECRET_ACCESS_KEY, CHAIN_ID} from '../constants';

// const option = {  //KAS 인증
//     headers: [
//       {
//         name: 'Authorization',
//         value: 'Basic ' + Buffer.from(ACCESS_KEY_ID + ':' + SECRET_ACCESS_KEY).toString('base64')  //KAS 키
//       },
//       {name: 'x-chain-id', value: CHAIN_ID}      //체인ID
//     ]
//   }
  
//   const caver = new Caver(new Caver.providers.HttpProvider('https://node-api.klaytnapi.com/v1/klaytn', option)); //Caver에 누구한테 가서 실행할지 입력.
//   const TestContract = new caver.contract(TestABI, TEST_CA);  //컨트랙트 연결: 실행할 컨트랙트의 ABI와 CA를 입력.
  
//   export const readTest = async () => {
//     const _test = await TestContract.methods.retrieve().call();   //retrieve() 함수 호출
//     console.log(_test);
//   }
  
//   export const getKlayBalance = (address) => {  //클레이 잔고 가져오기 함수. 콜백함수
//     return caver.rpc.klay.getBalance(address).then((response) => {  
//       //주소의 잔고를 가져와라. then 답변이 오면,
//       const balance = caver.utils.convertFromPeb(caver.utils.hexToNumberString(response)); 
//       //16진수의 답변을 읽을수있게 변환해 peb에서 klay로 변환 후 저장.
//       return balance;
//     })
//   }
  
//   export const setNumber = async (newNumber) => {  //숫자 설정 함수
//     try {
//       const prvkey = ''; //호출하는 사람의 개인키
//       const deployer = caver.wallet.keyring.createFromPrivateKey(prvkey);
//       caver.wallet.add(deployer);
//       const _numb = await TestContract.methods.store(newNumber).send({  //store()함수
//       from: deployer.address, //호출자의 address에서
//       gas: '0x4bfdddd'        //0x4bfdddd만큼 가스 소모.
//     });  
//     console.log(_numb);
//     } catch(e) {
//       console.log(`[ERROR_SET_NUMBBER] ${e}`);
//     }
//   }