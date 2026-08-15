# VaultGuard – Enterprise Password Manager

**VaultGuard** is a realistic, production-style Enterprise Password Manager web application designed for organizations and teams to securely store, manage, and audit digital credentials for web applications, cloud platforms (AWS, Azure, GCP), databases, Git repositories, servers, and internal company tools.

---

## Key Features

- **Master Password Security**: Authentication powered by **bcrypt** password hashing.
- **Zero-Knowledge Encryption**: Vault credentials encrypted with **AES-256-GCM** using unique IVs and authentication tags.
- **Credential Vault Management**: Full CRUD operations for credentials with service names, usernames, encrypted passwords, website URLs, categories, notes, and favorite flags.
- **Folder Organization**: Categorize credentials into custom organizational folders (Work, Development, Cloud Services, Company Accounts, Personal).
- **Search & Dynamic Filtering**: Instant search across services, usernames, categories, and folders.
- **High-Entropy Password Generator**: Built-in generator customizable by length, uppercase, lowercase, numbers, and special symbols with real-time strength evaluation.
- **Decryption-on-Request**: Passwords remain masked (`••••••••••••`) until an authorized user requests decryption with auto-closing security countdown timer.
- **Enterprise Security Center**: Real-time vault security health score calculation out of 100, auditing weak passwords and credential reuse across services.
- **Security Audit Activity Log**: Automated tracking of all key user actions (login, credential addition, edit, deletion, password reveal).
- **Dark Navy Cybersecurity UI**: Modern, glassmorphic corporate dashboard design system with FontAwesome icons and responsive navigation.

---

## Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla CSS Design System + Dark Navy Theme), JavaScript (ES6+, Fetch API), FontAwesome 6 Icons.
- **Backend**: Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, Native `crypto` (AES-256-GCM), `cors`, `express-rate-limit`.
- **Database**: MySQL 8.0+ (`mysql2/promise` with parameterized SQL queries).

---

## Directory Structure

```text
password manager/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── vault.html
│   ├── add-password.html
│   ├── edit-password.html
│   ├── folders.html
│   ├── security.html
│   ├── activity.html
│   ├── profile.html
│   ├── settings.html
│   ├── css/
│   │   ├── style.css
│   │   ├── login.css
│   │   ├── dashboard.css
│   │   └── vault.css
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── vault.js
│       ├── password-generator.js
│       ├── folders.js
│       ├── security.js
│       ├── activity.js
│       ├── profile.js
│       └── settings.js
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── .env.example
│   ├── config/
│   │   └── db.js
│   ├── utils/
│   │   ├── encryption.js
│   │   └── passwordGenerator.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Password.js
│   │   ├── Folder.js
│   │   └── Activity.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── passwordController.js
│   │   ├── folderController.js
│   │   ├── userController.js
│   │   └── activityController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── passwordRoutes.js
│       ├── folderRoutes.js
│       ├── userRoutes.js
│       └── activityRoutes.js
├── database/
│   └── vaultguard.sql
├── README.md
└── .gitignore
```

---

## Database Setup (MySQL)

1. Start your MySQL Server (via XAMPP, MySQL Workbench, or local service).
2. Open terminal/command prompt and import `database/vaultguard.sql`:

```bash
mysql -u root -p < database/vaultguard.sql
```

Alternatively, open `database/vaultguard.sql` in phpMyAdmin or MySQL Workbench and execute the script.

### Pre-seeded Demo Credentials:
- **Email**: `demo@vaultguard.local`
- **Master Password**: `DemoPassword@123`

---

## Backend Setup & Installation

1. Navigate to `backend` folder:
```bash
cd backend
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Configure Environment Variables in `.env`:
Ensure your `.env` matches your MySQL installation credentials:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=vaultguard_db
JWT_SECRET=vaultguard_enterprise_super_secret_jwt_key_2026
ENCRYPTION_KEY=a1b2c3d4e5f60718293a4b5c6d7e8f9011223344556677889900aabbccddeeff
NODE_ENV=development
```

4. Run the Server:
```bash
npm start
```
The server automatically tests MySQL connectivity, creates missing tables, and serves the complete frontend application at `http://localhost:5000`.

---

## How to Run & Access

1. Open your browser and navigate to:
```text
http://localhost:5000
```
2. Click **"Use Demo Enterprise Account"** on the login page or click **"Register new organization user"** to create a custom vault account.

---

## REST API Documentation

### Authentication Routes
- `POST /api/auth/register`: Create a new user account.
- `POST /api/auth/login`: Authenticate master password & return JWT token.
- `GET /api/auth/me`: Get current logged-in user profile.

### Password Vault Routes
- `GET /api/passwords`: Retrieve encrypted credentials (filtered by category, folder, favorite, or search query).
- `GET /api/passwords/metrics`: Retrieve vault security score, weak password count, and duplicate count.
- `GET /api/passwords/generate`: Utility endpoint for server-side password generation.
- `GET /api/passwords/:id`: Retrieve single credential metadata.
- `GET /api/passwords/:id/reveal`: Decrypt and return plaintext password for authorized user.
- `POST /api/passwords`: Encrypt and save new credential.
- `PUT /api/passwords/:id`: Update existing credential details and re-encrypt.
- `PATCH /api/passwords/:id/favorite`: Toggle favorite status.
- `DELETE /api/passwords/:id`: Delete credential from vault.

### Folder Routes
- `GET /api/folders`: List all user folders with credential counts.
- `POST /api/folders`: Create new folder.
- `PUT /api/folders/:id`: Rename / update folder description.
- `DELETE /api/folders/:id`: Delete folder.

### User & Activity Routes
- `GET /api/users/profile`: Get profile details.
- `PUT /api/users/profile`: Update profile info.
- `POST /api/users/change-password`: Update master vault password.
- `GET /api/activity`: Fetch security audit activity logs.

---

## Production & Deployment Considerations

> [!IMPORTANT]
> For real-world production deployment beyond local demonstration:
> 1. Enforce HTTPS/TLS encryption across all endpoints.
> 2. Implement Hardware Security Module (HSM) or Cloud Key Management System (AWS KMS / HashiCorp Vault) for master AES encryption key storage.
> 3. Enable multi-factor authentication (TOTP/WebAuthn).
> 4. Conduct periodic third-party security penetration testing and database backup replication.
