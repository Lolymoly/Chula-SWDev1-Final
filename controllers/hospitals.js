const Hospital = require("../models/Hospital");
const vacCenter = require("../models/VacCenter");

// Get all hospitals
// HTTP Method: GET
// API Route: /api/v1/hospitals
const getHospitals = async (req, res, next) => {
	// res.status(200).json({ success: true, msg: "Show all hospitals" });
	let query;
	const reqQuery = { ...req.query };
	const removeFields = ["select", "sort", "page", "limit"];

	removeFields.forEach((param) => delete reqQuery[param]);
	console.log(reqQuery);

	let queryStr = JSON.stringify(reqQuery);
	queryStr = queryStr.replace(
		/\b(gt|gte|lt|lte|in)\b/g,
		(match) => `$${match}`
	);

	query = Hospital.find(JSON.parse(queryStr)).populate("appointments");

	// select
	if (req.query.select) {
		const fields = req.query.select.split(",").join(" ");
		query = query.select(fields);
	}
	// sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(",").join(" ");
		query = query.sort(sortBy);
	} else {
		query = query.sort("name");
	}

	// pagination
	const page = parseInt(req.query.page, 10) || 1;
	const limit = parseInt(req.query.limit, 10) || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Hospital.countDocuments();

	query = query.skip(startIndex).limit(limit);

	try {
		const hospitals = await Hospital.find(query);
		console.log(query);

		// Pagination result
		const pagination = {};
		if (endIndex < total) {
			pagination.next = {
				page: page + 1,
				limit,
			};
		}
		if (startIndex > 0) {
			pagination.prev = {
				page: page - 1,
				limit,
			};
		}
		res.status(200).json({
			success: true,
			data: hospitals,
			count: hospitals.length,
			pagination,
		});
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

// Get a specific hospital by ID
// HTTP Method: GET
// API Route: /api/v1/hospitals/:id
const getHospital = async (req, res, next) => {
	// res
	// 	.status(200)
	// 	.json({ success: true, msg: `Show hospital ${req.params.id}` });
	try {
		const hospital = await Hospital.findById(req.params.id);
		if (!hospital) {
			return res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: hospital });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

// Create a new hospital
// HTTP Method: POST
// API Route: /api/v1/hospitals
const createHospital = async (req, res, next) => {
	// console.log(req.body);
	// res.status(200).json({ success: true, msg: "Create new hospitals" });
	const hospital = await Hospital.create(req.body);
	res.status(201).json({ success: true, data: hospital });
};

// Update an existing hospital
// HTTP Method: PUT
// API Route: /api/v1/hospitals/:id
const updateHospital = async (req, res, next) => {
	// res
	// 	.status(200)
	// 	.json({ success: true, msg: `Update hospital ${req.params.id}` });
	try {
		const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});
		if (!hospital) {
			return res.status(400).json({ success: false });
		}
		res.status(200).json({ success: true, data: hospital });
	} catch (err) {
		console.log(err);
		res.status(400).json({ success: false });
	}
};

// Delete a hospital
// HTTP Method: DELETE
// API Route: /api/v1/hospitals/:id
const deleteHospital = async (req, res, next) => {
	// res
	// 	.status(200)
	// 	.json({ success: true, msg: `Delete hospital ${req.params.id}` });
	try {
		const hospital = await Hospital.findById(req.params.id);
		if (!hospital) {
			return res.status(400).json({ success: false });
		}
		await hospital.deleteOne();
		res.status(200).json({ success: true, data: {} });
	} catch (err) {
		res.status(400).json({ success: false });
	}
};

//@desc    Get vaccine centers
//@route   GET /api/v1/hospitals/vacCenters
//@access  Public

const getVacCenters = async (req, res, next) => {
	vacCenter.getAll((err, data) => {
		if (err) {
			res.status(500).send({
				message:
					err.message || "Some error occurred while retrieving vacCenters.",
			});
		} else {
			res.send(data);
		}
	});
};

module.exports = {
	getHospitals,
	getHospital,
	createHospital,
	updateHospital,
	deleteHospital,
	getVacCenters,
};
