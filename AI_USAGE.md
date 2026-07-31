# การเปิดเผยการใช้ AI (AI_USAGE)

ใช้ Cursor Composer เป็นผู้ช่วยในการ implement เช่น scaffold โครงสร้าง, ร่างโมดูล, เขียนเอกสาร และสคริปต์ demo ข้ามแพลตฟอร์ม

## เครื่องมือที่ใช้

- Cursor Composer (ผู้ช่วย implement ในโปรเจกต์นี้)

## งานที่ AI ช่วย

- โครงสร้าง modular monolith ของ NestJS
- ร่าง Prisma schema และ seed
- ตัวช่วยโดเมนเรื่อง timezone Bangkok
- เส้นทาง BFF session และ UI แดชบอร์ด Next.js
- สแต็ก Docker Compose สำหรับ reviewer และสคริปต์ demo
- ร่าง README / DESIGN / DEMO

## แนวคิดพรอมต์ที่ได้ผลที่สุด

ให้แดชบอร์ดเป็น reference client ที่มีขอบเขตชัดเจน  
แต่ยังคงให้ NestJS REST API ทดสอบและเรียกใช้ได้โดยตรงผ่าน curl และ Swagger

## ปัญหาจริงที่พบและแก้ไข

### ข้อเสนอเริ่มต้นของ AI / ค่าตั้งต้นทั่วไป

ใช้ Docker Compose Postgres ที่พอร์ตโฮสต์ `5432` พร้อม credentials `nextschool/nextschool`

### ทำไมถึงดูสมเหตุสมผลตอนแรก

เป็นค่าเริ่มต้นที่พบบ่อยในงาน local development และตรงกับ `.env.example` ที่เตรียมไว้

### การตรวจยืนยัน

`docker exec` เข้าคอนเทนเนอร์แล้วล็อกอินฐานข้อมูลได้  
แต่ Prisma จาก Windows host ล้มเหลวด้วย authentication error เมื่อต่อ `localhost:5432`

### สาเหตุที่พบ

มี PostgreSQL บนเครื่อง Windows ฟังพอร์ต IPv4 `5432` อยู่แล้ว  
ทำให้ไคลเอนต์บนโฮสต์ไม่ได้คุยกับฐานข้อมูลใน Docker อย่างสม่ำเสมอ

### การแก้สุดท้าย

แมป Postgres โหมดพัฒนาไปพอร์ตโฮสต์ `5433`  
อัปเดต `DATABASE_URL` / `TEST_DATABASE_URL` ให้ตรงกัน  
และให้ฐานข้อมูลของ reviewer demo อยู่ใน Docker network ภายใน

การแก้เฉพาะ Windows อีกจุด: สคริปต์ demo ต้อง spawn `npm`/`npx` ผ่าน shell บน Windows  
ส่วนคำสั่ง SQL ผ่าน `docker exec` ต้องส่งทาง stdin เพื่อไม่ให้ PowerShell ตัดคำสั่งตามช่องว่าง

## สิ่งที่ยังเป็นความรับผิดชอบของนักพัฒนา

- ยืนยันกฎธุรกิจ (`08:30` นับเป็น PRESENT, เช็คชื่อได้เฉพาะ ACTIVE, หนึ่งวันต่อหนึ่งคน)
- ไม่ให้ JWT โผล่ใน JavaScript ของเบราว์เซอร์ โดยใช้คุกกี้ HttpOnly ผ่าน BFF
- ให้เทสใช้ `TEST_DATABASE_URL` โดยไม่ fallback ไปฐานพัฒนาเงียบ ๆ
- ตรวจ `npm run demo` และ smoke บนสภาพแวดล้อม Windows จริง
- รีวิวโค้ดที่สร้างขึ้นเรื่อง secret, log ที่ไม่ปลอดภัย และความตรงของ API contract
