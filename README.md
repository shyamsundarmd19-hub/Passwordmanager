# 🔐 VaultGuard - Enterprise Password Manager & Credential Security Platform

A full-stack, enterprise-grade password management and credential auditing platform built with Node.js, Express.js, MySQL 8.0, Native AES-256-GCM Crypto, JavaScript (ES6+), and HTML5/CSS3.

---

## 🌟 Key Features

### Authentication & Master Vault Security:
- **Master Password Security**: User authentication powered by **bcrypt** password hashing with salt rounds.
- **Zero-Knowledge Architecture**: Credentials encrypted with **AES-256-GCM** using unique initialization vectors (IV) and authentication tags.
- **JWT Session Authorization**: Stateless, secure Bearer token authentication safeguarding all vault access and API routes.
- **Instant Demo Login**: One-click instant enterprise demo account access for fast feature evaluation.

### Credential Vault & Organization:
- **Full Credential Lifecycle**: Complete CRUD operations for logins, servers, databases, cloud keys (AWS/GCP/Azure), and Git tokens.
- **Folder Management**: Organize items into dedicated departmental folders (Work, Development, Cloud Services, Company Accounts, Personal).
- **Instant Search & Real-Time Filtering**: High-speed filtering by service name, username, folder, category, and favorite status.
- **Favorites & Quick Actions**: Pin essential daily credentials to the top with one-click copy and edit capabilities.

### Security Center & Health Auditing:
- **Real-Time Security Health Score**: Dynamic algorithm evaluating total vault strength on a scale of 0 to 100.
- **Vulnerability Diagnostics**: Instant identification of weak passwords, reused credentials, and at-risk legacy accounts.
- **Decryption-on-Request**: Passwords remain masked (`••••••••••••`) by default with an auto-mask security countdown timer (10s) upon decryption.
- **Audit Activity Log**: Comprehensive timestamped audit trail tracking logins, additions, modifications, reveals, and deletions.

### High-Entropy Generator & Cyber-Dark UI:
- **Customizable Password Generator**: Built-in generator customizable by length, uppercase, lowercase, numbers, and symbols with real-time entropy calculation.
- **Modern Cyber-Dark Interface**: Glassmorphic dashboard styled with responsive Vanilla CSS tokens, FontAwesome 6 icons, and smooth micro-interactions.
- **Smart Port Fallback**: Resilient server architecture with automated port conflict resolution and database migration handlers.

---

## 📂 Project Structure

```text
password-manager/
│── backend/
│   ├── config/
│   │   └── db.js                 # MySQL database connection pool
│   ├── controllers/
│   │   ├── authController.js     # User registration, login & token logic
│   │   ├── passwordController.js # Credential CRUD, metrics & decryption
│   │   ├── folderController.js   # Folder organization operations
│   │   ├── userController.js     # Profile & master password updates
│   │   └── activityController.js # Security audit activity logging
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT Bearer token verification
│   │   └── errorMiddleware.js    # Centralized HTTP error handling
│   ├── models/
│   │   ├── User.js               # User authentication database model
│   │   ├── Password.js           # Credential vault database model
│   │   ├── Folder.js             # Organizational folder model
│   │   └── Activity.js           # Audit trail log database model
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication REST endpoints
│   │   ├── passwordRoutes.js     # Vault operations REST endpoints
│   │   ├── folderRoutes.js       # Folder management REST endpoints
│   │   ├── userRoutes.js         # Profile management REST endpoints
│   │   └── activityRoutes.js     # Audit activity REST endpoints
│   ├── utils/
│   │   ├── encryption.js         # AES-256-GCM cipher and decipher engine
│   │   └── passwordGenerator.js  # Cryptographically secure string generator
│   ├── package.json              # Backend dependencies & startup scripts
│   ├── server.js                 # Express server & static asset dispatcher
│   ├── setup-db.js               # Automated schema migration & seed script
│   └── .env.example              # Template environment configuration
│── database/
│   └── vaultguard.sql            # Master SQL schema & demo seeds
│── frontend/
│   ├── css/
│   │   ├── style.css             # Design tokens, variables & typography
│   │   ├── login.css             # Authentication portal styling
│   │   ├── dashboard.css         # Analytics & statistics dashboard layout
│   │   └── vault.css             # Vault list, modals & generator styles
│   ├── js/
│   │   ├── api.js                # Fetch API client & token interceptor
│   │   ├── auth.js               # Login, register & session controller
│   │   ├── dashboard.js          # Metric cards & recent activity widget
│   │   ├── vault.js              # Credential list, reveal & filter manager
│   │   ├── password-generator.js # Interactive password generator modal
│   │   ├── folders.js            # Folder manager controller
│   │   ├── security.js           # Security health audit engine
│   │   ├── activity.js           # Audit log history table controller
│   │   ├── profile.js            # User profile & account details
│   │   └── settings.js           # Vault security & preference controls
│   ├── index.html                # Landing page & feature showcase
│   ├── login.html                # Sign in portal
│   ├── register.html             # Registration portal
│   ├── dashboard.html            # Main enterprise analytics dashboard
│   ├── vault.html                # All passwords & credentials manager
│   ├── add-password.html         # New credential creation view
│   ├── edit-password.html        # Credential editor view
│   ├── folders.html              # Custom organizational folders view
│   ├── security.html             # Vault security audit dashboard
│   ├── activity.html             # Audit trail activity history view
│   ├── profile.html              # User profile & credentials view
│   └── settings.html             # Security configuration & theme settings
│── .gitignore                    # Git ignore rules for node_modules & secrets
│── LICENSE                       # MIT License
└── README.md                     # Project documentation & instructions
```

---

## 💻 Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher installed.
- **MySQL Server**: v8.0+ (via XAMPP, MySQL Workbench, or local service).

---

### 1. Clone Repository
Ensure you are in your project directory:
```bash
git clone https://github.com/shyamsundarmd19-hub/Passwordmanager.git
cd Passwordmanager
```

---

### 2. Install Dependencies
Navigate into the `backend` directory and install the required npm packages:
```bash
cd backend
npm install
```

---

### 3. Database Setup

#### Option A: Automated CLI Migration (Recommended)
Run the built-in database setup script to automatically create `vaultguard_db` tables and seed initial demo data:
```bash
npm run setup-db
```

#### Option B: Manual SQL Import
Import `database/vaultguard.sql` using MySQL CLI or phpMyAdmin / MySQL Workbench:
```bash
mysql -u root -p < ../database/vaultguard.sql
```

---

### 4. Configure Environment Variables
Create or verify the `.env` file in the `backend/` directory:
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

---

### 5. Run the Application
Start the VaultGuard server:
```bash
npm start
```

Open your browser and visit: **[http://localhost:5000](http://localhost:5000)**

---

## 🌐 Live Demo
- **Repository URL**: [https://github.com/shyamsundarmd19-hub/Passwordmanager.git](https://github.com/shyamsundarmd19-hub/Passwordmanager.git)
- **Live Local Access**: [http://localhost:5000](http://localhost:5000)

---

## 🔑 Default Accounts & Sample Tracking Data (Created Automatically)

| Role / Entity | Identifier / Email | Default Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Enterprise User** | `demo@vaultguard.local` | `DemoPassword@123` | Full Vault Access, Security Health Center, Folder Management, Generator, Audit Logs |
| **Custom Registration** | Any valid email | User-defined (8+ chars) | Private isolated vault, custom folders, security metrics, profile manager |
| **Demo Credentials** | Pre-seeded (AWS, GitHub, Slack) | Encrypted (AES-256-GCM) | Decryption-on-request, category filtering, strength auditing |

---

## 🔒 Security Best Practices Implemented

- **Military-Grade AES-256-GCM Encryption**: Every stored credential is encrypted with authenticated symmetric encryption, generating a unique Initialization Vector (IV) and authentication tag for tamper detection.
- **Bcrypt Password Hashing**: Master user passwords are salted and hashed with bcrypt, ensuring raw credentials never touch the database.
- **Decryption-on-Request Barrier**: Passwords remain masked in the UI and are only decrypted over encrypted channels when explicitly requested by an authorized user, accompanied by an auto-mask security timer.
- **JWT Role-Based Access Control**: All vault endpoints require valid Bearer token authorization, isolating vault records per tenant/user.
- **SQL Injection Prevention**: Parameterized prepared statements across all database queries (`mysql2/promise`).
- **Brute-Force & Rate Limiting**: Express rate limiting middleware protects authentication endpoints from credential stuffing and dictionary attacks.

---

## 📄 License
Distributed under the MIT License. See [LICENSE](file:///c:/Users/shyam/OneDrive/Documents/shyam%20projects/password%20manager/LICENSE) for more information.
