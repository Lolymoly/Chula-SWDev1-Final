const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const auth = require("./routes/auth");
const restaurants = require("./routes/restaurants");
const reservations = require("./routes/reservations");
const users = require("./routes/users");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

dotenv.config({ path: "./config/config.env" });
connectDB();
const app = express();

// Configure CORS
app.use(
	cors({
		origin: "http://localhost:3000", // Allow only the React application to access the API
		credentials: true, // Allow cookies to be sent from the frontend
	})
);

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(cors());

const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 100,
});
app.use(limiter);

app.use("/api/v1/auth", auth);
app.use("/api/v1/restaurants", restaurants);
app.use("/api/v1/reservations", reservations);
app.use("/api/v1/users", users);

const PORT = process.env.PORT || 5000;

const server = app.listen(
	PORT,
	console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
	console.log(`Error: ${err.message}`);
	server.close(() => process.exit(1));
});

//.
