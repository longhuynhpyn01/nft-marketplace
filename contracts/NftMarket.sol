// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NftMarket is ERC721URIStorage, Ownable {
  using Counters for Counters.Counter;

  // tạo struct với các gộp thông tin liên quan thành 1 nhóm
  struct NftItem {
    uint tokenId; // token Id
    uint price; // giá
    address creator; // người tạo ra
    bool isListed; // có nằm trong list Nft Item, true thì có nghĩa đang bán trên NFT Marketplace
  }

  // bạn có thể emit event này trong function của bạn
  // mỗi khi ai đó tạo ra NFT thì sẽ thực thay đổi bằng cách lắng nghe event này trong app của bạn
  event NftItemCreated (
    uint tokenId,
    uint price,
    address creator,
    bool isListed
  );

  uint public listingPrice = 0.025 ether; // listing price

  Counters.Counter private _listedItems;
  Counters.Counter private _tokenIds;

  // mapping https://json.com => true để xác nhận token đã tồn tại hay chưa
  mapping(string => bool) private _usedTokenURIs;

  // mapping tokenID sang NFT Item tương ứng
  mapping(uint => NftItem) private _idToNftItem;

  // mapping address của tokenId sang (mapping Owner Index => tokenId)
  mapping(address => mapping(uint => uint)) private _ownedTokens;

  // mapping tokenId sang Owner Index tương ứng
  mapping(uint => uint) private _idToOwnedIndex;

  uint256[] private _allNfts; // lưu tất cả mảng các tokenId. Vd:[1, 2, 3 ...]

  // mapping tokenId sang NFT Index
  mapping(uint => uint) private _idToNftIndex;

  constructor() ERC721("CreaturesNFT", "CNFT") {}

  // hàm để đặt lại giá niêm yết mà chỉ owner mới có quyền
  function setListingPrice(uint newPrice) external onlyOwner {
    require(newPrice > 0, "Price must be at least 1 wei");
    listingPrice = newPrice;
  }

  // lấy ra NFT Item với tokenId tương ứng
  function getNftItem(uint tokenId) public view returns (NftItem memory) {
    return _idToNftItem[tokenId];
  }

  // lấy số lượng item hiện tại trong List NFT Item
  function listedItemsCount() public view returns (uint) {
    return _listedItems.current();
  }

  // trả về true có nghĩa đã tồn tại
  function tokenURIExists(string memory tokenURI) public view returns (bool) {
    return _usedTokenURIs[tokenURI] == true;
  }

  // trả về độ dài tất cả NFT hiện có
  function totalSupply() public view returns (uint) {
    return _allNfts.length;
  }

  // trả về tokenId bởi NFT với index tương ứng
  function tokenByIndex(uint index) public view returns (uint) {
    require(index < totalSupply(), "Index out of bounds");
    return _allNfts[index];
  }

  // trả về tokenId bởi Owner với index tương ứng
  function tokenOfOwnerByIndex(address owner, uint index) public view returns (uint) {
    require(index < ERC721.balanceOf(owner), "Index out of bounds");
    return _ownedTokens[owner][index];
  }

  // hàm để lấy tất cả NFT đang được bán
  function getAllNftsOnSale() public view returns (NftItem[] memory) {
    uint allItemsCounts = totalSupply();
    uint currentIndex = 0;
    NftItem[] memory items = new NftItem[](_listedItems.current());

    for (uint i = 0; i < allItemsCounts; i++) {
      uint tokenId = tokenByIndex(i);
      NftItem storage item = _idToNftItem[tokenId];

      // chỉ lấy NFT có isListed là true có nghĩa là có thể bán
      if (item.isListed == true) {
        items[currentIndex] = item;
        currentIndex += 1;
      }
    }

    return items;
  }
    
  // hàm trả về NFT đang được sở hữu bởi người gửi
  function getOwnedNfts() public view returns (NftItem[] memory) {
    uint ownedItemsCount = ERC721.balanceOf(msg.sender);
    NftItem[] memory items = new NftItem[](ownedItemsCount);

    for (uint i = 0; i < ownedItemsCount; i++) {
      uint tokenId = tokenOfOwnerByIndex(msg.sender, i);
      NftItem storage item = _idToNftItem[tokenId];
      items[i] = item;
    }

    return items;
  }

  // Burn Token: quá trình loại bỏ vĩnh viễn một lượng token nhất định khỏi nguồn cung lưu hành
  // function burnToken(uint tokenId) public {
  //   _burn(tokenId);
  // }

  // Mint Token: quá trình đưa dữ liệu vào Blockchain và chuyển chúng thành các đồng tiền mã hóa (mã thông báo) có thể giao dịch
  // hàm để tạo ra token mới, sau đó lưu trữ NFT vào smart contract của bạn
  // tokenURI: link đến NFT metadata của bạn. Ví dụ: https://pinata.com/...
  function mintToken(string memory tokenURI, uint price) public payable returns (uint) {
    require(!tokenURIExists(tokenURI), "Token URI already exists");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    // dòng bên dưới chạy nếu tokenURI chưa tồn tại
    _tokenIds.increment();
    _listedItems.increment();

    uint newTokenId = _tokenIds.current();

    _safeMint(msg.sender, newTokenId); // lưu để tạo token cho 1 message sender mà user có thể gửi transaction cho smart contract và sau đó nhận nó
    _setTokenURI(newTokenId, tokenURI); // gán value của newTokenId bằng tokenURI
    _createNftItem(newTokenId, price); // tạo ra NFT Item
    _usedTokenURIs[tokenURI] = true; // mapping gán value này true để xác nhận token đã tồn tại

    return newTokenId;
  }

  // hàm dùng để tạo ra nơi bán NFT
  function placeNftOnSale(uint tokenId, uint newPrice) public payable {
    require(ERC721.ownerOf(tokenId) == msg.sender, "You are not owner of this nft");
    require(_idToNftItem[tokenId].isListed == false, "Item is already on sale");
    require(msg.value == listingPrice, "Price must be equal to listing price");

    _idToNftItem[tokenId].isListed = true; // xác nhận đã đưa lên marketplace
    _idToNftItem[tokenId].price = newPrice; // đặt lại giá bán
    _listedItems.increment(); // tăng số lượng mặt hàng trên marketplace
  }

  // buy NFT Item
  function buyNft(uint tokenId) public payable {
    uint price = _idToNftItem[tokenId].price;
    address owner = ERC721.ownerOf(tokenId);

    require(msg.sender != owner, "You already own this NFT"); // kiểm tra người mua đã sở hữu chưa, được mua bởi những người không nằm trong ds
    require(msg.value == price, "Please submit the asking price"); // kiểm tra có đúng giá

    _idToNftItem[tokenId].isListed = false; // đánh dấu không còn nằm trong list Marketplace
    _listedItems.decrement(); // giảm số lượng listedItemsCount

    _transfer(owner, msg.sender, tokenId); // transfer sang owner mới
    payable(owner).transfer(msg.value); // transfer money cho owner cũ
  }

  // tạo ra NFT Item
  function _createNftItem(uint tokenId, uint price) private {
    require(price > 0, "Price must be at least 1 wei");

    _idToNftItem[tokenId] = NftItem(tokenId, price, msg.sender, true); // mapping

    emit NftItemCreated(tokenId, price, msg.sender, true);
  }

  // hàm gọi trước khi transfer token khi chạy hàm _safeMint ở hàm mintToken
  // function _beforeTokenTransfer(address from, address to, uint tokenId) internal virtual override {
  function _beforeTokenTransfer(address from, address to, uint tokenId, uint batchSize) internal virtual override {
    // super._beforeTokenTransfer(from, to, tokenId);
    super._beforeTokenTransfer(from, to, tokenId, batchSize);

    if (from == address(0)) {
      // gọi khi minting token
      _addTokenToAllTokensEnumeration(tokenId);
    } else if (from != to) {
      // gọi khi transfer token
      _removeTokenFromOwnerEnumeration(from, tokenId);
    }

    if (to == address(0)) {
      // gọi khi burn token (Burn là quá trình loại bỏ vĩnh viễn một lượng token nhất định khỏi nguồn cung lưu hành)
      _removeTokenFromAllTokensEnumeration(tokenId);
    } else if (to != from) {
      // gọi khi mint token hoặc transfer token
      _addTokenToOwnerEnumeration(to, tokenId);
    }
  }

  // hàm để thêm token vào array Tokens Enumaration
  function _addTokenToAllTokensEnumeration(uint tokenId) private {
    _idToNftIndex[tokenId] = _allNfts.length; // mapping { 1 => 0 }
    _allNfts.push(tokenId); // thêm vào list NFT [ 1 ]
  }

  // hàm để thêm token vào array Owner Enumaration mới
  // (0x2c, 1)
  function _addTokenToOwnerEnumeration(address to, uint tokenId) private {
    // số token mà hiện tại user đang sở hữu
    // nếu user mint hoặc mua 2 token thì có nghĩa gt length là 2
    uint length = ERC721.balanceOf(to); // 0
    _ownedTokens[to][length] = tokenId; // { 0x2c => 0 => 1}
    _idToOwnedIndex[tokenId] = length; // { 1 => 0 }
  }

  // hàm để xóa token khỏi array Owner Enumaration cũ
  function _removeTokenFromOwnerEnumeration(address from, uint tokenId) private {
    uint lastTokenIndex = ERC721.balanceOf(from) - 1;
    uint tokenIndex = _idToOwnedIndex[tokenId];

    // nếu vị trí cần xóa tokenIndex không phải nằm cuối mảng
    if (tokenIndex != lastTokenIndex) {
      uint lastTokenId = _ownedTokens[from][lastTokenIndex]; // lấy tokenId tại vị trí cuối cùng

      _ownedTokens[from][tokenIndex] = lastTokenId; // gán lại giá trị mapping tại tokenIndex thành lastTokenId 
      _idToOwnedIndex[lastTokenId] = tokenIndex; // gán lại khi mapping tokenId thành tokenIndex
    }

    delete _idToOwnedIndex[tokenId];
    delete _ownedTokens[from][lastTokenIndex];
  }

  // hàm để xóa token khỏi mảnh ds tất cả token
  function _removeTokenFromAllTokensEnumeration(uint tokenId) private { // 2
    uint lastTokenIndex = _allNfts.length - 1; // 3, _allNfts = [1, 2, 3, 4]
    uint tokenIndex = _idToNftIndex[tokenId]; // 1, _idToNftIndex = { 1 => 0, 2 => 1, 3 => 2, 4 => 3 }
    uint lastTokenId = _allNfts[lastTokenIndex]; // 4

    _allNfts[tokenIndex] = lastTokenId; // _allNfts = [1, 4, 3, 4]
    _idToNftIndex[lastTokenId] = tokenIndex; // idToNftIndex = { 1 => 0, 2 => 1, 3 => 2, 4 => 1 }

    delete _idToNftIndex[tokenId]; // idToNftIndex = { 1 => 0, 3 => 2, 4 => 1 }
    _allNfts.pop(); // _allNfts = [1, 4, 3]
  }
}