# การเปิดเผยการใช้ AI (AI_USAGE)

เอกสารนี้ตอบคำถามตามโจทย์ deliverable โดยตรง

## 1) ใช้ AI tool อะไรบ้าง

- **Cursor Composer** — ผู้ช่วยเขียนโค้ด ร่างโมดูล และเอกสารใน repository นี้

## 2) ใช้ AI ช่วยเรื่องใด

- โครง modular monolith ของ NestJS
- ร่าง Prisma schema / migration intent / seed
- ตัวช่วยโดเมน timezone Bangkok และ classification PRESENT/LATE
- Next.js BFF (HttpOnly cookie) และหน้าแดชบอร์ด
- สคริปต์ `npm run demo*` แบบข้ามแพลตฟอร์ม
- ร่างเอกสาร README / DESIGN / DEMO ฉบับแรก

## 3) Prompt หรือแนวคิดที่มีประโยชน์ที่สุด

ให้แดชบอร์ดเป็น **reference client ที่มีขอบเขตชัด**  
แต่ REST API ของ NestJS ต้องทดสอบและเรียกใช้ได้โดยตรงผ่าน curl / Swagger เสมอ  
ไม่ให้ฝั่งเว็บกลายเป็นจุดซ่อน backend

แนวนี้ช่วยกัน scope creep และคงจุดแข็งตามเกณฑ์โจทย์ (requirement analysis, design, explainability)

## 4) ส่วนที่ AI / ค่าตั้งต้นพาไปทางผิด แล้วแก้ยังไง

### เคสหลัก: พอร์ต PostgreSQL บน Windows

| ขั้น | รายละเอียด |
| --- | --- |
| ข้อเสนอเริ่มต้น | ใช้ Postgres บน host port `5432` ตามค่า local ทั่วไป |
| ทำไมดูดีตอนแรก | เป็นค่าเริ่มต้นยอดนิยม และตรง `.env.example` ตอนแรก |
| ตรวจยังไง | `docker exec` เข้าคอนเทนเนอร์ล็อกอินได้ แต่ Prisma จาก Windows host เจอ authentication error |
| สาเหตุจริง | มี PostgreSQL บนเครื่องฟังพอร์ต `5432` อยู่แล้ว |
| แก้ที่ไฟล์ | `docker-compose.yml` แมปเป็น `5433:5432`, อัปเดต `apps/api/.env.example` และเอกสาร README/AI_USAGE |
| ผลลัพธ์ | โหมดพัฒนาใช้ `localhost:5433`; โหมด demo เก็บ DB ไว้ใน Docker network ภายใน |

### เคสรอง: สคริปต์ demo บน Windows

| ขั้น | รายละเอียด |
| --- | --- |
| อาการ | `spawn npm ENOENT` / SQL ถูก PowerShell หั่นคำ |
| แก้ที่ไฟล์ | `scripts/shared/command.mjs`, `scripts/demo-smoke.mjs` |
| แนวแก้ | spawn `npm`/`npx` ผ่าน shell เฉพาะบน Windows; ส่ง SQL ผ่าน stdin แทน `-c` ยาว ๆ |
| ตรวจยืนยัน | `npm run demo` และ `npm run demo:smoke` ผ่านบน Windows จริง |

## สิ่งที่ยังเป็นงานของนักพัฒนา (ไม่โยนให้อัตโนมัติ)

- ยืนยันกฎธุรกิจ: `08:30` นับ PRESENT, Active-only, หนึ่งวันต่อหนึ่งคน
- กันไม่ให้ JWT โผล่ใน browser JS (BFF + HttpOnly)
- บังคับให้เทสใช้ `TEST_DATABASE_URL` โดยไม่ fallback เงียบ ๆ
- ตรวจ secret / log / response contract ก่อนส่ง
- อธิบาย trade-off ใน DESIGN และสัมภาษณ์ได้เอง

สรุป: ใช้ AI เพื่อเร่งงาน แต่ความถูกต้องของระบบและการตัดสินใจสุดท้ายเป็นของนักพัฒนา
