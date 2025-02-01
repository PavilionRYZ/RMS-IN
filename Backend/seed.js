const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/user"); // Adjust the path as necessary

// Load environment variables
dotenv.config({ path: "./config/.env" });

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};

// Seed admin data
const seedAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: "admin@example.com" });
        if (existingAdmin) {
            console.log("Admin already exists in the database");
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash("admin123", 10);

        // Create admin user
        const admin = new User({
            name: "Super Admin",
            email: "admin@example.com",
            password: hashedPassword,
            role: "admin",
            salary: 0,
            duty_time: "Always Available",
            permissions: ["manage_users", "manage_menu", "manage_inventory", "view_reports"],
            address: "N/A",
            phone: 1234567890,
            image: "",
        });

        await admin.save();
        console.log("Admin seeded successfully");
    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the script
const runSeeder = async () => {
    await connectDB();
    await seedAdmin();
};

runSeeder();
