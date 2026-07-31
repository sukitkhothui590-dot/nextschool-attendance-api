# สคริปต์สาธิต 5 นาที (DEMO)

## 0:00 — เริ่มระบบ

รัน:

```bash
npm run demo
```

คำสั่งนี้ตรวจ Docker และพอร์ตที่จำเป็น, build สแต็ก, migrate/seed ฐานข้อมูลที่แยกไว้,  
รัน smoke test และเปิด Reference Client เมื่อพร้อม

## 1:00 — เข้าสู่ระบบ

เปิด http://localhost:3000 แล้วล็อกอินด้วย:

```text
admin@nextschool.local
Password123!
```

อธิบายสั้น ๆ ว่า:

- **ของหลักคือ REST API** — เปิด Swagger / เรียก curl ได้โดยตรง
- หน้าเว็บเป็น **Reference Client** ที่ใช้พิสูจน์ API workflow และ API usability  
  (login → สรุป → ค้นหา → เช็คชื่อ) ไม่ใช่ฟีเจอร์เสริมเพื่อความสวย
- เรียก API ผ่าน BFF + คุกกี้ HttpOnly และไม่คัดลอกกฎธุรกิจฝั่ง UI

## 2:00 — ดูข้อมูลการดำเนินงาน

โชว์รายชื่อนักเรียนและสรุปการเช็คชื่อ  
รหัสนักเรียนเป็น **10 หลัก** ขึ้นต้นด้วยปี พ.ศ. 2 หลัก (`69…` ปีนี้, มีรุ่น `68…` / `67…` ด้วย)  
ค้นหา `6900000020`, `6900000001` และ `6900000021` เพื่อแนะนำ 3 เคส demo

## 3:00 — อธิบายกฎการเช็คชื่อ

- `6900000020`: ACTIVE และยังไม่มี attendance วันนี้ → เช็คชื่อสำเร็จ
- `6900000001`: seed ไว้ว่ามาแล้ววันนี้ → เช็คซ้ำได้ conflict
- `6900000021`: INACTIVE → ถูกปฏิเสธ

เปิด Swagger ที่ http://localhost:3001/docs เพื่อโชว์ REST contract และเงื่อนไข authentication

## 4:00 — โชว์จุดที่ทำให้ระบบน่าเชื่อถือ

พูดถึงวันธุรกิจ Bangkok, unique constraint ในฐานข้อมูล, JWT guard,  
การ validate คำขอ, rate limit ที่ login, endpoint `/health` กับ `/ready`
และลำดับ dependency ตอน Compose สตาร์ท

## คำสั่งเสริมสำหรับ reviewer

```bash
npm run demo:status
npm run demo:logs
npm run demo:smoke
npm run demo:reset
```

คู่มือทดสอบทีละขั้นสำหรับคนที่จะเอาไปลองระบบ: **[TESTING.md](TESTING.md)**
