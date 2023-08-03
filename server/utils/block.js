const crypto = require("crypto-js");
const { Block: BlockSchema } = require("../schemas/block");

class Block {
  /**
   * @param  {number} index
   * @param  {number} timestamp
   * @param  {Object} data
   * @param  {string} prevHash
   */
  constructor(index, timestamp, data, prevHash) {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.prevHash = prevHash;
    this.hash = this.hashBlock();
  }

  hashBlock() {
    const strToHash = this.index + this.timestamp + this.data + this.prevHash;

    return crypto.SHA256(strToHash).toString();
  }

  async create() {
    const block = await BlockSchema.create({
      index: this.index,
      timestamp: this.timestamp,
      data: this.data,
      prevHash: this.prevHash,
    });
    return block;
  }
}

module.exports = Block;
