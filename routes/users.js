const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
	getUsers,
	getUser,
	createUser,
	updateUser,
	deleteUser,
} = require("../controllers/users");

// CRUD operations for Users
router.route("/").get(protect, getUsers).post(createUser); // Public access to register a new user

router
	.route("/:id")
	.get(protect, getUser) // Users can view their profile
	.put(protect, updateUser) // Users can update their profile
	.delete(protect, authorize("admin"), deleteUser); // Only admin can delete users

module.exports = router;
