var express = require("express");
const router = express.Router();

const controllers = require("../controllers");

router.post("/migrate", controllers.createGenesisBlock);

router.post("/me", controllers.getMe);

router.post("/wallet/address/:address", controllers.getWallet);

router.get("/blocks", controllers.getBlocks);

router.get("/transactions/:address", controllers.getTransactions);

router.get("/all/transactions", controllers.getAllTransactions);

router.post("/mine", controllers.postMine);

router.get("/balance/:address", controllers.getBalanceByAddress);

router.post("/transfer", controllers.postTransfer);

router.post("/wallet/create", controllers.createWallet);

router.post("/wallet/signin", controllers.signinWallet);

router.post("/logout", controllers.logout);

module.exports = router;
