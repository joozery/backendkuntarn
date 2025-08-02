const { query } = require('../db/db');

// ข้อมูลลูกค้าใหม่
const newCustomers = [
  { title: 'นาย', name: 'ศราวุฒิ', surname: 'ทองแผ่น', address: '85/3 ม.6 ต.นาหูกวาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'ศราวุฒิ', phone: '0800000001' },
  { title: 'นางสาว', name: 'ศิริพร', surname: 'รุกขรัตน์', address: '24/1 ม.3 ต.ทองมงคล อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'ศิริพร', phone: '0800000002' },
  { title: 'นาย', name: 'บุญรถ', surname: 'พิมพ์วัฒน์', address: '56/6 ม.10 ต.ห้วยยาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'บุญรถ', phone: '0800000003' },
  { title: 'นาง', name: 'น้อย', surname: 'เสียงใหญ่', address: '124/6 ม.3 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'น้อย', phone: '0800000004' },
  { title: 'นาง', name: 'บังเอิญ', surname: 'คำนวณชัย', address: '472/1 ม.7 ต.กุยบุรี อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'บังเอิญ', phone: '0800000005' },
  { title: 'นางสาว', name: 'ยินดี', surname: 'เถื่อนธรรม', address: '40/1 ม.5 ต.บางสะพาน อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'ยินดี', phone: '0800000006' },
  { title: 'นาย', name: 'วิภาส', surname: 'อยู่เย็น', address: '20 ม.5 ต.สามกระทาย อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'วิภาส', phone: '0800000007' },
  { title: 'นาย', name: 'ขวัญ', surname: 'นิลเปลี่ยน', address: '408 ม.10 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'ขวัญ', phone: '0800000008' },
  { title: 'นาง', name: 'พิกุล', surname: 'อินบำรุง', address: '64 ม.3 ต.ดอนยายหนู อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'พิกุล', phone: '0800000009' },
  { title: 'นางสาว', name: 'ธิดารัตน์', surname: 'รอดเริงรื่น', address: '180/2 ม.9 ต.นาหูกวาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'ธิดารัตน์', phone: '0800000010' },
  { title: 'นางสาว', name: 'อุทัย', surname: 'เพชรมณี', address: '29/1 ม.3 ต.พงศ์ประศาสน์ อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'อุทัย', phone: '0800000011' },
  { title: 'นาง', name: 'ปิ่น', surname: 'รัศมี', address: '118/3 ม.10 ต.ทองมงคล อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'ปิ่น', phone: '0800000012' },
  { title: 'นางสาว', name: 'สุนิสา', surname: 'ประเสริฐ', address: '84/4 ม.2 ต.พงศ์ประศาสน์ อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'สุนิสา', phone: '0800000013' },
  { title: 'นาย', name: 'บุญเชื่อ', surname: 'จันทร์หอม', address: '42/7 ม.10 ต.ทองมงคล อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'บุญเชื่อ', phone: '0800000014' },
  { title: 'นาย', name: 'เอกชัย', surname: 'อยู่ทอง', address: '190 ม.7 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'เอกชัย', phone: '0800000015' },
  { title: 'นาย', name: 'สุทธิพล', surname: 'ศรประเสริฐ', address: '60/8 ม.6 ต.ทองมงคล อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'สุทธิพล', phone: '0800000016' },
  { title: 'นาง', name: 'อำไพ', surname: 'จำปาดวง', address: '83 ม.10 ต.พงศ์ประศาสน์ อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'อำไพ', phone: '0800000017' },
  { title: 'นางสาว', name: 'กุลรวี', surname: 'หัตถิยา', address: '111/5 ม.5 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'กุลรวี', phone: '0800000018' },
  { title: 'นาย', name: 'จงกล', surname: 'สระโพธิ์ทอง', address: '1/1 ม.6 ต.ชัยเกษม อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'จงกล', phone: '0800000019' },
  { title: 'นางสาว', name: 'อัญฐิมา', surname: 'ปุุ่มเพชร', address: '226/1 ม.11 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'อัญฐิมา', phone: '0800000020' },
  { title: 'นาย', name: 'วิรัตน์', surname: 'ดวงสาพล', address: '997 ม.9 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'วิรัตน์', phone: '0800000021' },
  { title: 'นาย', name: 'รัชชานนท์', surname: 'พันธุ์ไทย', address: '10/5 ม.8 ต.ห้วยยาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'รัชชานนท์', phone: '0800000022' },
  { title: 'นาง', name: 'สุวรรณา', surname: 'ชัยโชค', address: '36/2 ม.1 ต.ทับสะแก อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'สุวรรณา', phone: '0800000023' },
  { title: 'นาง', name: 'ผ่อง', surname: 'พุ่มพวง', address: '45 ม.1 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'ผ่อง', phone: '0800000024' },
  { title: 'นาย', name: 'วิมพ์วิภา', surname: 'กลัดแสง', address: '220 ม.6 ต.ชัยเกษม อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'วิมพ์วิภา', phone: '0800000025' },
  { title: 'นาย', name: 'สมพร', surname: 'ทั่งทอง', address: '39/4 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'สมพร', phone: '0800000026' },
  { title: 'นาย', name: 'ชุติเดช', surname: 'จันทร์ดำ', address: '101/2 ม.7 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'ชุติเดช', phone: '0800000027' },
  { title: 'นางสาว', name: 'แตง', surname: 'สาธุ', address: '2/3 ม.6 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'แตง', phone: '0800000028' },
  { title: 'นาย', name: 'นิยม', surname: 'เกตุย้อย', address: '102/1 ม.6 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'นิยม', phone: '0800000029' },
  { title: 'นาย', name: 'ศรายุทธ', surname: 'ปานสมบัติ', address: '322 ม.8 ต.ห้วยทราย อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'ศรายุทธ', phone: '0800000030' },
  { title: 'นาง', name: 'ต้อย', surname: 'เรืองสว่าง', address: '60 ม.10 ต.กุยเหนือ อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'ต้อย', phone: '0800000031' },
  { title: 'นาย', name: 'ปฏิเวธ', surname: 'เกาะเกตุ', address: '211/1 ม.10 ต.บ่อนอก อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'ปฏิเวธ', phone: '0800000032' },
  { title: 'นางสาว', name: 'วัลลา', surname: 'นิยม', address: '129 ม.8 ต.ชัยเกษม อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'วัลลา', phone: '0800000033' },
  { title: 'นาย', name: 'ณัฐพล', surname: 'กี่แสง', address: '92/2 ม.3 ต.กำเนิดนพคุณ อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'ณัฐพล', phone: '0800000034' },
  { title: 'นาง', name: 'สุวรรณี', surname: 'โล่ห์คำ', address: '300/14 ม.9 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'สุวรรณี', phone: '0800000035' },
  { title: 'นางสาว', name: 'ศิริพร', surname: 'แก้วพรหม', address: '44 ม.5 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'ศิริพร', phone: '0800000036' },
  { title: 'นางสาว', name: 'ปานตะวัน', surname: 'วงษาลาภ', address: '78 ม.10 ต.ทรายทอง อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'ปานตะวัน', phone: '0800000037' },
  { title: 'นาง', name: 'สำรวย', surname: 'คุ้มภัย', address: '97/2 ม.3 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'สำรวย', phone: '0800000038' },
  { title: 'นางสาว', name: 'มณีวงค์', surname: 'บุญเกิด', address: '95/2 ม.5 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'มณีวงค์', phone: '0800000039' },
  { title: 'นาย', name: 'อภิชาติ', surname: 'ปรีเปรม', address: '112/2 ม.9 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'อภิชาติ', phone: '0800000040' },
  { title: 'นาย', name: 'เดชณรงค์', surname: 'ยอดนุ่ม', address: '46/1 ม.15 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'เดชณรงค์', phone: '0800000041' },
  { title: 'นางสาว', name: 'ศศิธร', surname: 'ยอดทอง', address: '25/2 ม.8 ต.บ่อนอก อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'ศศิธร', phone: '0800000042' },
  { title: 'นาง', name: 'วิภา', surname: 'ร่วมสุวรรณ', address: '132 ม.1 ต.ทรายทอง อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'วิภา', phone: '0800000043' },
  { title: 'นางสาว', name: 'ประพิน', surname: 'เจริญพงษ์', address: '28 ม.1 ต.กุยเหนือ อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'ประพิน', phone: '0800000044' },
  { title: 'นาย', name: 'อนุพล', surname: 'แสนสิงห์', address: '179/1 ม.7 ต.กำเนิดนพคุณ อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'อนุพล', phone: '0800000045' },
  { title: 'นางสาว', name: 'อุบลวรรณ', surname: 'คล้อยกลับ', address: '15/2 ม.7 ต.ไร่ใหม่ อ.สามร้อยยอด จ.ประจวบคีรีขันธ์', nickname: 'อุบลวรรณ', phone: '0800000046' },
  { title: 'นางสาว', name: 'อัจฉราภรณ์', surname: 'แสงจันท์', address: '18 ม.3 ต.ชัยเกษม อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'อัจฉราภรณ์', phone: '0800000047' },
  { title: 'นาง', name: 'ยุพิน', surname: 'จันทร์ณรงค์', address: '91 ม.3 ต.นาหูกวาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'ยุพิน', phone: '0800000048' },
  { title: 'นาง', name: 'ฉวี', surname: 'คงกระพันธ์', address: '49/1 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'ฉวี', phone: '0800000049' },
  { title: 'นาง', name: 'สังเวียน', surname: 'สุดใจ', address: '214/2 ม.8 ต.กุยบุรี อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'สังเวียน', phone: '0800000050' },
  { title: 'นาย', name: 'แกละ', surname: 'คงศิริ', address: '74/4 ม.3 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'แกละ', phone: '0800000051' },
  { title: 'นาง', name: 'ขนิฐา', surname: 'จันทะชัย', address: '608 ม.16 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'ขนิฐา', phone: '0800000052' },
  { title: 'นาย', name: 'พิเชด', surname: 'เรืองรอด', address: '91 ม.7 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'พิเชด', phone: '0800000053' },
  { title: 'นางสาว', name: 'ชุติสรณ์', surname: 'โตมากรักษา', address: '170/2 ม.2 ต.เกาะหลัก อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'ชุติสรณ์', phone: '0800000054' },
  { title: 'นาง', name: 'ทองหล่อ', surname: 'เหมาะเจาะ', address: '68/3 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'ทองหล่อ', phone: '0800000055' },
  { title: 'นางสาว', name: 'รุ่งทิพย์', surname: 'แก้วสอาด', address: '61/5 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'รุ่งทิพย์', phone: '0800000056' },
  { title: 'นางสาว', name: 'อารยา', surname: 'ปุ่นหรั่ง', address: '18/18 ม.5 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'อารยา', phone: '0800000057' },
  { title: 'นางสาว', name: 'รจนา', surname: 'บัวบุญ', address: '150 ม.7 ต.ช้างแรก อ.ปะทิว จ.ชุมพร', nickname: 'รจนา', phone: '0800000058' },
  { title: 'นาย', name: 'ทูลย์', surname: 'เอี่ยมใหญ่', address: '89/1 ม.5 ต.สามกระทาย อ.กุยบุรี จ.ประจวบคีรีขันธ์', nickname: 'ทูลย์', phone: '0800000059' },
  { title: 'นาย', name: 'ปรีชา', surname: 'แช่มช้อย', address: '31 ม.3 ต.บางสะพาน อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'ปรีชา', phone: '0800000060' },
  { title: 'นาง', name: 'ตุ้ม', surname: 'กุมแก้ว', address: '125 ม.5 ต.ธงชัย อ.บางสะพาน จ.ประจวบคีรีขันธ์', nickname: 'ตุ้ม', phone: '0800000061' },
  { title: 'นางสาว', name: 'สุนีย์', surname: 'หมอมาก', address: '51/3 ม.1 ต.เกาะหลัก อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'สุนีย์', phone: '0800000062' },
  { title: 'นาย', name: 'กิตติศักดิ์', surname: 'สุดพิบูลย์', address: '103/9 ม.7 ต.บ่อนอก อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'กิตติศักดิ์', phone: '0800000063' },
  { title: 'นางสาว', name: 'ประทุม', surname: 'พุ่มเจริญ', address: '88 ม.2 ต.อ่างทอง อ.ทับสะแก จ.ประจวบคีรีขันธ์', nickname: 'ประทุม', phone: '0800000064' },
  { title: 'นาง', name: 'สง่า', surname: 'มาคล้าย', address: '120 ม.3 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'สง่า', phone: '0800000065' },
  { title: 'นาย', name: 'ประวิทย์', surname: 'ปรัชญา', address: '247 ม.2 ต.เกาะหล้ก อ.เมือง จ.ประจวบคีรีขันธ์', nickname: 'ประวิทย์', phone: '0800000066' },
  { title: 'นาย', name: 'มนัส', surname: 'แย้มสุนทร', address: '250 ม.5 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', nickname: 'มนัส', phone: '0800000067' }
];

async function addCustomersBatch() {
  try {
    console.log('🚀 เริ่มเพิ่มลูกค้าใหม่...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < newCustomers.length; i++) {
      const customer = newCustomers[i];
      const customerNumber = 95 + i;
      const code = `CUST${customerNumber.toString().padStart(3, '0')}`;
      const idCard = `TEMP${(1000001 + i).toString().padStart(7, '0')}`;
      
      try {
        const result = await query(`
          INSERT INTO customers (
            title, name, surname, full_name, address, id_card, nickname, phone,
            branch_id, status, code, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          customer.title,
          customer.name,
          customer.surname,
          `${customer.title}${customer.name} ${customer.surname}`,
          customer.address,
          idCard,
          customer.nickname,
          customer.phone,
          1, // branch_id
          'active',
          code
        ]);
        
        console.log(`✅ เพิ่มลูกค้า: ${code} - ${customer.name} ${customer.surname} (ID: ${result.insertId})`);
        successCount++;
        
        // หน่วงเวลาเล็กน้อยเพื่อไม่ให้ database ทำงานหนักเกินไป
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ ผิดพลาดในการเพิ่มลูกค้า ${code}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n📊 สรุปผลการเพิ่มลูกค้า:');
    console.log(`  ✅ สำเร็จ: ${successCount} คน`);
    console.log(`  ❌ ผิดพลาด: ${errorCount} คน`);
    console.log(`  📋 รวม: ${newCustomers.length} คน`);
    
    // แสดงตัวอย่างลูกค้าที่เพิ่มใหม่
    console.log('\n📋 ตัวอย่างลูกค้าที่เพิ่มใหม่:');
    const newAddedCustomers = await query(`
      SELECT id, code, name, surname, full_name, phone, status
      FROM customers 
      WHERE code LIKE 'CUST%' AND code >= 'CUST095'
      ORDER BY code
      LIMIT 10
    `);
    
    newAddedCustomers.forEach(customer => {
      console.log(`  ${customer.code}: ${customer.name} ${customer.surname} - ${customer.phone}`);
    });
    
    console.log('\n🎉 เพิ่มลูกค้าเสร็จสิ้น!');
    
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  } finally {
    process.exit(0);
  }
}

// รันสคริปต์
addCustomersBatch(); 