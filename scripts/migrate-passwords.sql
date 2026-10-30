-- =============================================================================
-- PharmaSure Password Migration Script
-- Run this ONCE against your existing database if you are upgrading from
-- a version that stored plaintext passwords to the BCrypt-secured version.
-- =============================================================================

USE blister;

-- Step 1: Expand admin password column to hold BCrypt hashes (60 chars)
ALTER TABLE `admin`
  MODIFY COLUMN `email`    VARCHAR(100) DEFAULT NULL,
  MODIFY COLUMN `password` VARCHAR(255) DEFAULT NULL;

-- Step 2: Update existing plaintext admin password → BCrypt hash of 'admin123'
UPDATE `admin`
SET `password` = '$2b$12$w.7/dF3mbdJ135QZwG3iUOmlN5kogtCTG021gzaXnp40JRSUJXUp6'
WHERE `email` = 'pharmacist@pharmasure.com'
  AND `password` = 'admin123';

-- Step 3: Update existing plaintext patient password → BCrypt hash of 'student123'
UPDATE `patient`
SET `password` = '$2b$12$VTBsqZsU2BSacDlGnNimTOBiKcEpAb/MW99Okhb4RY3lUsdJ59pze'
WHERE `email` = 'harshithp914@gmail.com'
  AND `password` = 'student123';

-- Step 4: Also update the caretaker account (same password as patient in demo data)
UPDATE `patient`
SET `password` = '$2b$12$VTBsqZsU2BSacDlGnNimTOBiKcEpAb/MW99Okhb4RY3lUsdJ59pze'
WHERE `care_taker_email` = 'harshithp9141@gmail.com'
  AND `password` = 'student123';

SELECT 'Migration complete. Passwords are now BCrypt-hashed.' AS status;
