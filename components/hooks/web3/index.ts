import { useHooks } from "@providers/web3";

// dùng với thao tác với account
export const useAccount = () => {
    const hooks = useHooks();
    const swrRes = hooks.useAccount();

    return {
        account: swrRes
    };
};

// dùng với thao tác với network như connect hay không
export const useNetwork = () => {
    const hooks = useHooks();
    const swrRes = hooks.useNetwork();

    return {
        network: swrRes
    };
};

// dùng để truy cập List Nfts
export const useListedNfts = () => {
    const hooks = useHooks();
    const swrRes = hooks.useListedNfts();

    return {
        nfts: swrRes
    };
};

//
export const useOwnedNfts = () => {
    const hooks = useHooks();
    const swrRes = hooks.useOwnedNfts();

    return {
        nfts: swrRes
    };
};
