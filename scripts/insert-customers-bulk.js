const { query } = require('../db/db');

// ข้อมูลลูกค้าดิบ (raw data)
const rawCustomers = [
  { title: 'นาย', name: 'ทัศวรรณ', surname: 'แสงมณี', address: '38 ม.8 ต.อ่างทอง อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3770300310780', nickname: 'พี่ตูน', phone: '0827866319' },
  { title: 'นาย', name: 'วสันต์', surname: 'ฉิมละมัย', address: '6/1 ม.3 ต.ทับสะแก อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '1770300044765', nickname: 'กั้ง', phone: '0623406288' },
  { title: 'นางสาว', name: 'มลทิรา', surname: 'จันทร์แก้ว', address: '27 ม.12 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '1770400199574', nickname: 'จูน', phone: '0623503950' },
  { title: 'นางสาว', name: 'รัตนา', surname: 'แย้มพราย', address: '82/2 ม.6 ต.ทับสะแก อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3219900015480', nickname: 'พี่รัตน์', phone: '0926484894' },
  { title: 'นางสาว', name: 'เมทินี', surname: 'พิมพ์วัฒน์', address: '56/6 ม.10 ต.ห้วยยาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '1309701244538', nickname: 'น้องเมย์', phone: '0930027499' },
  { title: 'นางสาว', name: 'สายใจ', surname: 'ขาวสะอาด', address: '124/6 ม.3 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '8770590005340', nickname: 'ใจ', phone: '0983763742' },
  { title: 'นางสาว', name: 'สายใจ', surname: 'ขาวสะอาด', address: '124/6 ม.3 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '8770590005340', nickname: 'ใจ', phone: '0983763742' }, // ซ้ำ
  { title: 'นาง', name: 'สมหมาย', surname: 'จับใจ', address: '74 ม.3 ต.กุยบุรี อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200406718', nickname: 'เจ้หมาย', phone: '0852973517' },
  { title: 'นาย', name: 'สุรเชษฐ', surname: 'เกลี้ยงสิน', address: '40 ม.5 ต.บางสะพาน อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '1107700801782', nickname: 'บิ๊ก', phone: '0986504830' },
  { title: 'นางสาว', name: 'วิลาศ', surname: 'ประกอบปราณ', address: '20/1 ม.5 ต.สามกระทาย อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '0770489002041', nickname: 'นุ้ย', phone: '0980790549' },
  { title: 'นางสาว', name: 'มะลิวรรณ์', surname: 'พันคุ้มเก่า', address: '123 ม.10 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3460600341811', nickname: 'ขวัญ', phone: '0924694459' },
  { title: 'นางสาว', name: 'กมลรัตน์', surname: 'วงเณร', address: '64/3 ม.3 ต.ดอนยายหนู อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200175708', nickname: 'หน่อย', phone: '0808344586' },
  { title: 'นาย', name: 'ณัฐนันท์', surname: 'อินบำรุง', address: '64/3 ม.3 ต.ดอนยายหนู อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '1770800033029', nickname: 'กาย', phone: '0624105740' },
  { title: 'นาย', name: 'นิมิตร', surname: 'ฟ้าคนอง', address: '180/2 ม.9 ต.นาหูกวาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3700800427660', nickname: 'จิม', phone: '0988560873' },
  { title: 'นางสาว', name: 'วนิดา', surname: 'รินทา', address: '29/1 ม.3 ต.พงศ์ประศาสน์ อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '1770401246444', nickname: 'ทีน', phone: '0966402243' },
  { title: 'นาย', name: 'พิจิตรนาวรรณ', surname: 'ชุ่มเต็ม', address: '27/6 ม.4 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400397879', nickname: 'พี่ดอน', phone: '0817918543' },
  { title: 'นางสาว', name: 'จินตนา', surname: 'พุ่มสวัสดิ์', address: '84 ม.2 ต.พงศ์ประศาสน์ อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '1770400142475', nickname: 'เรย์', phone: '0984795698' },
  { title: 'นางสาว', name: 'ศุภรัตน์', surname: 'ศรีสุวรรณ์', address: '42/7 ม.10 ต.ทองมงคล อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400542232', nickname: 'เจ้ปรางค์', phone: '0630642230' },
  { title: 'นางสาว', name: 'ปทุมพร', surname: 'สุดเหลือ', address: '190 ม.7 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '5770490006781', nickname: 'พี่แอ๊ด', phone: '0979408879' },
  { title: 'นาย', name: 'สุธน', surname: 'ศรประเสริฐ', address: '117 ม.2 ต.ทองมงคล อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400206704', nickname: 'โจ', phone: '0819516286' },
  { title: 'นางสาว', name: 'พรทิพย์', surname: 'สุดสงวน', address: '83 ม.10 ต.พงศ์ประศาสน์ อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '1779900357398', nickname: 'ก้อย', phone: '0955718995' },
  { title: 'นาง', name: 'ธนิชา', surname: 'แหทอง', address: '111/4 ม.5 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3120500124268', nickname: 'พี่ตู่', phone: '0831691787' },
  { title: 'นาง', name: 'ศริมน', surname: 'พื้นผา', address: '43/1 ม.8 ต.ชัยเกษม อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400347588', nickname: 'พี่มน', phone: '0988382489' },
  { title: 'นางสาว', name: 'นันทวรรณ', surname: 'คงทัพ', address: '102/1 ม.2 ต.พงศ์ประศาสน์ อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '1770400180687', nickname: 'หนาว', phone: '0625872823' },
  { title: 'นางสาว', name: 'เพ็ญ', surname: 'แย้มพงษ์', address: '226/11 ม.11 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3779900140522', nickname: 'เพ็ญ', phone: '0984924840' },
  { title: 'นางสาว', name: 'ศศิธร', surname: 'วังสตัง', address: '997 ม.9 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3860200238415', nickname: 'มะยะ', phone: '0989895790' },
  { title: 'นาง', name: 'รัตดาวรรณ์', surname: 'พันธุ์ไทย', address: '85/2 ม.8 ต.ห้วยยาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '4770300002129', nickname: 'พี่รัตน์', phone: '0927272046' },
  { title: 'นางสาว', name: 'สุภาพร', surname: 'ทองคำ', address: '36/2 ม.1 ต.ทับสะแก อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '', nickname: 'เจ้โอ๋', phone: '0610523576' },
  { title: 'นาย', name: 'สมชาย', surname: 'ชูราศรี', address: '166 ม.5 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '3770200281451', nickname: 'พี่ชาย', phone: '0653458892' },
  { title: 'นาง', name: 'รุ่งนภา', surname: 'บุญมี', address: '305/1 ม.11 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3520100665136', nickname: 'จอย', phone: '0983409890' },
  { title: 'นาย', name: 'สมพร', surname: 'ทั่งทอง', address: '39/4 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3770300036301', nickname: 'พี่ช่วย', phone: '0924717881' },
  { title: 'นาย', name: 'สมพร', surname: 'ทั่งทอง', address: '39/4 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3770300036301', nickname: 'พี่ช่วย', phone: '0924717881' }, // ซ้ำ
  { title: 'นางสาว', name: 'อารีรัตน์', surname: 'ทั่งทอง', address: '39/4 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '1309900456314', nickname: 'พี่ก้อย', phone: '0984309472' },
  { title: 'นางสาว', name: 'ฐานิตา', surname: 'ครึกครื้น', address: '180/3 ม.3 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '1749900357924', nickname: 'อ๋อ', phone: '0614434099' },
  { title: 'นาย', name: 'สมหมาย', surname: 'ขาวสุทธิ', address: '883/1 ม.9 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3770100521973', nickname: 'พี่สม', phone: '0614685272' },
  { title: 'นาง', name: 'แดง', surname: 'วิจัยลักษณ์', address: '2/1 ม.6 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '5770500047370', nickname: 'ป้าแดง', phone: '0852903598' },
  { title: 'นาง', name: 'กัลยา', surname: 'เกตุย้อย', address: '102/1 ม.6 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '3200700376014', nickname: 'ติ๊ก', phone: '0932522146' },
  { title: 'นางสาว', name: 'สมพร', surname: 'แซ่ลิ้ม', address: '11 ม.3 ต.กุยบุรี อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200167187', nickname: 'พี่บา', phone: '0916095175' },
  { title: 'นางสาว', name: 'สมพร', surname: 'แซ่ลิ้ม', address: '11 ม.3 ต.กุยบุรี อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200167187', nickname: 'พี่บา', phone: '0916095175' }, // ซ้ำ
  { title: 'นางสาว', name: 'สุพรรณี', surname: 'รักษาสุระสาร', address: '39/1 ม.1 ต.กุยเหนือ อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '1700801105490', nickname: 'มาย', phone: '0843601427' },
  { title: 'นาง', name: 'สมจิตร์', surname: 'ปานสมบัติ', address: '322 ม.8 ต.ห้วยทราย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3770100290718', nickname: 'พี่จิตร', phone: '0843626578' },
  { title: 'นางสาว', name: 'บุษยา', surname: 'แสงอยู่', address: '171/7 ม.7 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '1779900216859', nickname: 'อิ๋ว', phone: '0625378648' },
  { title: 'นางสาว', name: 'นิตยา', surname: 'เรืองสว่าง', address: '60 ม.10 ต.กุยเหนือ อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '1770200009615', nickname: 'หน่อย', phone: '0636378051' },
  { title: 'นาง', name: 'ประเทือง', surname: 'เกาะเกตุ', address: '211/1 ม.10 ต.บ่อนอก อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3770100435431', nickname: 'เทือง', phone: '0621341319' },
  { title: 'นาง', name: 'วาสนา', surname: 'เลขมาศ', address: '126 ม.6 ต.ธงชัย อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3841700132251', nickname: 'พี่สาว', phone: '0981175968' },
  { title: 'นาง', name: 'ดวงพร', surname: 'กี่แสง', address: '92/1 ม.3 ต.กำเนิดนพคุณ อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3321000484817', nickname: 'พี่สุ', phone: '0904946526' },
  { title: 'นาย', name: 'สถาพร', surname: 'โล่ห์คำ', address: '132 ม.9 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '1770300099993', nickname: 'ตาล', phone: '0987041506' },
  { title: 'นางสาว', name: 'ปราณี', surname: 'สระบุรี', address: '57/4 ม.6 ต.อ่างทอง อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3770300332775', nickname: 'นี', phone: '0922960542' },
  { title: 'นาย', name: 'สมคิด', surname: 'อยู่ดี', address: '123 ม.10 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '1779900015080', nickname: 'พี่ทอม', phone: '0806020281' },
  { title: 'นางสาว', name: 'วราภรณ์', surname: 'สมเชื้อ', address: '136/4 ม.2 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '3800800701434', nickname: 'อ้อ', phone: '0980308134' },
  { title: 'นางสาว', name: 'วีระนุช', surname: 'เหลือหลาย', address: '27 ม.2 ต.ทรายทอง อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '3770500158728', nickname: 'น้ำฝน', phone: '0916070521' },
  { title: 'นาง', name: 'ฉลวย', surname: 'วอนยิน', address: '127/4 ม.3 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200030700', nickname: 'เจ้หลวย', phone: '0615529273' },
  { title: 'นาย', name: 'สุวิทย์', surname: 'ดาราฤทธิ์', address: '97 ม.3 ต.ไชยราช อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '3770500249961', nickname: 'หมา', phone: '0930416733' },
  { title: 'นางสาว', name: 'กัณทิมา', surname: 'เที่ยงตรง', address: '112 ม.5 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200279929', nickname: 'พี่พร', phone: '0622478934' },
  { title: 'นางสาว', name: 'รุ่งอรุณ', surname: 'วิรุณยะปาน', address: '112/2 ม.9 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '5750300017221', nickname: 'อ้อ', phone: '0844129280' },
  { title: 'นาง', name: 'หีด', surname: 'ยอดใหญ่', address: '74/2 ม.6 ต.คลองวาฬ อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '8770190003676', nickname: 'เจ้หีด', phone: '0979733953' },
  { title: 'นาง', name: 'ถาวร', surname: 'ยอดนุ่ม', address: '46/1 ม.15 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3770600819173', nickname: 'ป้าหนู', phone: '0625131725' },
  { title: 'นางสาว', name: 'อริสา', surname: 'อ้นเปี่ยม', address: '25/2 ม.8 ต.บ่อนอก อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '1768900002408', nickname: 'ปอย', phone: '0956490213' },
  { title: 'นาย', name: 'ดาวรุ่ง', surname: 'นิโรรัมย์', address: '113 ม.4 ต.ทรายทอง อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '1310100026309', nickname: 'แอฟ', phone: '0807299098' },
  { title: 'นาย', name: 'ชาว', surname: 'เรืองสว่าง', address: '60 ม.7 ต.กุยเหนือ อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200367038', nickname: 'เช้า', phone: '0888005070' },
  { title: 'นางสาว', name: 'อำพร', surname: 'แย้มพงษ์', address: '179/1 ม.7 ต.กำเนิดนพคุณ อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400573006', nickname: 'ป้าเล็ก', phone: '0815030835' },
  { title: 'นาง', name: 'หวาน', surname: 'นุตรักษ์', address: '189/1 ม.3 ต.สามกระทาย อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200204678', nickname: 'ป้าหวาน', phone: '0619450412' },
  { title: 'นาง', name: 'อุบล', surname: 'แสงจันท์', address: '12/2 ม.3 ต.ชัยเกษม อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3900200257389', nickname: 'บล', phone: '0967731752' },
  { title: 'นางสาว', name: 'พรพิมล', surname: 'เนตรสว่าง', address: '91 ม.3 ต.นาหูกวาง อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3770300146491', nickname: 'แหม่ม', phone: '0806140319' },
  { title: 'นางสาว', name: 'ปวีณา', surname: 'คงกระพันธ์', address: '49/1 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '1119902214689', nickname: 'เปรี้ยว', phone: '0981294006' },
  { title: 'นางสาว', name: 'สายใจ', surname: 'เผือกผุด', address: '214 ม.8 ต.กุยบุรี อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '5770200017939', nickname: 'ปู', phone: '0813785566' },
  { title: 'นางสาว', name: 'สมศรี', surname: 'คงศิริ', address: '74/6 ม.3 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3720101054813', nickname: 'ป้าแอ๊ว', phone: '0995056159' },
  { title: 'นางสาว', name: 'สุทัตตา', surname: 'จันทะชัย', address: '608 ม.16 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '1779900250119', nickname: 'มาย', phone: '0988719407' },
  { title: 'นางสาว', name: 'ปิยะพร', surname: 'จันทร์แจ่มใส', address: '172/1 ม.9 ต.เขาไชยราช อ.ปะทิว จ.ชุมพร', id_card: '1841700096835', nickname: 'จ๋า', phone: '0932760907' },
  { title: 'นาง', name: 'ละม่อม', surname: 'แก้วเจริญ', address: '233 ม.9 ต.คลองวาฬ อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3770100368300', nickname: 'ป้าม่อม', phone: '0636476522' },
  { title: 'นางสาว', name: 'จันทร์เพ็ญ', surname: 'สังข์ลาโพธิ์', address: '132/1 ม.2 ต.อ่าวน้อย อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '1770600280391', nickname: 'ออย', phone: '0960186353' },
  { title: 'นาย', name: 'ทรงพล', surname: 'ทั่งทอง', address: '39/6 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3770300036277', nickname: 'ลุงสึก', phone: '0810356308' },
  { title: 'นาย', name: 'ทรงพล', surname: 'ทั่งทอง', address: '39/6 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3770300036277', nickname: 'ลุงสึก', phone: '0810356308' }, // ซ้ำ
  { title: 'นางสาว', name: 'รุ่งทิพย์', surname: 'แก้วสอาด', address: '61/5 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3760500619385', nickname: 'เจ้รวม', phone: '0923495575' },
  { title: 'นางสาว', name: 'รุ่งทิพย์', surname: 'แก้วสอาด', address: '61/5 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3760500619385', nickname: 'เจ้รวม', phone: '0923495575' }, // ซ้ำ
  { title: 'นาง', name: 'จันทรา', surname: 'เอี่ยมสอาด', address: '39 ม.8 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3760500418428', nickname: 'เจ้อ้อย', phone: '0860842851' },
  { title: 'นาย', name: 'วีรพล', surname: 'ทั่งทอง', address: '39/4 ม.2 ต.เขาล้าน อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3770300036246', nickname: 'พี่เจ', phone: '0884576155' },
  { title: 'นาย', name: 'จิรายุส', surname: 'ปุ่นหรั่ง', address: '18/18 ม.5 ต.ร่อนทอง อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '1770400129762', nickname: 'อาม', phone: '0937870907' },
  { title: 'นางสาว', name: 'นิตยา', surname: 'ช่างเจริญ', address: '150 ม.7 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '3710100042030', nickname: 'พี่นิด', phone: '0622414979' },
  { title: 'นางสาว', name: 'วิภารัตน์', surname: 'มั่นคง', address: '89/2 ม.5 ต.สามกระทาย อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3470800182775', nickname: 'พี่ฝ้าย', phone: '0968018858' },
  { title: 'นางสาว', name: 'รุ่งทิวา', surname: 'บุญลี', address: '31 ม.3 ต.บางสะพาน อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '1770500054098', nickname: 'มุก', phone: '0928602188' },
  { title: 'นางสาว', name: 'นัยนา', surname: 'กุมแก้ว', address: '125 ม.5 ต.ธงชัย อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400370407', nickname: 'จิ๊บ', phone: '0879782015' },
  { title: 'นางสาว', name: 'นัยนา', surname: 'กุมแก้ว', address: '125 ม.5 ต.ธงชัย อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400370407', nickname: 'จิ๊บ', phone: '0879782015' }, // ซ้ำ
  { title: 'นางสาว', name: 'นัยนา', surname: 'กุมแก้ว', address: '125 ม.5 ต.ธงชัย อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400370407', nickname: 'จิ๊บ', phone: '0879782015' }, // ซ้ำ
  { title: 'นาง', name: 'สุนันท์', surname: 'หมอมาก', address: '51/2 ม.1 ต.เกาะหลัก อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3770600035491', nickname: 'เขียด', phone: '0852976068' },
  { title: 'นาย', name: 'ก้องเกียรติ', surname: 'สวัสดี', address: '103/9 ม.7 ต.บ่อนอก อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '6770454000734', nickname: 'พี่หม่อง', phone: '0812733993' },
  { title: 'นางสาว', name: 'ศุภมิตร', surname: 'อินทบุต', address: '64/1 ม.7 ต.ทองมงคล อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400213085', nickname: 'น้อย', phone: '0615905437' },
  { title: 'นางสาว', name: 'กมลวรรณ', surname: 'เปี่ยมมา', address: '35/6 ม.7 ต.อ่างทอง อ.ทับสะแก จ.ประจวบคีรีขันธ์', id_card: '3600700448881', nickname: 'เจ๊ก', phone: '0806166529' },
  { title: 'นาย', name: 'กฤษณะ', surname: 'มาคล้าย', address: '120/6 ม.3 ต.ช้างแรก อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '3770500146967', nickname: 'หนึ่ง', phone: '0631010223' },
  { title: 'นาย', name: 'โยธิน', surname: 'สัตย์ซื่อ', address: '75 ม.3 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '1779900271248', nickname: 'โย', phone: '0986682292' },
  { title: 'นางสาว', name: 'ปวีณา', surname: 'สละรักษ์', address: '9849/1 ม.1 ต.คลองวาฬ อ.เมือง จ.ประจวบคีรีขันธ์', id_card: '3770100045101', nickname: 'เปิ้ล', phone: '0928098677' },
  { title: 'นางสาว', name: 'ฤทัยรัตน์', surname: 'ศรีเพ็ชร', address: '49/3 ม.9 ต.ทรายทอง อ.บางสะพานน้อย จ.ประจวบคีรีขันธ์', id_card: '1860300064684', nickname: 'มุ่ม', phone: '0624217039' },
  { title: 'นางสาว', name: 'สายฝน', surname: 'ศรีสุวรรณ', address: '87 ม.5 ต.ชัยเกษม อ.บางสะพาน จ.ประจวบคีรีขันธ์', id_card: '3770400472838', nickname: 'พี่อ้อย', phone: '0810384458' },
  { title: 'นางสาว', name: 'ชุติกาญจน์', surname: 'สัตย์ซื่อ', address: '75 ม.3 ต.หาดขาม อ.กุยบุรี จ.ประจวบคีรีขันธ์', id_card: '3770200027792', nickname: 'อ้อย', phone: '0654632341' }
];

// ฟังก์ชันกรองข้อมูลซ้ำ
function removeDuplicates(customers) {
  const seen = new Set();
  const uniqueCustomers = [];
  
  for (const customer of customers) {
    // สร้าง key จากชื่อ + นามสกุล + เลขบัตรประชาชน + เบอร์โทร
    const key = `${customer.name}${customer.surname}${customer.id_card}${customer.phone}`;
    
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCustomers.push(customer);
    } else {
      console.log(`⚠️  ข้อมูลซ้ำ: ${customer.name} ${customer.surname} (${customer.phone})`);
    }
  }
  
  return uniqueCustomers;
}

// ฟังก์ชันสร้าง customer code
function generateCustomerCode(index) {
  return `CUST${String(index + 1).padStart(3, '0')}`;
}

// ฟังก์ชันหลักสำหรับ insert ข้อมูล
async function insertCustomersBulk() {
  try {
    console.log('🔍 Starting customer bulk insertion...');
    
    // 1. กรองข้อมูลซ้ำ
    console.log(`📊 ข้อมูลดิบ: ${rawCustomers.length} รายการ`);
    const uniqueCustomers = removeDuplicates(rawCustomers);
    console.log(`✅ ข้อมูลหลังกรองซ้ำ: ${uniqueCustomers.length} รายการ`);
    
    // 2. ตรวจสอบข้อมูลที่มีอยู่แล้วในฐานข้อมูล
    console.log('🔍 ตรวจสอบข้อมูลที่มีอยู่แล้ว...');
    const existingCustomers = await query('SELECT id_card, phone FROM customers WHERE id_card IS NOT NULL AND id_card != ""');
    const existingIdCards = new Set(existingCustomers.map(c => c.id_card));
    const existingPhones = new Set(existingCustomers.map(c => c.phone));
    
    // 3. กรองข้อมูลที่ไม่มีในฐานข้อมูล
    const newCustomers = uniqueCustomers.filter(customer => {
      const hasIdCard = customer.id_card && customer.id_card.trim() !== '';
      const isNewIdCard = !hasIdCard || !existingIdCards.has(customer.id_card);
      const isNewPhone = !existingPhones.has(customer.phone);
      
      if (!isNewIdCard || !isNewPhone) {
        console.log(`⚠️  ข้อมูลมีอยู่แล้ว: ${customer.name} ${customer.surname} (${customer.phone})`);
      }
      
      return isNewIdCard && isNewPhone;
    });
    
    console.log(`✅ ข้อมูลใหม่ที่จะ insert: ${newCustomers.length} รายการ`);
    
    if (newCustomers.length === 0) {
      console.log('ℹ️  ไม่มีข้อมูลใหม่ที่จะ insert');
      return;
    }
    
    // 4. Insert ข้อมูลใหม่
    console.log('🚀 เริ่ม insert ข้อมูล...');
    
    for (let i = 0; i < newCustomers.length; i++) {
      const customer = newCustomers[i];
      const code = generateCustomerCode(i);
      
      const sql = `
        INSERT INTO customers (
          title, name, surname, address, id_card, nickname, phone, 
          branch_id, status, code, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, NOW(), NOW())
      `;
      
      await query(sql, [
        customer.title,
        customer.name,
        customer.surname,
        customer.address,
        customer.id_card || null, // ถ้าไม่มีเลขบัตรประชาชนให้เป็น null
        customer.nickname,
        customer.phone,
        code
      ]);
      
      console.log(`✅ Inserted: ${code} - ${customer.name} ${customer.surname} (${customer.phone})`);
    }
    
    console.log(`🎉 Insert เสร็จสิ้น! เพิ่มข้อมูล ${newCustomers.length} รายการ`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

// รัน script
insertCustomersBulk(); 