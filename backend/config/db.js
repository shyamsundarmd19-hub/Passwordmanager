const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vaultguard_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// Auto initialize database, tables, and demo seed data
async function initializeDatabase() {
  try {
    // 1. First connect without specifying database to create database if missing
    const rootConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    const dbName = process.env.DB_NAME || 'vaultguard_db';
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await rootConnection.end();

    // 2. Now test pool connection
    const connection = await pool.getConnection();
    console.log(`[Database] Connected to MySQL database: ${dbName}`);

    // 3. Create tables if they do not exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`full_name\` VARCHAR(100) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`folders\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`folder_name\` VARCHAR(100) NOT NULL,
        \`description\` VARCHAR(255) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`passwords\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`folder_id\` INT DEFAULT NULL,
        \`service_name\` VARCHAR(100) NOT NULL,
        \`username\` VARCHAR(150) NOT NULL,
        \`encrypted_password\` TEXT NOT NULL,
        \`iv\` VARCHAR(64) NOT NULL,
        \`auth_tag\` VARCHAR(64) NOT NULL,
        \`website_url\` VARCHAR(255) DEFAULT NULL,
        \`category\` VARCHAR(50) NOT NULL DEFAULT 'Work',
        \`notes\` TEXT DEFAULT NULL,
        \`favorite\` TINYINT(1) NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`folder_id\`) REFERENCES \`folders\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`activity_logs\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`user_id\` INT NOT NULL,
        \`action\` VARCHAR(100) NOT NULL,
        \`description\` TEXT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Check if demo user exists; if not, insert demo user & initial seed folders
    const [userRows] = await connection.query('SELECT id FROM users LIMIT 1');
    if (userRows.length === 0) {
      console.log('[Database] Seeding initial Demo Admin account (demo@vaultguard.local)...');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('DemoPassword@123', salt);

      const [userRes] = await connection.query(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['Enterprise Admin', 'demo@vaultguard.local', passwordHash, 'ADMIN']
      );

      const demoUserId = userRes.insertId;

      await connection.query(
        'INSERT INTO folders (user_id, folder_name, description) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?)',
        [
          demoUserId, 'Work', 'Corporate service accounts and tools',
          demoUserId, 'Development', 'Git repositories & API keys',
          demoUserId, 'Cloud Services', 'AWS, Azure & Server Credentials',
          demoUserId, 'Company Accounts', 'Shared organization accounts'
        ]
      );

      await connection.query(
        'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
        [demoUserId, 'Account Initialized', 'VaultGuard Enterprise environment provisioned successfully.']
      );
      console.log('[Database] Demo user & initial folders seeded successfully.');
    }

    connection.release();
    console.log('[Database] Schema & seed verification completed successfully.');
  } catch (err) {
    console.error('[Database Connection Error]', err.message);
    console.warn('[Database Notice] Please ensure your MySQL server is running and credentials in backend/.env are accurate.');
  }
}

module.exports = {
  pool,
  initializeDatabase
};
