-- =====================================================
-- Eye Detection Database Setup
-- สำหรับใช้กับ Supabase
-- =====================================================

-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL,
    student_id VARCHAR(20) UNIQUE NOT NULL,
    label VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง indexes เพื่อเพิ่มประสิทธิภาพการ query
CREATE INDEX IF NOT EXISTS idx_users_label ON users(label);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- เพิ่มฟังก์ชันสำหรับอัพเดท updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- สร้าง trigger สำหรับอัพเดท updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- เพิ่ม comments สำหรับ documentation
COMMENT ON TABLE users IS 'ตารางเก็บข้อมูลผู้ใช้สำหรับระบบตรวจจับใบหน้า';
COMMENT ON COLUMN users.user_id IS 'UUID primary key';
COMMENT ON COLUMN users.username IS 'ชื่อผู้ใช้';
COMMENT ON COLUMN users.student_id IS 'รหัสนิสิต (unique)';
COMMENT ON COLUMN users.label IS 'Label ที่ใช้ในการ predict จาก YOLO model (unique)';
COMMENT ON COLUMN users.created_at IS 'วันที่สร้างข้อมูล';
COMMENT ON COLUMN users.updated_at IS 'วันที่แก้ไขข้อมูลล่าสุด';

-- =====================================================
-- ตัวอย่างข้อมูลทดสอบ (Optional)
-- =====================================================

-- ลบข้อมูลเก่า (ถ้ามี)
-- DELETE FROM users;

-- เพิ่มข้อมูลทดสอบ
INSERT INTO users (username, student_id, label) VALUES
    ('Kanokwan Thathip', '65020733', 'Bam'), 
    ('Jidapa Sorat', '65020788', 'Tiw'),
    ('Jindaporn Inrajak', '65020799', 'Pam'),
    ('Jiraphan Lumphoo', '65020801', 'Eve'),
    ('Chanapha Phikhason', '65020834', 'Gyn'),
    ('Thanawat Kanphuton', '65020913', 'Frame'),
    ('Thensin Chuangkeattichai', '65020946', 'Eark'),
    ('Natee Putthasorn', '65020957', 'Cheer'),
    ('Nontawat Sukpordee', '65020968', 'Plum'),
    ('Nanthapong Wongrat', '65020979', 'Bas'),
    ('Nuntapop Pronsiriphanwat', '65020980', 'Teenoi'),
    ('Patiwat Changmoon', '65021026', 'Do'),
    ('Phattaraphon Kongmongkhon', '65021071', 'Day'),
    ('Phattaraphon Prompanat', '65021082', 'First'),
    ('Radit Shalom', '65021105', 'Jeng'),
    ('Wisipon Srisangar', '65021150', 'Max'),
    ('Sorawit Sensuwan', '65021194', 'Boom'),
    ('Suphansa Rampan', '65021217', 'Pim'),
    ('Apiwat phanwiriyachai', '65021240', 'Rin'),
    ('Atthakit Khampraphai', '65021251', 'Petch'),
    ('Aekkasit Oatsawadara', '65021262', 'BasAek'),
    ('Tatsaneewan Yenwattana', '65024568', 'Noey'),
    ('Banphot Sukpom', '65024579', 'Pie'),
    ('Poomrapee Patum', '65024591', 'Rew'),
    ('Aphisit Wanjan', '65024603', 'BasApi'),
    ('Kittipat Chalonggchon', '65025367', 'Poom'),
    ('Keingkrai Buakeaw', '65025378', 'Tang'),
    ('Jirapron Inta', '65025389', 'Fern'),
    ('Pratchaya Tangsomsuk', '65025480', 'Kik'),
    ('Peemaphon Wiangin', '65025514', 'Pee'),
    ('Raksita Keawruangrit', '65025547', 'Toon'),
    ('Supanat Wongwanich', '65025570', 'Punch'),
    ('Suphawit Nimwatthana', '65025581', 'Ball'),
    ('Sirirat Klinlukain', '65025615', 'Jay'),
    ('Aekkasit Phochan', '65025626', 'Aek')

ON CONFLICT (student_id) DO NOTHING;

-- =====================================================
-- Query ตัวอย่างที่มีประโยชน์
-- =====================================================

-- ดูข้อมูลทั้งหมด
-- SELECT * FROM users ORDER BY created_at DESC;

-- ค้นหาโดย label
-- SELECT * FROM users WHERE label = 'person_1';

-- ค้นหาโดย student_id
-- SELECT * FROM users WHERE student_id = '6512345678';

-- นับจำนวน users
-- SELECT COUNT(*) as total_users FROM users;

-- ดู users ที่สร้างล่าสุด 10 คน
-- SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- =====================================================
-- RLS (Row Level Security) Policies - Optional
-- =====================================================

-- เปิดใช้งาน RLS (ถ้าต้องการความปลอดภัยเพิ่มเติม)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับอนุญาตให้ทุกคนอ่านได้
-- CREATE POLICY "Allow public read access"
--     ON users FOR SELECT
--     USING (true);

-- Policy สำหรับอนุญาตให้เฉพาะ authenticated users เขียนได้
-- CREATE POLICY "Allow authenticated insert access"
--     ON users FOR INSERT
--     WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated update access"
--     ON users FOR UPDATE
--     USING (auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated delete access"
--     ON users FOR DELETE
--     USING (auth.role() = 'authenticated');

-- =====================================================
-- Maintenance
-- =====================================================

-- ลบข้อมูลเก่าที่ไม่ได้ใช้งาน (ตัวอย่าง: เก่ากว่า 1 ปี)
-- DELETE FROM users WHERE created_at < NOW() - INTERVAL '1 year';

-- Vacuum เพื่อเพิ่มประสิทธิภาพ
-- VACUUM ANALYZE users;
