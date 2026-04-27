const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const setAuthCookie = (res, token) => {
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  });
};

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check existing admin
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save admin
    const admin = await Admin.create({
      email,
      password: hashedPassword
    });

    const token = generateToken(admin._id);
    setAuthCookie(res, token);

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Signup error", error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = await Admin.findOne({ email }).catch(err => {
      console.error("Database error during login:", err);
      throw new Error("Internal database error");
    });

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(admin._id);
    setAuthCookie(res, token);

    return res.json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email
      }
    });

  } catch (error) {
    return res.status(500).json({ message: "Login error", error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('_id email createdAt updatedAt');

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.json({
      admin: {
        id: admin._id,
        email: admin.email,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin profile', error: error.message });
  }
};
