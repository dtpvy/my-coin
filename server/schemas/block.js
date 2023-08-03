const mongoose = require("mongoose");
const { Schema } = mongoose;

const blockSchema = new Schema({
  index: Number,
  timestamp: Number,
  data: Object,
  prevHash: String,
});

const Block = mongoose.model("Block", blockSchema);

module.exports = {
  Block,
};
