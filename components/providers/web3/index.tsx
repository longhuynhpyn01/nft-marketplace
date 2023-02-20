import { createContext, FunctionComponent, useContext, useEffect, useState } from "react"
import { createDefaultState, createWeb3State, loadContract, Web3State } from "./utils";
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { NftMarketContract } from "@_types/nftMarketContract";

// Reload on network change
const pageReload = () => {
    window.location.reload();
};

const handleAccount = (ethereum: MetaMaskInpageProvider) => async () => {
    const isLocked = !(await ethereum._metamask.isUnlocked());

    // khi account lock thì reload lại page
    if (isLocked) {
        pageReload();
    }
};

const setGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
    ethereum.on("chainChanged", pageReload); // network thay đổi
    ethereum.on("accountsChanged", handleAccount(ethereum)); // account thay đổi
};

const removeGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
    ethereum?.removeListener("chainChanged", pageReload);
    ethereum?.removeListener("accountsChanged", handleAccount);
};

// khởi tạo value context mặc định
const Web3Context = createContext<Web3State>(createDefaultState());

type Web3ProviderProps = {
    children: React.ReactNode;
};

const Web3Provider: FunctionComponent<Web3ProviderProps> = ({ children }) => {
    const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());

    useEffect(() => {
        async function initWeb3() {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum as any); // thiết lập provider từ ethers
                const contract = await loadContract("NftMarket", provider); // thiết lập để tải contract

                // Sign Contract nên ta có thể thực hiện transaction với smart contract của bạn 
                // và gọi hàm để get NFT owned 
                const signer = provider.getSigner();
                const signedContract = contract.connect(signer);

                // Reload on network change
                setTimeout(() => setGlobalListeners(window.ethereum), 500);
                setWeb3Api(createWeb3State({
                    ethereum: window.ethereum,
                    provider,
                    contract: signedContract as unknown as NftMarketContract,
                    isLoading: false
                }));
            } catch (e: any) {
                // handle error when no wallet
                console.error("Please, install web3 wallet");
                setWeb3Api((api) => createWeb3State({
                    ...api as any,
                    isLoading: false,
                }));
            }
        }

        initWeb3();

        return () => removeGlobalListeners(window.ethereum);
    }, []);

    return (
        <Web3Context.Provider value={web3Api}>
            {children}
        </Web3Context.Provider>
    );
};

export function useWeb3() {
    return useContext(Web3Context);
};

export function useHooks() {
    const { hooks } = useWeb3();
    return hooks;
};

export default Web3Provider;
