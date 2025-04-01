const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/errorHandler");
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Store OTPs with expiry times
const otpStore = {};

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services like SendGrid, AWS SES, etc.
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to create a token and send response
const sendResponseWithToken = (user, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  const { password: pass, ...rest } = user._doc; // Exclude password from the response

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Strict",
    maxAge: 1 * 24 * 60 * 60 * 1000 // 1 days
  }).status(200).json({
    success: true,
    message: "User logged in successfully",
    user: rest
  });
};

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
      role: role || "staff", // Default role is 'customer' if not provided
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

    // Send response
    sendResponseWithToken(user, res);
  } catch (error) {
    console.error(error);
    next(new errorHandler(500, "User Login Failed"));
  }
};

//logout user
exports.logoutUser = async (req, res, next) => {
  try {
    req.user = null;

    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production"
    });

    if (req.session) {
      return req.session.destroy((err) => {
        if (err) return next(new errorHandler(500, "Error destroying session"));

        res.status(200).json({
          success: true,
          message: "Sign out successful"
        });
      });
    }

    res.status(200).json({
      success: true,
      message: "Sign out successful"
    });

  } catch (error) {
    next(new errorHandler(500, "Error while signing out user"));
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
    // const restrictedFields = ["password", "role"];
    // for (let field of restrictedFields) {
    //   if (updates[field]) {
    //     return res.status(400).json({ message: `${field} cannot be updated via this endpoint` });
    //   }
    // }

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

//delete user (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    console.log(userId);
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    next(errorHandler(500, "Failed to delete user"));
  }
}

// Function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request Password Reset - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP with 10 minute expiry
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - RestoMaster',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p>Dear ${user.name},</p>
          <p>We received a request to reset your password. Please use the following OTP to verify your identity:</p>
          <div style="background-color: #f7f7f7; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request a password reset, please ignore this email or contact support.</p>
          <p>Thank you,<br>RestoMaster Team</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Check if OTP exists and is valid
    if (!otpStore[email] || otpStore[email].otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // Check if OTP is expired
    if (Date.now() > otpStore[email].expiresAt) {
      delete otpStore[email]; // Clean up expired OTP
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    // Generate a temporary token for this reset
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Store token in OTP store (we're repurposing it)
    otpStore[email].resetToken = resetToken;

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      resetToken: resetToken
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    // Check if reset token exists and is valid
    if (!otpStore[email] || otpStore[email].resetToken !== resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update password - in a real application, hash the password
    // This is where you'd use bcrypt or another hashing library
    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    // Clean up OTP store
    delete otpStore[email];

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
