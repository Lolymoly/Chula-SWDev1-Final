const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: true,
	},
	restaurantId: {
		type: mongoose.Schema.ObjectId,
		ref: "Restaurant",
		required: true,
	},
	date: {
		type: Date,
		required: [true, "Please specify the reservation date"],
	},
	numberOfTables: {
		type: Number,
		required: [true, "Please specify the number of tables"],
		max: [3, "You can reserve up to 3 tables"],
	},
});

module.exports = mongoose.model("Reservation", ReservationSchema);
