const mongoose = require("mongoose");
const { Schema } = mongoose;

const walletSchema = new Schema({
  privateKey: String,
  publicKey: String,
  name: String,
  password: String,
  balance: Number,
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = {
  Wallet,
};
