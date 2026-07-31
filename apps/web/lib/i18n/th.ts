const ERROR_TH: Record<string, string> = {
  VALIDATION_ERROR: 'ข้อมูลที่ส่งมาไม่ถูกต้อง',
  INVALID_CREDENTIALS: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  UNAUTHORIZED: 'กรุณาเข้าสู่ระบบใหม่',
  TOKEN_EXPIRED: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  STUDENT_NOT_FOUND: 'ไม่พบนักเรียนที่ระบุ',
  STUDENT_INACTIVE: 'เช็คชื่อได้เฉพาะนักเรียนที่ใช้งานอยู่',
  ATTENDANCE_ALREADY_EXISTS: 'นักเรียนคนนี้เช็คชื่อวันนี้แล้ว',
  ROUTE_NOT_FOUND: 'ไม่พบเส้นทางที่ร้องขอ',
  RATE_LIMIT_EXCEEDED: 'พยายามเข้าสู่ระบบบ่อยเกินไป กรุณาลองใหม่ภายหลัง',
  SUMMARY_INVARIANT_VIOLATION: 'ข้อมูลสรุปไม่สอดคล้อง กรุณาติดต่อผู้ดูแลระบบ',
  INTERNAL_SERVER_ERROR: 'เกิดข้อผิดพลาดภายในระบบ',
};

const MESSAGE_TH: Record<string, string> = {
  'Enter a valid email and password.': 'กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง',
  'Unable to sign in.': 'เข้าสู่ระบบไม่สำเร็จ',
  'Unable to load students.': 'โหลดรายชื่อนักเรียนไม่สำเร็จ',
  'Unable to load attendance summary.': 'โหลดสรุปการเข้าเรียนไม่สำเร็จ',
  'Unable to check in student.': 'บันทึกเช็คชื่อไม่สำเร็จ',
  'Select a valid student.': 'กรุณาเลือกนักเรียนให้ถูกต้อง',
  'The service is unavailable.': 'บริการไม่พร้อมใช้งานชั่วคราว',
  'Invalid credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  'Unauthorized': 'กรุณาเข้าสู่ระบบใหม่',
};

export function toThaiError(
  error?: { code?: string; message?: string } | null,
  fallback = 'เกิดข้อผิดพลาด กรุณาลองใหม่',
): string {
  if (!error) return fallback;
  if (error.code && ERROR_TH[error.code]) return ERROR_TH[error.code];
  if (error.message && MESSAGE_TH[error.message]) return MESSAGE_TH[error.message];
  if (error.message && MESSAGE_TH[error.message.trim()]) return MESSAGE_TH[error.message.trim()];
  return error.message || fallback;
}

export function thaiMessage(message: string, fallback?: string): string {
  return MESSAGE_TH[message] ?? fallback ?? message;
}

export function statusLabel(status: 'PRESENT' | 'LATE' | 'ACTIVE' | 'INACTIVE' | string): string {
  switch (status) {
    case 'PRESENT':
      return 'มาเรียน';
    case 'LATE':
      return 'มาสาย';
    case 'ACTIVE':
      return 'ใช้งานอยู่';
    case 'INACTIVE':
      return 'ไม่ใช้งาน';
    default:
      return status;
  }
}
