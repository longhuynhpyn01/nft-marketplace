1. npm i ethers @metamask/providers
=> Ethers là 1 thư viện web3. Nó cung cấp cho chúng tôi các util và functionalities để giúp chúng tôi giao tiếp với smart contract.
=> Metamask cung cấp cho chúng tôi type dành cho Ethereum.

2. Secret Recovery Phrase: "message jump smooth visa cart spirit foster monitor vacuum medal flat scene"

3. Cài đặt Ganache
- Bạn sẽ sử dụng để mô phỏng hợp đồng thông minh của chúng tôi trên chuỗi khối kỹ thuật số (the digital blockchain).
=> project này sử dụng cách giải quyết private.
- Search "Ganache install" và chọn page Ganache - Truffle Suite (Private Tool)
- Truffle là một công cụ sẽ giao tiếp với ganache tới giao diện dòng lệnh.
- npm install -g truffle

4. Migrate with Truffle Console
- truffle unbox metacoin
- truffle migrate: Điều này sẽ cho phép kết nối sử dụng các tham số kết nối mặc định của Ganache


- Once this operation is completed, you'll now have a project structure with the following items:
    + contracts/: Directory for Solidity contracts
    + migrations/: Directory for scriptable deployment files
    + test/: Directory for test files for testing your application and contracts
    + truffle.js: Truffle configuration file


5. Tạo Smart Contract NFT Market mà mirgate Blockchain


6. Cách giao tiếp Smart Contract thông qua travel
- npm i @openzeppelin/contracts
=> @openzeppelin/contracts cung cấp việc tạo Smart Contract nhằm dùng như là blueprint cho một Smart Contract 

- Tiêu chuẩn của NFT Smart Contract là Smart Contract với collar
=> có nhiều loại như ERC20, ERC721, ERC777, ERC1155 
=> chọn ERC721 
- truffle migrate --reset: để reset lại phiên bản mới nhất

- truffle console: để gọi nhiều function 
    + const instance = await NftMarket.deployed() => nhận được phiên bản đối tượng Javascript của smart contract press
    => deploy smart contract giúp bạn nhận được đại diện đối tượng Javascript cho smart contract cuae bạn trong 1 bid
    + const name = await instance.name()
    => để lấy được name của NftMarket là "CreaturesNFT"
    + const symbol = await instance.symbol()
    => để lấy được symbol của NftMarket là "CNFT"
    

7. Khởi tạo loadContract để load smart contract của bạn tại file componentions/providers/web3/utils.ts
- Xem thông tin network tại public/contracts/NftMarket.json
- Thay đổi code contract tại file componentions/providers/web3/index.tsx
- Để gọi contract.name() hoặc contract.symbol() thì ta cần thêm network tại MetaMask


8. Thêm Network
- Network name: Ganache
- New RPC URL: http://127.0.0.1:7545
- Chain ID: 1337
- Currency symbol: ETH


9. useAccount hook
- npm i swr =>

10. Tạo Type Hook CryptoHookFactory


11. Prepare test in Chapter 10 Mint Token - Smart Contract
- Tạo file test/nftMarket.test.js
- Vô cmd nhập:
+ truffle console
+ _contract = await NftMarket.deployed();
+ let name = _contract.name(); // "CreaturesNFT"
+ accounts => mảng danh sách tài khoản trong ganache
<!-- [
  '0x9417822A7af06d35835aF0BA605bf7Db3E9688c5',
  '0xF7373bb4F0149EA0cc8fE90d42835D6DA1a6A3A4',
  '0x9fDDbFD6d1e54B066Be6E5171D54Ca391eB73B5A',
  '0x9fD1d2987294bf70FbE47434F04b7024E5d0Eccd',
  '0x48F3d1001f4b1Ef06Bf5E8D34C5098466Cf6E3A8',
  '0x332A8a0f206c548A51aC80Ec46393aC451c1D215',
  '0xD6f8B409e92f9a0Ed53233C67C83F3aa0EDE73DF',
  '0x662a74D963BA1CcAC6B7E8308C40adaFe9a2feD1',
  '0x72D04a0C41792d1aB6a5C97AA1923B5e77062490',
  '0x9f9Ec05Bc9bF24076B01cD274b281e811275A7B9'
] -->
=> truffle test => để test

12. Connection giữa blockchain và NFT Metadata
- Folder test/nftMeta chứa ảnh và json (chứa thông tin về NFT).
- Search Pinata NFT.
- Truy cập https://www.pinata.cloud/ vào tạo account free.
- Pinata: cho phép bạn upload file lên để lưu trữ.
- Upload Creature_1.png, Creature_2.png, creature-1.json, creature-2.json lên Pinata.
- Chuẩn bị để test trên terminal => tạo file test/commands.js và copy 3 dòng code ở đó lên terminal
- truffle console => copy code commands.js
  + instance.getAllNftsOnSale()
  => để lấy ra tất cả NFT đang được sale => trả ra mảng 2 phần tử NFT được tạo ra
  + instance.tokenURI(1); // https://gateway.pinata.cloud/ipfs/QmQERob9GQUXeQ1ichxYbSTc6dq4nQ2w7TyrKhZbUtYnGb
  => lấy ra tokenURI của tokenID là 1 
  + instance.tokenURI(2); // https://gateway.pinata.cloud/ipfs/QmNjQQh6sPR11MjWcnXq8NGcxWkjRDdLpXHemLfs9nSpyA
  => lấy ra tokenURI của tokenID là 2 

13. ethereum-abi-types-generator ^1.3.2
- npm i ethereum-abi-types-generator
  <!-- "scripts": {
    ...,
    "lint": "next lint",
    "genContractType": "abi-types-generator './public/contracts/NftMarket.json' --output='./types' --name=nftMarketContract --provider=ethers_v5"
  }, -->
- npm run genContractType => tạo ra file types/nftMarketContract.ts

14. Verification architecture 


Để lưu trữ data trên Pinata, ta cần thực các bước như sau:

a. Lưu trữ message trong cookies
- Trước khi tạo data, chúng tạo tạo data trên Pinata. 
- Chúng ta sẽ xác thực address của user có kết nối đến wallet.
- Vì vậy phía Client sẽ gửi 1 request GET (/api/verify) message chứa data từ form đến phía Server.
- Phía Server sẽ tự động tạo ra message có dạng { contractAddress (lấy trong file NftMarket.json), randomId } và sẽ set lại session.
- Server sẽ gửi ngược lại session cho phía Client một message được sinh ra.
- Client sẽ lưu trữ message này trong cookies browser.
- Khi này ta sẽ nhận được message trở lại từ phía Client.

b. Tạo signature cho message này
- Để tạo signature ta cần cung cấp message được nhận ở trên, account đã kết nối đến wallet và password.

  createSig(message, account, password)

c. Verify account
- Gửi 1 request POST (/api/verify) với tham số body { address (connected đến wallet), signature, NFT (lưu trữ trên Pinata) } đến phía Server.
- Phía Server sẽ nhận được unsigned message từ session.

** So sánh Signature và Unsigned message
- Khi sending body của request để verify đều giống nhau có nghĩa address có nguồn gốc như nhau => address valid
- Có sự match với nhau thông qua address.
  + Address valid: Upload NFT
  + Address invalid: thoát, thông báo lỗi
=> trả về kết quả cho Client

d. Handle response


15. next-iron-session
- npm i next-iron-session
=> tạo ra session bên phía Server
- npm i uuid
=> để tạo ra random id
- npm i axios
=> để fetch dữ liệu
- npm i --save-dev @types/uuid


16. ethereumjs-util
- npm i ethereumjs-util
=> để giúp truy xuất address từ signature