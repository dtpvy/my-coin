const Block = require("./block");
const Transaction = require("./transaction");
const { Block: BlockSchema } = require("../schemas/block");

const createGenesisBlock = () => {
  return new Block(
    0,
    Date.now(),
    {
      pow: 9,
      transactions: [],
    },
    "0"
  );
};

const proofOfWork = (lastProof) => {
  let incrementor = lastProof + 1;
  while (!(incrementor % 9 === 0 && incrementor % lastProof === 0)) {
    incrementor += 1;
  }
  return incrementor;
};

const mineBlock = async (address = DEFAULT_MINER, tx) => {
  const blocks = await BlockSchema.find();

  const lastBlock = blocks[blocks.length - 1];
  const lastProof = lastBlock.data["pow"];

  let nodeTransactions = [...lastBlock.data.transactions];

  const proof = proofOfWork(lastProof);

  if (tx?.id) {
    nodeTransactions.push(tx);
  } else {
    const transaction = await new Transaction("network", address, 1).create();
    nodeTransactions.push(transaction);
  }

  const newBlockIndex = lastBlock.index + 1;
  const newBlockTimestamp = Date.now();
  const lastBlockHash = lastBlock.hash;
  const newBlockData = {
    pow: proof,
    transactions: nodeTransactions,
  };

  nodeTransactions = [];

  const minedBlock = await new Block(
    newBlockIndex,
    newBlockTimestamp,
    newBlockData,
    lastBlockHash
  ).create();

  return minedBlock;
};

/**
 * @param  {string} address hash address of requester
 */
const getBalance = async (address) => {
  const blocks = await BlockSchema.find();

  const lastBlock = blocks[blocks.length - 1];
  const transactions = lastBlock.data.transactions;
  let balance = 0;

  for (let i in transactions) {
    const tx = transactions[i];

    if (tx.from === address) {
      balance = balance - tx.amount;
    } else if (tx.to === address) {
      balance = balance + tx.amount;
    }
  }

  return balance;
};

const sendCoins = async (reqBody, address) => {
  const transferTransaction = await new Transaction(
    reqBody.from,
    reqBody.to,
    reqBody.amount
  ).create();

  await mineBlock(address, transferTransaction);

  return transferTransaction;
};

const getTransactions = async () => {
  const blocks = await BlockSchema.find();

  const lastBlock = blocks[blocks.length - 1];

  return lastBlock.data.transactions;
};

module.exports = {
  createGenesisBlock,
  proofOfWork,
  mineBlock,
  getTransactions,
  sendCoins,
  getBalance,
};
