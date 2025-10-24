-- Create ELearning Database for PostgreSQL
-- Server: ELearning
-- Database: ELearning
-- Username: postgres
-- Password: thiha1234

-- Note: Database and user should already be created in pgAdmin
-- This script ensures the database exists and sets up basic configuration

-- Connect to the ELearning database
\c ELearning;

-- Create extension for UUID generation (if not exists)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';
