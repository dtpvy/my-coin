const { Block: BlockSchema } = require("../schemas/block");
const Block = require("../utils/block");
const { Transaction } = require("../schemas/transaction");
const { Wallet } = require("../schemas/wallet");
const BlockChain = require("../utils/blockchain");
const CoinKey = require("coinkey");
const bcrypt = require("bcrypt");
const sendToken = require("../utils/jwtToken");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const controllers = {
  getMe: async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
      res.status(401).send(null);
      return;
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const wallet = await Wallet.findById(decodedData.id);
    if (!wallet) {
      res.status(400).send(null);
      return;
    }
    const balance = await BlockChain.getBalance(wallet.publicKey);
    wallet.balance = balance;
    res.json(wallet);
  },
  getWallet: async (req, res) => {
    const wallet = await Wallet.findOne({ publicKey: req.params.address });
    res.json(wallet);
  },
  createGenesisBlock: async (req, res) => {
    await BlockSchema.deleteMany();
    const block = await BlockChain.createGenesisBlock().create();
    res.send(block);
  },
  getBlocks: async (req, res) => {
    const blocks = await BlockSchema.find();
    res.send(JSON.stringify(blocks));
  },
  getTransactions: async (req, res) => {
    const { address } = req.params;
    const transactions = await Transaction.find(
      address
        ? {
            $or: [{ from: address }, { to: address }],
          }
        : {}
    );
    res.send(JSON.stringify(transactions));
  },
  getAllTransactions: async (req, res) => {
    const transactions = await BlockChain.getTransactions();
    res.send(JSON.stringify(transactions));
  },
  postMine: async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
      res.status(401);
      return;
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const wallet = await Wallet.findById(decodedData.id);
    if (!wallet) {
      res.status(400);
      return;
    }

    const minedBlock = await BlockChain.mineBlock(wallet.publicKey);

    res.send(JSON.stringify(minedBlock));
  },
  getBalanceByAddress: async (req, res) => {
    const senderAddress = req.params.address;

    if (!validator.isHash(senderAddress, "sha256")) {
      console.log(senderAddress);
      res.sendStatus(400);
    }

    const balance = await BlockChain.getBalance(senderAddress);

    res.send(JSON.stringify(balance));
  },
  postTransfer: async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
      res.status(401);
      return;
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);

    const wallet = await Wallet.findById(decodedData.id);
    if (!wallet) {
      res.status(400).json({ message: "don't find any wallet" });
      return;
    }

    if (req.body.to === req.body.from) {
      res.status(400).send("Sender and Address can't have the same hash!");
      return;
    }

    const balance = await BlockChain.getBalance(req.body.from);

    if (balance < req.body.amount) {
      res.status(406).send("Out of balance!");
      return;
    }

    const transaction = await BlockChain.sendCoins(req.body, wallet.publicKey);

    res.send(JSON.stringify(transaction));
  },
  createWallet: async (req, res) => {
    const { name, password } = req.body;
    const isExist = await Wallet.findOne({ name });
    if (isExist) {
      res.status(409).json({ message: "Wallet is exist" });
      return;
    }

    const wallet = CoinKey.createRandom();
    const hashPassword = await bcrypt.genSalt(10).then((salt) => {
      return bcrypt.hash(password, salt);
    });

    const w = await Wallet.create({
      name,
      password: hashPassword,
      privateKey: wallet.privateKey.toString("hex"),
      publicKey: wallet.publicAddress.toString("hex"),
      amount: 0,
    });
    res.json(w);
  },
  signinWallet: async (req, res) => {
    const { name, password } = req.body;

    const wallet = await Wallet.findOne({ name });

    const isMatch = wallet && (await bcrypt.compare(password, wallet.password));
    if (isMatch) {
      sendToken(wallet, 200, res);
    } else {
      res.status(401).json({ message: "Password dosen't match" });
    }
  },
  logout: async (req, res) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  },
};

module.exports = controllers;
