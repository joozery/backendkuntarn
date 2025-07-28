# Customers API Documentation

## Overview
Customers API สำหรับจัดการข้อมูลลูกค้าในระบบผ่อนชำระ

## Base URL
```
https://backendkuntarn-e0ddf979d118.herokuapp.com/api/customers
```

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,           -- รหัสลูกค้า
  name VARCHAR(255) NOT NULL,                 -- ชื่อ
  surname VARCHAR(255),                       -- นามสกุล
  full_name VARCHAR(255) NOT NULL,            -- ชื่อ-สกุล
  id_card VARCHAR(13) UNIQUE NOT NULL,        -- เลขบัตรประชาชน
  nickname VARCHAR(100),                      -- ชื่อเล่น
  phone VARCHAR(20),                          -- เบอร์โทรศัพท์
  email VARCHAR(255),                         -- อีเมล
  address TEXT,                               -- ที่อยู่
  guarantor_name VARCHAR(255),                -- ชื่อผู้ค้ำ
  guarantor_id_card VARCHAR(13),              -- เลขบัตรประชาชนผู้ค้ำ
  guarantor_nickname VARCHAR(100),            -- ชื่อเล่นผู้ค้ำ
  guarantor_phone VARCHAR(20),                -- เบอร์โทรศัพท์ผู้ค้ำ
  guarantor_address TEXT,                     -- ที่อยู่ผู้ค้ำ
  status ENUM('active', 'inactive', 'overdue', 'completed') DEFAULT 'active',
  branch_id BIGINT,                           -- สาขา
  checker_id BIGINT,                          -- เช็คเกอร์ที่รับผิดชอบ
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
  FOREIGN KEY (checker_id) REFERENCES checkers(id) ON DELETE SET NULL
);
```

## API Endpoints

### 1. Get All Customers
```http
GET /api/customers
```

#### Query Parameters
- `branchId` (optional): Filter by branch ID
- `checkerId` (optional): Filter by checker ID
- `search` (optional): Search in code, full_name, id_card, nickname, guarantor fields
- `status` (optional): Filter by status (active, inactive, overdue, completed, all)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "CUST001",
      "name": "สมชาย",
      "surname": "ใจดี",
      "full_name": "สมชาย ใจดี",
      "id_card": "1234567890123",
      "nickname": "สมชาย",
      "phone": "082-111-1111",
      "email": "customer1@example.com",
      "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
      "guarantor_name": "สมหญิง รักดี",
      "guarantor_id_card": "9876543210987",
      "guarantor_nickname": "สมหญิง",
      "guarantor_phone": "082-222-2222",
      "guarantor_address": "456 ถนนรามคำแหง กรุงเทพฯ",
      "status": "active",
      "branch_id": 1,
      "checker_id": 1,
      "branch_name": "สาขาหลัก",
      "checker_name": "ลินนา กล่อมเกลี้ยง",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

### 2. Get Customer by ID
```http
GET /api/customers/:id
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "CUST001",
    "name": "สมชาย",
    "surname": "ใจดี",
    "full_name": "สมชาย ใจดี",
    "id_card": "1234567890123",
    "nickname": "สมชาย",
    "phone": "082-111-1111",
    "email": "customer1@example.com",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
    "guarantor_name": "สมหญิง รักดี",
    "guarantor_id_card": "9876543210987",
    "guarantor_nickname": "สมหญิง",
    "guarantor_phone": "082-222-2222",
    "guarantor_address": "456 ถนนรามคำแหง กรุงเทพฯ",
    "status": "active",
    "branch_id": 1,
    "checker_id": 1,
    "branch_name": "สาขาหลัก",
    "checker_name": "ลินนา กล่อมเกลี้ยง",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Create Customer
```http
POST /api/customers
```

#### Request Body
```json
{
  "code": "CUST001",
  "name": "สมชาย",
  "surname": "ใจดี",
  "fullName": "สมชาย ใจดี",
  "idCard": "1234567890123",
  "nickname": "สมชาย",
  "phone": "082-111-1111",
  "email": "customer1@example.com",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
  "guarantorName": "สมหญิง รักดี",
  "guarantorIdCard": "9876543210987",
  "guarantorNickname": "สมหญิง",
  "guarantorPhone": "082-222-2222",
  "guarantorAddress": "456 ถนนรามคำแหง กรุงเทพฯ",
  "status": "active",
  "branchId": 1,
  "checkerId": 1
}
```

#### Response
```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 1,
    "code": "CUST001",
    "name": "สมชาย",
    "surname": "ใจดี",
    "full_name": "สมชาย ใจดี",
    "id_card": "1234567890123",
    "nickname": "สมชาย",
    "phone": "082-111-1111",
    "email": "customer1@example.com",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
    "guarantor_name": "สมหญิง รักดี",
    "guarantor_id_card": "9876543210987",
    "guarantor_nickname": "สมหญิง",
    "guarantor_phone": "082-222-2222",
    "guarantor_address": "456 ถนนรามคำแหง กรุงเทพฯ",
    "status": "active",
    "branch_id": 1,
    "checker_id": 1,
    "branch_name": "สาขาหลัก",
    "checker_name": "ลินนา กล่อมเกลี้ยง",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Update Customer
```http
PUT /api/customers/:id
```

#### Request Body
```json
{
  "code": "CUST001",
  "name": "สมชาย",
  "surname": "ใจดี",
  "fullName": "สมชาย ใจดี",
  "idCard": "1234567890123",
  "nickname": "สมชาย",
  "phone": "082-111-1111",
  "email": "customer1@example.com",
  "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
  "guarantorName": "สมหญิง รักดี",
  "guarantorIdCard": "9876543210987",
  "guarantorNickname": "สมหญิง",
  "guarantorPhone": "082-222-2222",
  "guarantorAddress": "456 ถนนรามคำแหง กรุงเทพฯ",
  "status": "active",
  "branchId": 1,
  "checkerId": 1
}
```

#### Response
```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": 1,
    "code": "CUST001",
    "name": "สมชาย",
    "surname": "ใจดี",
    "full_name": "สมชาย ใจดี",
    "id_card": "1234567890123",
    "nickname": "สมชาย",
    "phone": "082-111-1111",
    "email": "customer1@example.com",
    "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
    "guarantor_name": "สมหญิง รักดี",
    "guarantor_id_card": "9876543210987",
    "guarantor_nickname": "สมหญิง",
    "guarantor_phone": "082-222-2222",
    "guarantor_address": "456 ถนนรามคำแหง กรุงเทพฯ",
    "status": "active",
    "branch_id": 1,
    "checker_id": 1,
    "branch_name": "สาขาหลัก",
    "checker_name": "ลินนา กล่อมเกลี้ยง",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Delete Customer
```http
DELETE /api/customers/:id
```

#### Response
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

### 6. Get Customers by Checker
```http
GET /api/customers/checker/:checkerId
```

#### Query Parameters
- `search` (optional): Search in customer fields
- `status` (optional): Filter by status

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "code": "CUST001",
      "name": "สมชาย",
      "surname": "ใจดี",
      "full_name": "สมชาย ใจดี",
      "id_card": "1234567890123",
      "nickname": "สมชาย",
      "phone": "082-111-1111",
      "email": "customer1@example.com",
      "address": "123 ถนนสุขุมวิท กรุงเทพฯ",
      "guarantor_name": "สมหญิง รักดี",
      "guarantor_id_card": "9876543210987",
      "guarantor_nickname": "สมหญิง",
      "guarantor_phone": "082-222-2222",
      "guarantor_address": "456 ถนนรามคำแหง กรุงเทพฯ",
      "status": "active",
      "branch_id": 1,
      "checker_id": 1,
      "branch_name": "สาขาหลัก",
      "checker_name": "ลินนา กล่อมเกลี้ยง",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields",
  "error": "Name, phone, and branchId are required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Customer not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Setup Instructions

### 1. Update Database Schema
```bash
npm run update-customers
```

### 2. Deploy to Heroku
```bash
git add .
git commit -m "Add customers API with enhanced schema"
git push heroku main
```

## Notes

- All timestamps are in UTC
- Status values: `active`, `inactive`, `overdue`, `completed`
- Code and ID card must be unique
- Checker ID is optional (can be NULL)
- Branch ID is optional (can be NULL) 