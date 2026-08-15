const User = require('../models/User');
const Activity = require('../models/Activity');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, email } = req.body;
    if (!full_name || !email) {
      return res.status(400).json({ success: false, message: 'Full name and email are required.' });
    }

    const updatedUser = await User.updateProfile(req.user.id, {
      full_name: full_name.trim(),
      email: email.toLowerCase().trim()
    });

    await Activity.log(req.user.id, 'Updated Profile', 'User updated account profile details.');

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

exports.changeMasterPassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Current password and new master password are required.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'New master password must be at least 8 characters long.' });
    }

    const userWithHash = await User.findByEmail(req.user.email);
    const isMatch = await bcrypt.compare(current_password, userWithHash.password_hash);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect current master password.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await User.updatePassword(req.user.id, newHash);
    await Activity.log(req.user.id, 'Changed Master Password', 'Master vault password updated successfully.');

    res.json({
      success: true,
      message: 'Master password updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};
