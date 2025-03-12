const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require("./config/database");
const cors = require('cors');
// require("./controllers/cronJobs");

// Load environment variables
dotenv.config({ path: "./config/.env" });

// Connect to the database
connectDB();

// Initialize Express app
const app = express();
app.use(cookieParser());
app.use(cors());
app.use(express.json());


//<------- uncaught ref err ------->

process.on("uncaughtException", (err) => {
    console.log("Server is closing due to uncaughtException");
    console.log(`Error: ${err.message}`);
    process.exit(1);
})

// <------- end of uncaught ref err ------->

const userRoute = require('./routes/userRoute');
const menuRoute = require('./routes/menuRoutes');
const orderRoute = require('./routes/orderRoute');
const inventoryRoute = require('./routes/inventoryRoute');
// const analysisRoute = require('./routes/analysisRoute');
const paymentRoute = require('./routes/paymentRoute');


// Middleware to parse JSON requests
app.use(express.json());

app.use("/api/v1", userRoute);
app.use("/api/v1", menuRoute);
app.use("/api/v1", orderRoute);
app.use("/api/v1", inventoryRoute);
// app.use("/api/v1", analysisRoute);
app.use("/api/v1", paymentRoute);


//Global Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// Unhandled promise rejection

process.on("unhandledRejection", (err) => {
    console.log("Server is closing due to unhandledRejection");
    console.log(`Error: ${err.message}`);

    server.close(() => {
        process.exit(1);
    });

})