const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please add a name"],
		unique: true,
	},
	address: {
		type: String,
		required: [true, "Please add an address"],
	},
	telephone: {
		type: String,
		required: [true, "Please add a telephone number"],
	},
	openTime: {
		type: String,
		required: [true, "Please add opening time"],
	},
	closeTime: {
		type: String,
		required: [true, "Please add closing time"],
	},
	tables: {
		type: Number,
		required: [true, "Please specify the number of tables"],
	},
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
