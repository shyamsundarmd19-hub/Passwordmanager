const { pool } = require('../config/db');

class Activity {
  static async log(userId, action, description) {
    try {
      await pool.query(
        'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
        [userId, action, description]
      );
    } catch (err) {
      console.error('[Activity Log Error]', err.message);
    }
  }

  static async findByUserId(userId, limit = 50) {
    const [rows] = await pool.query(
      'SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
      [userId, parseInt(limit, 10)]
    );
    return rows;
  }
}

module.exports = Activity;
