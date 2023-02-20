import { CryptoHookFactory } from "@_types/hooks";
import { useEffect } from "react";
import useSWR from "swr";

type UseAccountResponse = {
    connect: () => void;
    isLoading: boolean;
    isInstalled: boolean;
};

type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>;

// đinh nghĩa type
export type UseAccountHook = ReturnType<AccountHookFactory>;

// deps -> provider, ethereum, contract (web3State)
export const hookFactory: AccountHookFactory = ({ provider, ethereum, isLoading }) => () => {
    const { data, mutate, isValidating, ...swr } = useSWR(
        provider ? "web3/useAccount" : null,
        async () => {
            const accounts = await provider!.listAccounts();
            const account = accounts[0];

            if (!account) {
                throw "Cannot retreive account! Please, connect to web3 wallet.";
            }

            // trả về account hiện tại
            return account;
        }, {
        revalidateOnFocus: false, // không tự động xác thực lại khi cửa sổ được focus
        shouldRetryOnError: false, // không retry khi fetcher gặp lỗi
    }
    );

    useEffect(() => {
        ethereum?.on("accountsChanged", handleAccountsChanged);
        return () => {
            ethereum?.removeListener("accountsChanged", handleAccountsChanged);
        };
    });

    // handle khi thay đổi account
    const handleAccountsChanged = (...args: unknown[]) => {
        const accounts = args[0] as string[];

        if (accounts.length === 0) {
            console.error("Please, connect to Web3 wallet");
        } else if (accounts[0] !== data) {
            mutate(accounts[0]);
        }
    };

    // dùng để connect to my wallet
    const connect = async () => {
        try {
            // Dùng để mở ví metamask của bạn nhằm kết nối
            ethereum?.request({ method: "eth_requestAccounts" });
        } catch (e) {
            console.error(e);
        }
    };

    return {
        ...swr,
        data,
        isValidating,
        isLoading: isLoading as boolean,
        isInstalled: ethereum?.isMetaMask || false,
        mutate,
        connect
    };
};
