-- เพิ่มคอลัมน์ collector_id ในตาราง payments
ALTER TABLE payments ADD COLUMN collector_id BIGINT AFTER installment_id; 