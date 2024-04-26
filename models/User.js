const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Please add a name"],
			minlength: 6,
		},
		telephone: {
			type: String,
			required: [true, "Please add a telephone number"],
			minlength: 10,
		},
		email: {
			type: String,
			required: [true, "Please add an email"],
			unique: true,
			match: [
				/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
				"Please add a valid email",
			],
		},
		password: {
			type: String,
			required: [true, "Please add a password"],
			minlength: 4,
		},
		role: {
			type: String,
			enum: ["user", "admin", "owner"],
			default: "user",
		},
		banList: [
			{
				type: mongoose.Schema.ObjectId,
				ref: "Restaurant",
			},
		],
		favList: [
			{
				type: mongoose.Schema.ObjectId,
				ref: "Restaurant",
			},
		],

		resetPasswordToken: String,
		resetPasswordExpire: Date,
	},
	{ select: false }
);

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

// jwt
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE,
	});
};

// matchPassword
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
