// NftMarket chính là tên của smart contract của bạn NftMarket.sol
const NftMarket = artifacts.require("NftMarket");
const { ethers } = require("ethers");

contract("NftMarket", accounts => {
    let _contract = null;
    let _nftPrice = ethers.utils.parseEther("0.3").toString(); // giá của NFT item
    let _listingPrice = ethers.utils.parseEther("0.025").toString(); // listing price

    before(async () => {
        _contract = await NftMarket.deployed();
    });

    describe("Mint token", () => {
        const tokenURI = "https://test.com";
        before(async () => {
            // accounts[0] mint để nhận token có id là 1
            await _contract.mintToken(tokenURI, _nftPrice, {
                from: accounts[0], // msg.sender
                value: _listingPrice // msg.value
            });
        });

        // Mint token test
        it("owner of the first token should be address[0]", async () => {
            const owner = await _contract.ownerOf(1); // 0x9417822A7af06d35835aF0BA605bf7Db3E9688c5: id của account[0]
            // test để check owner có phải account đầu tiên không
            assert.equal(owner, accounts[0], "Owner of token is not matching address[0]");
        });

        // tokenURI test
        it("first token should point to the correct tokenURI", async () => {
            const actualTokenURI = await _contract.tokenURI(1); // https://test.com
            assert.equal(actualTokenURI, tokenURI, "tokenURI is not correctly set");
        });

        // Duplicate URI Test
        it("should not be possible to create a NFT with used tokenURI", async () => {
            try {
                await _contract.mintToken(tokenURI, _nftPrice, {
                    from: accounts[0]
                }); // tạo token mới
            } catch (error) {
                assert(error, "NFT was minted with previously used tokenURI");
            }
        });

        it("should have one listed item", async () => {
            const listedItemCount = await _contract.listedItemsCount(); // 1
            assert.equal(listedItemCount.toNumber(), 1, "Listed items count is not 1");
        });


        it("should have create NFT item", async () => {
            const nftItem = await _contract.getNftItem(1);
            // nftItem = [
            //     '1',
            //     '300000000000000000',
            //     '0x9417822A7af06d35835aF0BA605bf7Db3E9688c5',
            //     true,
            //     tokenId: '1',
            //     price: '300000000000000000',
            //     creator: '0x9417822A7af06d35835aF0BA605bf7Db3E9688c5',
            //     isListed: true
            // ]

            assert.equal(nftItem.tokenId, 1, "Token id is not 1");
            assert.equal(nftItem.price, _nftPrice, "Nft price is not correct");
            assert.equal(nftItem.creator, accounts[0], "Creator is not account[0]");
            assert.equal(nftItem.isListed, true, "Token is not listed");
        });
    });

    // Buy NFT
    describe("Buy NFT", () => {
        // hàm chạy trước khi thực hiện Buy NFT
        before(async () => {
            // accounts[1] mua token có tokenId là 1 từ accounts[0]
            await _contract.buyNft(1, {
                from: accounts[1], // người mua là account thứ 2
                value: _nftPrice // giá yêu cầu để mua
            });
        });

        // check NFT không còn trong list của owner cũ
        it("should unlist the item", async () => {
            const listedItem = await _contract.getNftItem(1); // owner cũ có tokenId là 1
            assert.equal(listedItem.isListed, false, "Item is still listed");
        });

        // check có giảm số lượng item trong list item
        it("should decrease listed items count", async () => {
            const listedItemsCount = await _contract.listedItemsCount();
            assert.equal(listedItemsCount.toNumber(), 0, "Count has not been decrement");
        });

        // check có thay đổi owner hay chưa
        it("should change the owner", async () => {
            const currentOwner = await _contract.ownerOf(1); // owner của tokenId bằng 1
            assert.equal(currentOwner, accounts[1], "Item is still listed");
        });
    });

    // Test token transfers
    describe("Token transfers", () => {
        const tokenURI = "https://test-json-2.com";
        before(async () => {
            // accounts[0] mint để nhận thêm 1 token nữa có id là 2
            await _contract.mintToken(tokenURI, _nftPrice, {
                from: accounts[0], // msg.sender
                value: _listingPrice // msg.value
            });
        });

        it("should have two NFTs created", async () => {
            const totalSupply = await _contract.totalSupply(); // tokenID: 1 và 2
            assert.equal(totalSupply.toNumber(), 2, "Total supply of token is not correct");
        });

        it("should be able to retreive nft by index", async () => {
            const nftId1 = await _contract.tokenByIndex(0);
            const nftId2 = await _contract.tokenByIndex(1);

            assert.equal(nftId1.toNumber(), 1, "Nft id is wrong");
            assert.equal(nftId2.toNumber(), 2, "Nft id is wrong");
        });

        // Test get all listed nfts
        it("should have one listed NFT", async () => {
            const allNfts = await _contract.getAllNftsOnSale(); // chỉ có tokenID là 2 đang được bán
            assert.equal(allNfts[0].tokenId, 2, "Nft has a wrong id");
        });

        it("account[1] should have one owned NFT", async () => {
            const ownedNfts = await _contract.getOwnedNfts({ from: accounts[1] });
            // ownedNfts1: [
            //     [
            //         '1',
            //         '300000000000000000',
            //         '0x9417822A7af06d35835aF0BA605bf7Db3E9688c5',
            //         false,
            //         tokenId: '1',
            //         price: '300000000000000000',
            //         creator: '0x9417822A7af06d35835aF0BA605bf7Db3E9688c5',
            //         isListed: false
            //     ]
            // ]
            assert.equal(ownedNfts[0].tokenId, 1, "Nft has a wrong id");
        });

        it("account[0] should have one owned NFT", async () => {
            const ownedNfts = await _contract.getOwnedNfts({ from: accounts[0] });
            // ownedNfts0: [
            //     [
            //         '2',
            //         '300000000000000000',
            //         '0x9417822A7af06d35835aF0BA605bf7Db3E9688c5',
            //         true,
            //         tokenId: '2',
            //         price: '300000000000000000',
            //         creator: '0x9417822A7af06d35835aF0BA605bf7Db3E9688c5',
            //         isListed: true
            //     ]
            // ]
            assert.equal(ownedNfts[0].tokenId, 2, "Nft has a wrong id");
        });

    });

    describe("Token transfer to new owner", () => {
        // ban đầu accounts[0] có 1 tokenID bằng 2, accounts[1] có 1 tokenID bằng 1
        before(async () => {
            await _contract.transferFrom(
                accounts[0],
                accounts[1],
                2
            );
        });

        // lúc này accounts[0] không còn token, accounts[1] gồm 2 token có tokenID bằng 1 và bằng 2

        it("accounts[0] should own 0 tokens", async () => {
            const ownedNfts = await _contract.getOwnedNfts({ from: accounts[0] });
            assert.equal(ownedNfts.length, 0, "Invalid length of tokens");
        });

        it("accounts[1] should own 2 tokens", async () => {
            const ownedNfts = await _contract.getOwnedNfts({ from: accounts[1] });
            assert.equal(ownedNfts.length, 2, "Invalid length of tokens");
        });
    });


    // // Quá trình Burn Token (Đốt token)
    // describe("Burn Token", () => {
    //     const tokenURI = "https://test-json3.com";
    //     before(async () => {
    //         // accounts[2] mint để nhận thêm 1 token nữa có id là 3
    //         await _contract.mintToken(tokenURI, _nftPrice, {
    //             from: accounts[2],
    //             value: _listingPrice
    //         });
    //     });

    //     it("account[2] should have one owned NFT", async () => {
    //         const ownedNfts = await _contract.getOwnedNfts({ from: accounts[2] });
    //         assert.equal(ownedNfts[0].tokenId, 3, "Nft has a wrong id");
    //     });

    //     it("account[2] should own 0 NFTs", async () => {
    //         await _contract.burnToken(3, { from: accounts[2] }); // Burn token thì accounts[2] không còn token nào cả
    //         const ownedNfts = await _contract.getOwnedNfts({ from: accounts[2] });

    //         assert.equal(ownedNfts.length, 0, "Invalid length of tokens");
    //     });
    // });


    // listing of nfts
    describe("List an Nft", () => {
        before(async () => {
            // accounts[1] đưa token có tokenId là 1 với newPrice = _nftPrice
            await _contract.placeNftOnSale(
                1,
                _nftPrice,
                {
                    from: accounts[1], // owner
                    value: _listingPrice
                }
            );
        });

        it("should have two listed items", async () => {
            const listedNfts = await _contract.getAllNftsOnSale(); // có tokenID là 1 và 2 đang được bán

            assert.equal(listedNfts.length, 2, "Invalid length of Nfts");
        });

        it("should set new listing price", async () => {
            await _contract.setListingPrice(_listingPrice, { from: accounts[0] }); // owner mặc định blockchain là accounts[0]
            const listingPrice = await _contract.listingPrice();

            assert.equal(listingPrice.toString(), _listingPrice, "Invalid Price");
        });

    });

});