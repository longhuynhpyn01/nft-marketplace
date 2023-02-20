import { ethers } from "ethers";
import { NextApiRequest, NextApiResponse } from "next";
import { withIronSession, Session } from "next-iron-session";
import * as util from "ethereumjs-util";
import contract from "../../public/contracts/NftMarket.json";
import { NftMarketContract } from "@_types/nftMarketContract";

const NETWORKS = {
    "5777": "Ganache"
};

type NETWORK = typeof NETWORKS;

// mô tả các hàm mà bạn có trong smart contract hoặc những gì bạn viết thêm trong smart contract
const abi = contract.abi;

const targetNetwork = process.env.NEXT_PUBLIC_NETWORK_ID as keyof NETWORK;
export const pinataApiKey = process.env.PINATA_API_KEY as string;
export const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY as string;

export const contractAddress = contract["networks"][targetNetwork]["address"];

// handler đơin giản là API end point, nó sẽ mở rộng một số chức năng đến API end point
// vì vậy ta có thể lưu trữ trong session
export function withSession(handler: any) {
    return withIronSession(handler, {
        password: process.env.SECRET_COOKIE_PASSWORD as string,
        cookieName: "nft-auth-session",
        cookieOptions: {
            secure: process.env.NODE_ENV === "production" ? true : false
        }
    });
};

export const addressCheckMiddleware = async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
    return new Promise(async (resolve, reject) => {
        const message = req.session.get("message-session");
        // gọi provider trong ganache khác với cách gọi provider trong browser (thông qua ethereum trong file providers/web3/index.ts)
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545");
        // get contract in server side
        // const contract = new ethers.Contract(
        //     contractAddress,
        //     abi,
        //     provider
        // ) as unknown as NftMarketContract;

        // const name = await contract.name(); // CreaturesNFT


        // So sánh unsigned message và signature có cùng address và verify nó

        // unsigned message
        let nonce: string | Buffer =
            "\x19Ethereum Signed Message:\n" +
            JSON.stringify(message).length +
            JSON.stringify(message);

        nonce = util.keccak(Buffer.from(nonce, "utf-8")); // hash Buffer input
        const { v, r, s } = util.fromRpcSig(req.body.signature); // lấy ra 3 key thuộc signature
        const pubKey = util.ecrecover(util.toBuffer(nonce), v, r, s); // public key có được từ unsigned message và các key của signature
        const addrBuffer = util.pubToAddress(pubKey);
        const address = util.bufferToHex(addrBuffer); // address của user

        // khi matching  address thành công
        if (address === req.body.address) {
            resolve("Correct Address");
        } else {
            reject("Wrong Address");
        }
    });
};