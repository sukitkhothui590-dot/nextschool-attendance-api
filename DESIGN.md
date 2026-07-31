# การตัดสินใจออกแบบ (DESIGN)

เอกสารนี้อธิบายการตัดสินใจสำคัญของงาน technical assignment  
โฟกัสที่เหตุผล ข้อแลกเปลี่ยน และสิ่งที่ตั้งใจไม่ทำ

---

## 1) ทำไมเลือก NestJS + TypeScript + PostgreSQL + Prisma

### NestJS (แทน Express เปล่า ๆ)

**เหตุผล**

- โครงสร้าง module / controller / service ชัด เหมาะกับโจทย์ที่มีหลาย use case
- มี ValidationPipe, Guard, Exception Filter, Interceptor เป็นมาตรฐาน
- Swagger รวมกับโค้ดได้โดยไม่ต้องดูแลสเปกแยกเองทั้งหมด

**ข้อแลกเปลี่ยน**

- boilerplate มากกว่า Express
- learning curve สูงกว่าเล็กน้อย

**ทำไมยังคุ้ม**

โจทย์ประเมิน system design และ code quality  
Nest ช่วยบังคับขอบเขตชั้นงานให้คงที่ แม้เวลาจำกัด

### PostgreSQL (แทน SQLite / MongoDB)

**เหตุผล**

- ต้องการ constraint จริง เช่น unique `(studentId, attendanceDate)`
- มี native `DATE` และ `TIMESTAMPTZ`
- ใกล้เคียงระบบโรงเรียนจริงมากกว่า

**ข้อแลกเปลี่ยน**

- ต้องมี Docker/Postgres ในเครื่อง
- setup ช้ากว่า SQLite

### Prisma

**เหตุผล**

- migration และ schema เป็นโค้ดที่อ่านง่าย
- type-safe query ลดความผิดพลาดตอนประกอบ response
- seed ทำซ้ำได้ชัด

**ข้อแลกเปลี่ยน**

- raw SQL ซับซ้อนบางแบบทำยากกว่า
- abstraction อาจซ่อนรายละเอียด DB บางจุด

### Next.js แดชบอร์ด (reference client)

API เป็นของหลักตามโจทย์  
แดชบอร์ดมีเพื่อให้ reviewer ทดสอบ workflow โดยไม่พึ่ง Postman อย่างเดียว  
และไม่แทนที่การเรียก REST โดยตรงผ่าน curl / Swagger

---

## 2) ทำไมออกแบบฐานข้อมูลแบบนี้

### ตารางหลัก

| ตาราง | หน้าที่ |
| --- | --- |
| `users` | ผู้ดูแลระบบสำหรับ login |
| `students` | นักเรียน + สถานะ ACTIVE/INACTIVE |
| `attendance` | บันทึกเช็คชื่อต่อวันธุรกิจ |

### `attendanceDate` ใช้ PostgreSQL `DATE`

- แทน “วันธุรกิจ Bangkok” ไม่ใช่ instant
- ไม่ผูกกับ timezone ของเครื่อง developer
- serialize เป็น `YYYY-MM-DD` ได้ตรง ๆ

ทางเลือกที่ตัดออก:

- string อิสระ → validate ยาก ไม่มี type safety ของปฏิทิน
- `TIMESTAMP` เก็บ midnight → พังง่ายเมื่อ session timezone ต่างกัน

### `checkedInAt` ใช้ `TIMESTAMPTZ`

- เก็บเวลาจริงแบบ absolute instant
- ใช้จัดประเภท PRESENT/LATE ได้แม้ deploy คนละโซน

### Unique `(studentId, attendanceDate)`

- เป็น authority สุดท้ายกันเช็คชื่อซ้ำ
- รองรับ concurrent request ได้ดีกว่าเช็คในแอปอย่างเดียว
- แอปเช็คล่วงหน้าเพื่อตอบ `409` ที่อ่านง่าย แล้วยัง map `P2002` เป็นโค้ดเดียวกัน

### ไม่เก็บแถว ABSENT

- Absent = `จำนวน ACTIVE − PRESENT − LATE`
- ลดข้อมูลซ้ำ และไม่ต้องสร้างแถวทุกคนทุกวัน
- ข้อจำกัด: สรุปอิงสถานะ ACTIVE ปัจจุบัน ไม่มีประวัติสถานะย้อนหลัง

### Index ที่ใส่

- `students(status)` สำหรับกรองและนับ ACTIVE
- `attendance(attendanceDate, status)` สำหรับ summary แบบ aggregate

ไม่ใส่ index เกินจำเป็น เพราะยังไม่มี query profile จริง

---

## 3) มีทางเลือกอื่นอะไรบ้าง แล้วทำไมไม่เลือก

| ทางเลือก | ทำไมไม่เลือกในงานนี้ |
| --- | --- |
| Express เปล่า ๆ | เร็วตอนเริ่ม แต่โครงสร้างและ error contract ต้องสร้างเองเยอะ |
| SQLite | setup ง่าย แต่ constraint/timezone/ops ใกล้ production น้อยกว่า |
| MongoDB | document ยืดหยุ่น แต่กฎ “วันละครั้งต่อคน” กับ transaction/aggregate ไม่ชัดเท่า relational |
| Microservices | over-engineering สำหรับ 4 endpoint |
| Refresh token + RBAC เต็มระบบ | นอกขอบโจทย์ ทำให้โฟกัสหลุด |
| Redis cache | ยังไม่มี bottleneck ที่วัดได้ |
| เก็บ ABSENT เป็นแถว | ข้อมูลบวม และต้อง sync เมื่อจำนวนนักเรียนเปลี่ยน |
| ให้ client ส่งเวลาเช็คชื่อเอง | โกง/คลาดเคลื่อนง่าย เซิร์ฟเวอร์ต้องเป็นเจ้าของเวลา |

หลักที่ใช้ตัดสิน: **โฟกัสความถูกต้องของกฎธุรกิจ + อธิบายได้ในสัมภาษณ์**

---

## 4) ถ้ามีเวลาเพิ่ม จะปรับปรุงอะไรต่อ

เรียงตามผลกระทบต่อคุณภาพระบบจริง:

1. **ประวัติสถานะนักเรียน** (`StudentStatusHistory` / enrollment period)  
   ให้ summary ย้อนหลังไม่เพี้ยนเมื่อนักเรียนถูกปิดใช้งานทีหลัง
2. **CI** รัน typecheck + unit/e2e อัตโนมัติทุก PR
3. **โครงสร้าง log/metrics** ที่ส่งเข้าระบบรวม (ยังไม่เต็ม tracing)
4. **Keyset pagination** เมื่อรายชื่อนักเรียนโต
5. **pg_trgm / full-text** ถ้า search แบบ contains ช้าลง
6. **CSRF strategy** ที่เหมาะกับ topology การ deploy จริงของ BFF
7. **Distributed rate limit** เมื่อมีหลาย instance

สิ่งที่ตั้งใจยังไม่ทำแม้มีเวลาเล็กน้อย: ฟีเจอร์ผลิตภัณฑ์นอกโจทย์ (CRUD นักเรียน, parent app, QR, Excel)

---

## 5) ถ้าต้องรองรับผู้ใช้ราว 1 ล้านคน จะเปลี่ยนอะไร

สมมติ “1 ล้าน” = โหลดสูงและข้อมูล attendance สะสมมาก ไม่ใช่แค่มี user ในตาราง

| พื้นที่ | ทิศทาง |
| --- | --- |
| การเขียนเช็คชื่อ | คง unique constraint; พิจารณา queue/batch ตามรูปแบบการใช้งานจริง |
| การอ่าน summary | pre-aggregate รายวัน หรือ materialized summary เมื่ออ่านบ่อยมาก |
| Pagination | ย้ายจาก offset ไป keyset สำหรับหน้าลึก |
| Search | เพิ่ม trigram/full-text และจำกัดรูปแบบค้นหา |
| Auth | short-lived access token + refresh หมุนเวียน, แผน revoke ที่ชัด |
| Deploy | แยก API หลาย instance, health/ready เดิมใช้ต่อได้, rate limit แบบกระจาย |
| Observability | metrics (latency, 409 rate), tracing, alert จาก SLO |
| ข้อมูลเก่า | partition ตาราง attendance ตามเดือน/ปี |

จะยังไม่เริ่มจาก microservices  
แยกบริการเมื่อมี bounded context และทีมที่รับผิดชอบชัด ไม่ใช่เพราะตัวเลขผู้ใช้เพียงอย่างเดียว

---

## การตัดสินใจสำคัญอื่น ๆ ที่เกี่ยวกับโจทย์

### เวลาธุรกิจและสถานะเข้าเรียน

- โซนธุรกิจ: `Asia/Bangkok`
- `<= 08:30:00.000` = `PRESENT`
- หลังนั้น = `LATE`
- เวลาเช็คชื่อมาจาก `Clock` ของเซิร์ฟเวอร์เท่านั้น
- เทสใช้ `FixedClock` ไม่แก้นาฬิกาเครื่อง

### สถาปัตยกรรม modular monolith

```
Route → Controller → Service → Repository → Prisma → PostgreSQL
```

- Controller จัดการ HTTP
- Service จัดการกฎธุรกิจ
- Repository จัดการ query
- ไม่ทำ generic base repository ที่ไม่มีคุณค่าจริง

### แดชบอร์ด + BFF

- Browser → Next.js BFF (HttpOnly cookie) → Nest API
- curl/Swagger → Nest API โดยตรง
- BFF ไม่คัดลอกกฎธุรกิจ

### Envelope และ error code

สำเร็จ:

```json
{ "success": true, "data": {} }
```

ผิดพลาด:

```json
{
  "success": false,
  "error": { "code": "ATTENDANCE_ALREADY_EXISTS", "message": "...", "details": null },
  "requestId": "..."
}
```

### Reviewer demo stack

- `npm run demo` = production-shaped containers + migrate + seed + smoke
- `docker-compose.yml` = Postgres สำหรับโหมดพัฒนา (พอร์ตโฮสต์ `5433`)
- แยกกันเพื่อไม่ให้ reviewer ต้องรันคำสั่ง DB เอง

รายละเอียด operational ของ demo/Docker เพิ่มเติมอยู่ใน README ส่วน Quick Start และ Troubleshooting
