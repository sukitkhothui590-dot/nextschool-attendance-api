# คู่มือทดสอบสำหรับ Reviewer / Tester

เอกสารนี้บอกว่าคนที่จะทดสอบระบบต้องทำอะไรบ้าง  
**ของหลักคือ REST API** — หน้าเว็บเป็น Reference Client สำหรับพิสูจน์ workflow

---

## 1) สิ่งที่ต้องมีก่อนเริ่ม

| รายการ | หมายเหตุ |
| --- | --- |
| Git | clone repository |
| Node.js `>=20` | LTS แนะนำ |
| npm | มากับ Node |
| Docker Desktop | ต้องเปิดอยู่ก่อนรัน demo |
| พอร์ตว่าง | `3000` (web), `3001` (API) |

Repository: https://github.com/sukitkhothui590-dot/nextschool-attendance-api

---

## 2) เริ่มระบบ (คำสั่งเดียว)

```bash
git clone https://github.com/sukitkhothui590-dot/nextschool-attendance-api.git
cd nextschool-attendance-api
npm install
npm run demo
```

`npm run demo` จะ:

1. ตรวจ Docker / พอร์ต
2. สร้าง `.env.demo.local` (ครั้งแรก)
3. build + เปิด Postgres / API / Reference Client
4. migrate + seed ข้อมูลตัวอย่าง
5. รัน smoke test อัตโนมัติ
6. เปิดเบราว์เซอร์เมื่อพร้อม

รอจนเห็นข้อความว่า services healthy และ smoke checks passed

---

## 3) URL ที่ต้องรู้

| บริการ | URL |
| --- | --- |
| Reference Client | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/docs |
| Health | http://localhost:3001/health |
| Readiness | http://localhost:3001/ready |

---

## 4) บัญชีและข้อมูลทดสอบ

**Login**

```text
Email: admin@nextschool.local
Password: Password123!
```

**รหัสนักเรียน** รูปแบบ 10 หลัก `YY########` (ปี พ.ศ. 2 หลัก + ลำดับ)

| รหัส | ผลที่คาดหวัง |
| --- | --- |
| `6900000020` | เช็คชื่อสำเร็จ (`201`) |
| `6900000001` | ซ้ำวันนี้แล้ว (`409`) |
| `6900000021` | นักเรียนไม่ใช้งาน (`422`) |

มีข้อมูลรุ่นปี `69` / `68` / `67` ใน seed — ค้นหาด้วย `69` หรือ `68` ได้

---

## 5) เส้นทางทดสอบแนะนำ (Reference Client)

1. เปิด http://localhost:3000 → เข้าสู่ระบบ
2. **ภาพรวม** — ดูสรุปมาเรียน / มาสาย / ขาด + นาฬิกาเวลา Bangkok
3. **นักเรียน** — ค้นหา `6900000020` แล้วกดเช็คชื่อคนนี้ (หรือไปหน้าเช็คชื่อเอง)
4. **เช็คชื่อ** — พิมพ์รหัส/ชื่อ → เลือกคน → ยืนยัน → กด “เช็คคนถัดไป” ได้เลย
5. ลองเคสซ้ำ `6900000001` และเคส inactive `6900000021`

หน้าเว็บใช้พิสูจน์ API workflow ไม่ใช่ผลิตภัณฑ์ admin เต็มรูปแบบ

---

## 6) ทดสอบ API โดยตรง (แนะนำให้ทำคู่กัน)

### ผ่าน Swagger

1. เปิด http://localhost:3001/docs
2. `POST /login` ด้วยบัญชีด้านบน → คัดลอก `access_token`
3. กด Authorize ใส่ `Bearer <token>`
4. ลอง `GET /students`, `POST /attendance`, `GET /attendance/summary`

### ผ่าน curl (ตัวอย่าง)

```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@nextschool.local\",\"password\":\"Password123!\"}"
```

จากนั้นใช้ token เรียก endpoint อื่นตามเอกสารใน README / Swagger

---

## 7) คำสั่งช่วยเหลือ

```bash
npm run demo:status   # ดูสถานะ container
npm run demo:logs     # ดู log
npm run demo:smoke    # รัน smoke อีกรอบ (ต้องมีระบบเปิดอยู่)
npm run demo:stop     # หยุดบริการ
npm run demo:reset    # ลบ volume ข้อมูล demo แล้วรัน npm run demo ใหม่
```

ถ้าเคยเช็คชื่อ `6900000020` ไปแล้วและอยากลองเคสสำเร็จซ้ำ:

```bash
npm run demo:reset -- --yes
npm run demo
```

---

## 8) Checklist สั้น ๆ ว่า “ผ่าน”

- [ ] `npm run demo` สำเร็จ + smoke ผ่าน
- [ ] Login Reference Client ได้
- [ ] สรุป / รายชื่อ / เช็คชื่อใช้งานได้
- [ ] เคสสำเร็จ / ซ้ำ / inactive ได้ผลตามตาราง
- [ ] Swagger หรือ curl เรียก API ได้โดยตรง (ไม่พึ่ง UI)
- [ ] `/health` และ `/ready` ตอบ 200

รายละเอียดออกแบบดูที่ [DESIGN.md](DESIGN.md) · สคริปต์พูด 5 นาทีดูที่ [DEMO.md](DEMO.md)
