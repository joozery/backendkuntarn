-- Add receipt_number column to payments table
ALTER TABLE payments ADD COLUMN receipt_number VARCHAR(50) AFTER notes;

-- Add index for better performance
CREATE INDEX idx_payments_receipt_number ON payments(receipt_number);

-- Add comment to describe the column
ALTER TABLE payments MODIFY COLUMN receipt_number VARCHAR(50) COMMENT 'เลขที่ใบเสร็จรับเงิน'; 