const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const readline = require('readline');

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function runSetup() {
  console.log('=======================================================');
  console.log('  VaultGuard MySQL Database Automatic Setup Helper     ');
  console.log('=======================================================');

  let host = process.env.DB_HOST || 'localhost';
  let port = process.env.DB_PORT || 3306;
  let user = process.env.DB_USER || 'root';
  let password = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '';

  console.log(`Current DB Config from .env:`);
  console.log(`  Host: ${host}:${port}`);
  console.log(`  User: ${user}`);
  console.log(`  Password: ${password ? '***' : '(empty)'}`);

  const updatePass = await askQuestion('\nDo you want to enter/update your MySQL root password? (y/N): ');
  if (updatePass.trim().toLowerCase() === 'y') {
    password = await askQuestion('Enter MySQL root password: ');
    
    // Update .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('[Setup] Saved updated DB_PASSWORD to backend/.env');
  }

  console.log('\n[Setup] Connecting to MySQL server...');
  try {
    const connection = await mysql.createConnection({ host, port, user, password });
    console.log('[Setup] Connection successful!');

    console.log('[Setup] Reading database/vaultguard.sql schema...');
    const sqlPath = path.join(__dirname, '../database/vaultguard.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL statements by semicolon
    const statements = sqlScript
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`[Setup] Executing ${statements.length} SQL setup statements...`);
    
    // Execute CREATE DATABASE first
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt && stmt.toUpperCase().includes('CREATE DATABASE')) {
        console.log('[Setup] Creating database...');
        await connection.query(stmt);
        console.log('[Setup] Database created!');
        statements.splice(i, 1);
        break;
      }
    }
    
    // Execute remaining statements
    for (const stmt of statements) {
      if (stmt) {
        await connection.query(stmt);
      }
    }

    await connection.end();
    console.log('\n=======================================================');
    console.log('  SUCCESS! VaultGuard database & seed user ready!      ');
    console.log('=======================================================');
    console.log('  Demo Login Email: demo@vaultguard.local');
    console.log('  Demo Password:    DemoPassword@123');
    console.log('=======================================================');
  } catch (err) {
    console.error('\n[Setup Error]', err.message);
    console.log('Please check your MySQL server status and credentials in backend/.env.');
  } finally {
    rl.close();
  }
}

runSetup();
