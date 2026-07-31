# สคริปต์สาธิต 5 นาที (DEMO)

## 0:00 — เริ่มระบบ

รัน:

```bash
npm run demo
```

คำสั่งนี้ตรวจ Docker และพอร์ตที่จำเป็น, build สแต็ก, migrate/seed ฐานข้อมูลที่แยกไว้,  
รัน smoke test และเปิดแดชบอร์ด

## 1:00 — เข้าสู่ระบบ

เปิด http://localhost:3000 แล้วล็อกอินด้วย:

```text
admin@nextschool.local
Password123!
```

อธิบายสั้น ๆ ว่าแดชบอร์ดเรียก API ผ่านเซิร์ฟเวอร์ (BFF) และเก็บ session ในคุกกี้ HttpOnly

## 2:00 — ดูข้อมูลการดำเนินงาน

โชว์รายชื่อนักเรียนและสรุปการเช็คชื่อ  
ค้นหา `NS0020`, `NS0001` และ `NS0021` เพื่อแนะนำ 3 เคส demo

## 3:00 — อธิบายกฎการเช็คชื่อ

- `NS0020`: ACTIVE และยังไม่มี attendance วันนี้ → เช็คชื่อสำเร็จ
- `NS0001`: seed ไว้ว่ามาแล้ววันนี้ → เช็คซ้ำได้ conflict
- `NS0021`: INACTIVE → ถูกปฏิเสธ

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

`demo:reset` จะถามยืนยันก่อนลบ volume ของ Postgres เฉพาะ demo
