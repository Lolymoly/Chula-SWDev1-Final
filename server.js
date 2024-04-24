const express = require("express");
const dotenv = require("dotenv");
const hospitals = require("./routes/hospitals");
const connectDB = require("./config/db");
const auth = require("./routes/auth");
const cookieParser = require("cookie-parser");
const appointments = require("./routes/appointments");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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

app.use("/api/v1/hospitals", hospitals);
app.use("/api/v1/auth", auth);
app.use("/api/v1/appointments", appointments);

const swaggerOptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Hospital API",
			version: "1.0.0",
			description: "Hospital API Information",
		},
		servers: [
			{
				url: "http://localhost:5000/api/v1",
			},
		],
	},
	apis: ["./routes/*.js"],
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
