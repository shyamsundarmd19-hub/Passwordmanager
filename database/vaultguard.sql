-- ========================================================
-- VaultGuard - Enterprise Password Manager Database Schema
-- Database: vaultguard_db
-- ========================================================

CREATE DATABASE IF NOT EXISTS `vaultguard_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vaultguard_db`;

-- Drop existing tables if re-initialising
DROP TABLE IF EXISTS `activity_logs`;
DROP TABLE IF EXISTS `passwords`;
DROP TABLE IF EXISTS `folders`;
DROP TABLE IF EXISTS `users`;

-- --------------------------------------------------------
-- Table Structure: Users
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: Folders
-- --------------------------------------------------------
CREATE TABLE `folders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `folder_name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_folder` (`user_id`, `folder_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: Passwords
-- --------------------------------------------------------
CREATE TABLE `passwords` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `folder_id` INT DEFAULT NULL,
  `service_name` VARCHAR(100) NOT NULL,
  `username` VARCHAR(150) NOT NULL,
  `encrypted_password` TEXT NOT NULL,
  `iv` VARCHAR(64) NOT NULL,
  `auth_tag` VARCHAR(64) NOT NULL,
  `website_url` VARCHAR(255) DEFAULT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'Work',
  `notes` TEXT DEFAULT NULL,
  `favorite` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_service` (`user_id`, `service_name`),
  INDEX `idx_user_category` (`user_id`, `category`),
  INDEX `idx_user_favorite` (`user_id`, `favorite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: Activity Logs
-- --------------------------------------------------------
CREATE TABLE `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_activity` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seed Data: Demo Admin User
-- Demo Email: demo@vaultguard.local
-- Demo Password: DemoPassword@123 (bcrypt hash below)
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`) VALUES
(1, 'Enterprise Admin', 'demo@vaultguard.local', '$2a$10$wN7KjZq0m.mK6bUvB9Vb8.uK.E8aY.pPqX1zN2lO3hM4k5j6i7u8y', 'ADMIN');

-- Standard initial folders for Demo User
INSERT INTO `folders` (`id`, `user_id`, `folder_name`, `description`) VALUES
(1, 1, 'Work', 'Corporate service accounts and tools'),
(2, 1, 'Development', 'Development servers, Git repositories, and APIs'),
(3, 1, 'Cloud Services', 'AWS, Azure, and Cloud Provider Access Keys'),
(4, 1, 'Company Accounts', 'Shared organization accounts and HR tools');

-- Initial Activity Log for Demo User
INSERT INTO `activity_logs` (`user_id`, `action`, `description`) VALUES
(1, 'Account Initialized', 'VaultGuard Enterprise environment provisioned successfully.');
