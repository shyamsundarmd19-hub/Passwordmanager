const Activity = require('../models/Activity');

exports.getActivityLogs = async (req, res, next) => {
  try {
    const limit = req.query.limit || 50;
    const logs = await Activity.findByUserId(req.user.id, limit);
    res.json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (err) {
    next(err);
  }
};
