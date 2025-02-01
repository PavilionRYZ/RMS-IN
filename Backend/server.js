const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require("./config/database");

// Load environment variables
dotenv.config({ path: "./config/.env" });

// Connect to the database
connectDB();

// Initialize Express app
const app = express();
app.use(cookieParser());


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


// Middleware to parse JSON requests
app.use(express.json());

app.use("/api/v1", userRoute);
app.use("/api/v1", menuRoute);
app.use("/api/v1", orderRoute);


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