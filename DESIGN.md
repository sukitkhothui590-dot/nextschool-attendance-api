# การตัดสินใจออกแบบ (DESIGN)

## รูปแบบการ deploy สำหรับ reviewer

สแต็ก demo ใช้ 4 บริการใน Compose: Postgres, ขั้นตอนเตรียมฐานข้อมูลแบบ one-shot, API และเว็บ  
ขั้นตอนเตรียมฐานข้อมูลจะรัน Prisma migrate ที่ commit ไว้แล้ว และ seed แบบ deterministic ก่อนให้ API เริ่มทำงาน  
เพื่อลด race ตอนสตาร์ท และให้ตรวจสอบแต่ละขั้นได้ชัดเจน

ไฟล์ `docker-compose.yml` คงไว้สำหรับโหมดพัฒนา โดย Postgres เปิดที่พอร์ตโฮสต์ `5433`  
ส่วน `docker-compose.demo.yml` เป็นสแต็กแยกสำหรับ reviewer แนว production-shaped  
เน็ตเวิร์กภายใน Docker เป็นหลัก และเปิดพอร์ตโฮสต์เฉพาะเว็บกับ API

## การ build Docker ใน monorepo

Dockerfile ทั้ง API และเว็บใช้ Node 22 Alpine และ `npm ci` แบบ workspace  
คัดลอก package manifest ก่อนซอร์ส เพื่อให้ layer cache ของ dependency ทำงานดี  
ฝั่ง API สร้าง Prisma Client แล้วคอมไพล์ Nest  
stage runtime มีเฉพาะ dependency สำหรับ production, ไฟล์ที่คอมไพล์แล้ว, schema/migrations และรันด้วย non-root user

ฝั่งเว็บใช้ Next.js แบบ `standalone`  
runtime คัดลอกเฉพาะเซิร์ฟเวอร์ standalone, static assets และ public assets แล้วรันด้วย non-root user

**ข้อแลกเปลี่ยน:** Dockerfile ยังต้องมี workspace manifests ของทั้ง monorepo  
เพราะ lockfile ต้องการโครงสร้าง workspace  
ตั้งค่ายุ่งกว่าแยก lock ต่อแพ็กเกจเล็กน้อย แต่ได้ lockfile เดียวเป็นแหล่งความจริง

## ขอบเขตความปลอดภัย

`INTERNAL_API_URL` ใช้เฉพาะ Next.js ฝั่งเซิร์ฟเวอร์ และชี้ไปที่ Docker service ชื่อ `api`  
ไม่ใส่เป็น `NEXT_PUBLIC_*`  
การยืนยันตัวตนของแดชบอร์ดใช้คุกกี้ HttpOnly ผ่าน BFF  
ไม่ส่ง JWT ของ API ไปอยู่ใน JavaScript ของเบราว์เซอร์

API ตรวจค่าคอนฟิกตั้งแต่เริ่มต้น, ปฏิเสธ JWT secret ที่สั้นเกินไป, ใช้ Helmet, CORS แบบระบุ origin,  
validation แบบ whitelist, rate limit ที่ login, JWT guard และ database constraints  
ค่า secret ใน demo เป็นของ local เท่านั้น ห้ามนำไปใช้กับสภาพแวดล้อมที่มีผู้ใช้จริง

## ความถูกต้องของการเช็คชื่อ

วันธุรกิจใช้เวลา Bangkok (`Asia/Bangkok`)  
unique index ที่ `(studentId, attendanceDate)` เป็นเกราะสุดท้ายกันเช็คชื่อซ้ำพร้อมกัน  
เซอร์วิสเช็คล่วงหน้าเพื่อตอบ `409` ที่เข้าใจง่าย  
และยัง map ความผิดพลาด unique ตอน insert ให้เป็นผลลัพธ์เดียวกัน

Seed ทำให้:

- `NS0001` พร้อมสาธิตเคสซ้ำ
- `NS0020` พร้อมสาธิตเคสสำเร็จ
- `NS0021` เป็นนักเรียน INACTIVE

Smoke test จะลบเฉพาะแถววันนี้ของ `NS0020` ในฐานข้อมูล demo ก่อนตรวจ `201`  
ไม่เพิ่ม endpoint รีเซ็ตเข้า public API

## ข้อแลกเปลี่ยนด้านปฏิบัติการ

- ข้อมูล demo คงอยู่เป็นค่าเริ่มต้น เพื่อให้ reviewer ตรวจต่อได้  
  `demo:reset` ต้องยืนยันก่อนลบ volume ที่ตั้งชื่อไว้
- `/health` เป็น liveness ที่ตอบเร็ว  
  `/ready` ตรวจว่าฐานข้อมูลเชื่อมต่อได้
- สคริปต์ demo ใช้ Node ESM และ `child_process.spawn` แบบส่งอาร์กิวเมนต์เป็น array  
  เพื่อรองรับ Windows PowerShell, macOS และ Linux  
  การเปิดเบราว์เซอร์เป็น best effort ไม่ทำให้สตาร์ททั้งระบบล้มเหลวหากเปิดไม่ได้
