// Fixed version of installments.js with proper JOIN for checkers
// This file shows the corrected SELECT query for GET /api/installments

const express = require('express');
const router = express.Router();
const { query } = require('../db/db');

// GET /api/installments - Get all installments (FIXED VERSION)
router.get('/', async (req, res) => {
  try {
    const { branchId, status, customerId, search, month, year } = req.query;
    
    let sqlQuery = `
      SELECT 
        i.id,
        i.contract_number as contractNumber,
        i.contract_date as contractDate,
        i.customer_id as customerId,
        i.product_id as productId,
        i.product_name as productName,
        i.total_amount as totalAmount,
        i.installment_amount as installmentAmount,
        i.remaining_amount as remainingAmount,
        i.installment_period as installmentPeriod,
        i.start_date as startDate,
        i.end_date as endDate,
        i.branch_id as branchId,
        i.salesperson_id as salespersonId,
        i.inspector_id as inspectorId,
        i.line,
        i.customer_title as customerTitle,
        i.customer_age as customerAge,
        i.customer_moo as customerMoo,
        i.customer_road as customerRoad,
        i.customer_subdistrict as customerSubdistrict,
        i.customer_district as customerDistrict,
        i.customer_province as customerProvince,
        i.customer_phone1 as customerPhone1,
        i.customer_phone2 as customerPhone2,
        i.customer_phone3 as customerPhone3,
        i.customer_email as customerEmail,
        i.customer_id_card as customerIdCard,
        i.customer_nickname as customerNickname,
        i.guarantor_id as guarantorId,
        i.guarantor_title as guarantorTitle,
        i.guarantor_name as guarantorName,
        i.guarantor_surname as guarantorSurname,
        i.guarantor_nickname as guarantorNickname,
        i.guarantor_age as guarantorAge,
        i.guarantor_id_card as guarantorIdCard,
        i.guarantor_address as guarantorAddress,
        i.guarantor_moo as guarantorMoo,
        i.guarantor_road as guarantorRoad,
        i.guarantor_subdistrict as guarantorSubdistrict,
        i.guarantor_district as guarantorDistrict,
        i.guarantor_province as guarantorProvince,
        i.guarantor_phone1 as guarantorPhone1,
        i.guarantor_phone2 as guarantorPhone2,
        i.guarantor_phone3 as guarantorPhone3,
        i.guarantor_email as guarantorEmail,
        i.product_description as productDescription,
        i.product_category as productCategory,
        i.product_model as productModel,
        i.product_serial_number as productSerialNumber,
        i.down_payment as downPayment,
        i.monthly_payment as monthlyPayment,
        i.months,
        i.collection_date as collectionDate,
        i.status,
        i.created_at as createdAt,
        i.updated_at as updatedAt,
        c.name as customerName,
        c.surname as customerSurname,
        c.full_name as customerFullName,
        c.phone as customerPhone,
        c.address as customerAddress,
        p.name as productName,
        p.price as productPrice,
        b.name as branchName,
        e.name as salespersonName,
        e.surname as salespersonSurname,
        e.full_name as salespersonFullName,
        ch.name as inspectorName,
        ch.surname as inspectorSurname,
        ch.full_name as inspectorFullName
      FROM installments i
      LEFT JOIN customers c ON i.customer_id = c.id
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN branches b ON i.branch_id = b.id
      LEFT JOIN employees e ON i.salesperson_id = e.id
      LEFT JOIN checkers ch ON i.inspector_id = ch.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (branchId) {
      sqlQuery += ' AND i.branch_id = ?';
      params.push(branchId);
    }
    
    if (status) {
      sqlQuery += ' AND i.status = ?';
      params.push(status);
    }
    
    if (customerId) {
      sqlQuery += ' AND i.customer_id = ?';
      params.push(customerId);
    }
    
    if (month && year) {
      sqlQuery += ' AND MONTH(i.created_at) = ? AND YEAR(i.created_at) = ?';
      params.push(month, year);
    }
    
    if (search) {
      sqlQuery += ' AND (i.contract_number LIKE ? OR c.full_name LIKE ? OR p.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    sqlQuery += ' ORDER BY i.created_at DESC';
    
    const results = await query(sqlQuery, params);
    
    // Build structured objects from individual fields
    const processedResults = results.map(result => ({
      ...result,
      // Add employee information for frontend
      employeeName: result.salespersonFullName || result.salespersonName || 'ไม่ระบุ',
      inspectorName: result.inspectorFullName || result.inspectorName || 'ไม่ระบุ',
      customerDetails: {
        title: result.customerTitle,
        age: result.customerAge,
        moo: result.customerMoo,
        road: result.customerRoad,
        subdistrict: result.customerSubdistrict,
        district: result.customerDistrict,
        province: result.customerProvince,
        phone1: result.customerPhone1,
        phone2: result.customerPhone2,
        phone3: result.customerPhone3,
        email: result.customerEmail
      },
      guarantorDetails: {
        id: result.guarantorId,
        title: result.guarantorTitle,
        name: result.guarantorName,
        surname: result.guarantorSurname,
        nickname: result.guarantorNickname,
        age: result.guarantorAge,
        idCard: result.guarantorIdCard,
        address: result.guarantorAddress,
        moo: result.guarantorMoo,
        road: result.guarantorRoad,
        subdistrict: result.guarantorSubdistrict,
        district: result.guarantorDistrict,
        province: result.guarantorProvince,
        phone1: result.guarantorPhone1,
        phone2: result.guarantorPhone2,
        phone3: result.guarantorPhone3,
        email: result.guarantorEmail
      },
      productDetails: {
        description: result.productDescription,
        category: result.productCategory,
        model: result.productModel,
        serialNumber: result.productSerialNumber
      },
      plan: {
        downPayment: result.downPayment,
        monthlyPayment: result.monthlyPayment,
        months: result.months,
        collectionDate: result.collectionDate
      }
    }));
    
    res.json({
      success: true,
      data: processedResults,
      total: processedResults.length
    });
  } catch (error) {
    console.error('Error fetching installments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router; 