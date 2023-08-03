const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema({
  from: String,
  to: String,
  amount: Number,
  timestamp: Number,
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = {
  Transaction,
};
