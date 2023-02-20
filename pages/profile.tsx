/* eslint-disable @next/next/no-img-element */

import type { NextPage } from 'next';
import { BaseLayout } from '@ui';
import { Nft } from '@_types/nft';
import { useOwnedNfts } from '@hooks/web3';
import { useEffect, useState } from 'react';

const tabs = [
    { name: 'Your Collection', href: '#', current: true },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
};

const Profile: NextPage = () => {
    const { nfts } = useOwnedNfts();
    const [activeNft, setActiveNft] = useState<Nft>();

    useEffect(() => {
        if (nfts.data && nfts.data.length > 0) {
            setActiveNft(nfts.data[0]);
        }

        // khi change account không có data thì sẽ trả về undefined để reset
        return () => setActiveNft(undefined);
    }, [nfts.data]);

    return (
        <BaseLayout>
            <div className="flex h-full">
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-stretch flex-1 overflow-hidden">
                        <main className="flex-1 overflow-y-auto">
                            <div className="px-4 pt-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                                <div className="flex">
                                    <h1 className="flex-1 text-2xl font-bold text-gray-900">Your NFTs</h1>
                                </div>
                                <div className="mt-3 sm:mt-2">
                                    <div className="hidden sm:block">
                                        <div className="flex items-center border-b border-gray-200">
                                            <nav className="flex flex-1 -mb-px space-x-6 xl:space-x-8" aria-label="Tabs">
                                                {tabs.map((tab) => (
                                                    <a
                                                        key={tab.name}
                                                        href={tab.href}
                                                        aria-current={tab.current ? 'page' : undefined}
                                                        className={classNames(
                                                            tab.current
                                                                ? 'border-indigo-500 text-indigo-600'
                                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                                            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                                                        )}
                                                    >
                                                        {tab.name}
                                                    </a>
                                                ))}
                                            </nav>
                                        </div>
                                    </div>
                                </div>

                                <section className="pb-16 mt-8" aria-labelledby="gallery-heading">
                                    <ul
                                        role="list"
                                        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8"
                                    >
                                        {(nfts.data as Nft[]).map((nft) => (
                                            <li
                                                key={nft.tokenId}
                                                onClick={() => setActiveNft(nft)}
                                                className="relative">
                                                <div
                                                    className={classNames(
                                                        nft.tokenId === activeNft?.tokenId
                                                            ? 'ring-2 ring-offset-2 ring-indigo-500'
                                                            : 'focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500',
                                                        'group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-100 overflow-hidden'
                                                    )}
                                                >
                                                    <img
                                                        src={nft.meta.image}
                                                        alt=""
                                                        className={classNames(
                                                            nft.tokenId === activeNft?.tokenId ? '' : 'group-hover:opacity-75',
                                                            'object-cover pointer-events-none'
                                                        )}
                                                    />
                                                    <button type="button" className="absolute inset-0 focus:outline-none">
                                                        <span className="sr-only">View details for {nft.meta.name}</span>
                                                    </button>
                                                </div>
                                                <p className="block mt-2 text-sm font-medium text-gray-900 truncate pointer-events-none">
                                                    {nft.meta.name}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </div>
                        </main>

                        {/* Details sidebar */}
                        <aside className="hidden p-8 overflow-y-auto bg-white border-l border-gray-200 w-96 lg:block">
                            {activeNft &&
                                <div className="pb-16 space-y-6">
                                    <div>
                                        <div className="block w-full overflow-hidden rounded-lg aspect-w-10 aspect-h-7">
                                            <img src={activeNft.meta.image} alt="" className="object-cover" />
                                        </div>
                                        <div className="flex items-start justify-between mt-4">
                                            <div>
                                                <h2 className="text-lg font-medium text-gray-900">
                                                    <span className="sr-only">Details for </span>
                                                    {activeNft.meta.name}
                                                </h2>
                                                <p className="text-sm font-medium text-gray-500">{activeNft.meta.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Information</h3>
                                        <dl className="mt-2 border-t border-b border-gray-200 divide-y divide-gray-200">
                                            {activeNft.meta.attributes.map((attr) => (
                                                <div key={attr.trait_type} className="flex justify-between py-3 text-sm font-medium">
                                                    <dt className="text-gray-500">{attr.trait_type}: </dt>
                                                    <dd className="text-right text-gray-900">{attr.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>

                                    <div className="flex">
                                        <button
                                            type="button"
                                            className="flex-1 bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Download Image
                                        </button>
                                        <button
                                            disabled={activeNft.isListed}
                                            onClick={() => {
                                                nfts.listNft(
                                                    activeNft.tokenId,
                                                    activeNft.price
                                                )
                                            }}
                                            type="button"
                                            className="disabled:text-gray-400 disabled:cursor-not-allowed flex-1 ml-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            {activeNft.isListed ? "Nft is listed" : "List Nft"}
                                        </button>
                                    </div>
                                </div>
                            }
                        </aside>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
};

export default Profile;
