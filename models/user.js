const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 20 },
  last_name: { type: String, required: true, maxLength: 20 },
  username: { type: Schema.Types.Mixed, required: true },
  password: { type: Schema.Types.Mixed, required: true, minLength: 5 },
  membership_status: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
});

UserSchema.virtual("name").get(function () {
  let fullname = `${this.first_name} ${this.last_name}`;
  return fullname;
});

module.exports = mongoose.model("User", UserSchema);
