# Database Setup Guide

## Overview
This guide explains how to set up the database for the Installment Management System.

## Prerequisites
- MySQL database server running
- Environment variables configured in `.env` file

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
DB_PORT=3306
```

## Setup Steps

### 1. Create Database
First, create the database if it doesn't exist:

```sql
CREATE DATABASE IF NOT EXISTS your_database_name;
```

### 2. Run Initial Schema
Run the initial schema to create tables:

```bash
mysql -u your_user -p your_database_name < db/schema.sql
```

### 3. Update Schema (if needed)
If you have an existing database, run the update script:

```bash
mysql -u your_user -p your_database_name < db/update_schema.sql
```

### 4. Add Sample Data
Add sample data to the database:

```bash
mysql -u your_user -p your_database_name < db/seed_data.sql
```

### 5. Automated Setup (Recommended)
Use the Node.js script for automated setup:

```bash
npm run setup-db
```

This script will:
- Update the schema (INT to BIGINT)
- Add sample data
- Verify the setup

## Database Structure

### Tables
- `branches` - Branch information
- `employees` - Employee data
- `checkers` - Checker information
- `customers` - Customer data
- `products` - Product catalog
- `installments` - Installment contracts
- `payments` - Scheduled payments
- `payment_collections` - Actual collections by checkers

### Sample Data
The seed data includes:
- 4 branches (including Prachuap Khiri Khan)
- 4 employees
- 11 checkers
- 6 customers
- 6 products
- 6 installment contracts
- 13 scheduled payments
- 6 payment collections

## Troubleshooting

### Common Issues

1. **Foreign Key Constraint Errors**
   - Make sure to run schema updates before adding data
   - Check that referenced tables exist

2. **Connection Errors**
   - Verify database credentials in `.env`
   - Ensure database server is running

3. **Permission Errors**
   - Make sure the database user has proper permissions
   - Check if the database exists

### Verification
After setup, verify the data:

```bash
npm run setup-db
```

This will show counts of records in each table.

## Heroku Deployment
For Heroku deployment, the database setup is handled automatically through the setup script.

## Support
If you encounter issues, check the logs and ensure all prerequisites are met. 