const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/errorHandler");

// Create a new user (Admin Only)
exports.createUser = async (req, res, next) => {
  try {
    // Check if the logged-in user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Extract user details from request body
    const {
      name,
      email,
      password,
      role,
      salary,
      duty_time,
      permissions,
      address,
      phone,
      image,
    } = req.body;

    // Validate all required fields
    if (!name || !email || !password || !salary || !duty_time || !address || !phone) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if the user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "customer", // Default role is 'customer' if not provided
      salary,
      duty_time,
      permissions: permissions || [],
      address,
      phone,
      image,
    });

    // Send response
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        salary: newUser.salary,
        duty_time: newUser.duty_time,
        permissions: newUser.permissions,
        address: newUser.address,
        phone: newUser.phone,
        image: newUser.image,
      },
    });
  } catch (error) {
    console.error(error);
    next(new errorHandler(500, "User Creation Failed"));
  }
};

// Login a user
exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new errorHandler(400, "Email and password are required"));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return next(new errorHandler(404, "Invalid email or password"));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new errorHandler(400, "Invalid email or password"));
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Set the token in a cookie
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      maxAge: 3600000, // 1 hour in milliseconds
    });

    // Send response
    res.status(200).json({
      message: "Logged in successfully",
      token, // Optional: Send token in response body if needed
    });
  } catch (error) {
    console.error(error);
    next(new errorHandler(500, "User Login Failed"));
  }
};

//logout user
exports.logoutUser = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only over HTTPS in production
      sameSite: "Strict", // Prevent CSRF attacks
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error(error);
    next(new errorHandler(500, "User Logout Failed"));
  }
};

// Admin only: Edit a user's credentials
exports.updateUser = async (req, res, next) => {
  try {
    // Check if the logged-in user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Extract user ID from the request parameters
    const { userId } = req.params;

    // Extract updated fields from the request body
    const updates = req.body;

    // Disallow certain fields from being updated for security
    const restrictedFields = ["password", "role"];
    for (let field of restrictedFields) {
      if (updates[field]) {
        return res.status(400).json({ message: `${field} cannot be updated via this endpoint` });
      }
    }

    // Find the user and update their credentials
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true, // Return the updated document
      runValidators: true, // Validate fields before updating
    });

    // Check if the user exists
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the updated user as the response (excluding sensitive data)
    res.status(200).json({
      message: "User credentials updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        salary: updatedUser.salary,
        duty_time: updatedUser.duty_time,
        permissions: updatedUser.permissions,
        address: updatedUser.address,
        phone: updatedUser.phone,
        image: updatedUser.image,
      },
    });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Failed to update user credentials"));
  }
};

// Get all users(Admin Only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(
      {
        success: true,
        users
      });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Failed to get users"));

  }
}

//Update user image and passsword by user
exports.updateUserCredentials = async (req, res, next) => {
  try {
    // Step 1: Find the logged-in user using the decoded user ID from the token
    const userId = req.user._id; // Assuming the user is decoded from the token and attached to req.user

    // Step 2: Find the user in the database
    const user = await User.findById(userId);
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    // Step 3: Prepare the fields to be updated
    const { password, image } = req.body;

    // Step 4: Validate that either password or image is provided for update
    if (!password && !image) {
      return res.status(400).json({ message: "At least one field (password or image) must be provided for update" });
    }

    // Step 5: Update password if provided
    if (password) {
      // Validate password length or any other constraints if required
      if (password.length < 4 || password.length > 10) {
        return res.status(400).json({ message: "Password should be between 4 and 10 characters" });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
    }

    // Step 6: Update image if provided
    if (image) {
      user.image = image;
    }

    // Step 7: Save the updated user
    await user.save();

    // Step 8: Send the updated user information (excluding password)
    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "User update failed"));
  }
};
