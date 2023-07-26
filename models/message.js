const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: Schema.Types.Mixed, required: true, maxLength: 100 },
  time: { type: Date, default: Date.now(), required: true },
  text: { type: Schema.Types.Mixed, required: true, maxLength: 300 },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Message", MessageSchema);
