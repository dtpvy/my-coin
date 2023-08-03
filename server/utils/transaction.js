const { Transaction: TransactionSchema } = require("../schemas/transaction");

class Transaction {
  /**
   * @param  {string} from hash address of an sender
   * @param  {string} to hash address of the wallet
   * @param  {number} amount
   */
  constructor(from, to, amount) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.timestamp = Date.now();
  }
  async create() {
    const transaction = await TransactionSchema.create({
      from: this.from,
      to: this.to,
      amount: this.amount,
      timestamp: this.timestamp,
    });
    return transaction;
  }
}

module.exports = Transaction;
