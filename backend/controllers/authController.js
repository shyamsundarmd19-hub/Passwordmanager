const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Folder = require('../models/Folder');
const Activity = require('../models/Activity');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'vaultguard_enterprise_super_secret_jwt_key_2026';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Email, and Master Password are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Master Password must be at least 8 characters long.'
      });
    }

    const existingUser = await User.findByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userId = await User.create({
      full_name: full_name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      role: 'USER'
    });

    // Create default starter folders for new user
    const defaultFolders = [
      { name: 'Work', desc: 'Corporate & service accounts' },
      { name: 'Development', desc: 'Git repositories & API keys' },
      { name: 'Cloud Services', desc: 'AWS, Azure & Server Credentials' },
      { name: 'Personal', desc: 'Personal digital credentials' }
    ];

    for (const f of defaultFolders) {
      await Folder.create({ user_id: userId, folder_name: f.name, description: f.desc });
    }

    await Activity.log(userId, 'Account Registration', `User account created for ${email}`);

    const newUser = await User.findById(userId);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both Email and Master Password.'
      });
    }

    const user = await User.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or master password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await Activity.log(user.id, 'Failed Login Attempt', `Failed login attempt for ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or master password.'
      });
    }

    await Activity.log(user.id, 'User Login', `Logged into VaultGuard session successfully.`);

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};
