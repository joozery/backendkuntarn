-- เพิ่มคอลัมน์ collector_id ในตาราง installments
ALTER TABLE installments ADD COLUMN collector_id BIGINT AFTER inspector_id; 