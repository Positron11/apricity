const mongoose = require("mongoose");
const passportLocalMongoose = require('passport-local-mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
	roles: { type: Array },
	email: { type: String }
}, { timestamps: true });

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);