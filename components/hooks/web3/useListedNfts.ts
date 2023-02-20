import { CryptoHookFactory } from "@_types/hooks";
import { Nft } from "@_types/nft";
import { ethers } from "ethers";
import { useCallback } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

// define thêm các thuộc tính muốn trả về thêm
type UseListedNftsResponse = {
    buyNft: (token: number, value: number) => Promise<void>
};

type ListedNftsHookFactory = CryptoHookFactory<Nft[], UseListedNftsResponse>; // value trả về kiểu Nft[]

export type UseListedNftsHook = ReturnType<ListedNftsHookFactory>;

export const hookFactory: ListedNftsHookFactory = ({ contract }) => () => {
    const { data, ...swr } = useSWR(
        contract ? "web3/useListedNfts" : null,
        async () => {
            const nfts = [] as Nft[];
            const coreNfts = await contract!.getAllNftsOnSale();

            for (let i = 0; i < coreNfts.length; i++) {
                const item = coreNfts[i];
                const tokenURI = await contract!.tokenURI(item.tokenId); // lấy ra tokenURI
                const metaRes = await fetch(tokenURI); // fetch data từ URI lưu trên Pinata
                const meta = await metaRes.json();

                nfts.push({
                    price: parseFloat(ethers.utils.formatEther(item.price)),
                    tokenId: item.tokenId.toNumber(),
                    creator: item.creator,
                    isListed: item.isListed,
                    meta
                });
            };

            return nfts;
        }
    );

    const _contract = contract;

    // handle when buy NFT
    // sử dụng useCallback để ngăn chặn việc tạo hàm lại nhiều lần
    const buyNft = useCallback(async (tokenId: number, value: number) => {
        try {
            const result = await _contract!.buyNft(
                tokenId, {
                value: ethers.utils.parseEther(value.toString())
            }
            );

            await toast.promise(
                result!.wait(),
                {
                    pending: "Processing transaction",
                    success: "Nft is yours! Go to Profile page",
                    error: "Processing error"
                }
            );
        } catch (e: any) {
            console.error(e.message);
        }
    }, [_contract]);

    return {
        ...swr,
        buyNft,
        data: data || [],
    };
};
