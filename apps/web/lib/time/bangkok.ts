const BANGKOK = 'Asia/Bangkok';
export const CUTOFF_HOUR = 8;
export const CUTOFF_MINUTE = 30;
/** เริ่มเตือน “ใกล้ตัดเวลา” กี่นาทีก่อน 08:30 */
export const APPROACHING_MINUTES = 15;

export type CheckInPhase = 'early' | 'approaching' | 'on_time' | 'late';

export type BangkokClockSnapshot = {
  now: Date;
  dateLabel: string;
  timeLabel: string;
  timeShort: string;
  cutoffLabel: string;
  phase: CheckInPhase;
  /** นาทีจนถึงตัดเวลา (ติดลบ = เลยแล้ว) */
  minutesToCutoff: number;
  secondsToCutoff: number;
};

function bangkokParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BANGKOK,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '0';

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: Number(get('hour')),
    minute: Number(get('minute')),
    second: Number(get('second')),
  };
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function getBangkokClockSnapshot(now = new Date()): BangkokClockSnapshot {
  const bkk = bangkokParts(now);
  const nowSeconds = bkk.hour * 3600 + bkk.minute * 60 + bkk.second;
  const cutoffSeconds = CUTOFF_HOUR * 3600 + CUTOFF_MINUTE * 60;
  const secondsToCutoff = cutoffSeconds - nowSeconds;
  const minutesToCutoff = Math.ceil(secondsToCutoff / 60);

  let phase: CheckInPhase;
  if (secondsToCutoff < 0) phase = 'late';
  else if (secondsToCutoff === 0) phase = 'on_time';
  else if (secondsToCutoff <= APPROACHING_MINUTES * 60) phase = 'approaching';
  else phase = 'early';

  return {
    now,
    dateLabel: new Intl.DateTimeFormat('th-TH', {
      timeZone: BANGKOK,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(now),
    timeLabel: `${pad(bkk.hour)}:${pad(bkk.minute)}:${pad(bkk.second)}`,
    timeShort: `${pad(bkk.hour)}:${pad(bkk.minute)}`,
    cutoffLabel: `${pad(CUTOFF_HOUR)}:${pad(CUTOFF_MINUTE)}`,
    phase,
    minutesToCutoff,
    secondsToCutoff,
  };
}

export function formatDurationThai(totalSeconds: number) {
  const abs = Math.abs(totalSeconds);
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  const seconds = abs % 60;
  if (hours > 0) return `${hours} ชม. ${minutes} นาที`;
  if (minutes > 0) return `${minutes} นาที ${seconds} วินาที`;
  return `${seconds} วินาที`;
}

export function phaseCopy(snapshot: BangkokClockSnapshot) {
  const remaining = formatDurationThai(snapshot.secondsToCutoff);
  const past = formatDurationThai(snapshot.secondsToCutoff);

  switch (snapshot.phase) {
    case 'early':
      return {
        badge: 'ยังทันมาเรียน',
        title: `เหลืออีก ${remaining} ก่อนตัดเวลา ${snapshot.cutoffLabel} น.`,
        hint: 'เช็คชื่อตอนนี้จะได้สถานะ “มาเรียน”',
      };
    case 'approaching':
      return {
        badge: 'ใกล้ตัดเวลา',
        title: `เหลืออีก ${remaining} — ใกล้ช่วงตัด ${snapshot.cutoffLabel} น.`,
        hint: 'รีบเช็คชื่อก่อนหมดเวลา เพื่อไม่ให้เป็นมาสาย',
      };
    case 'on_time':
      return {
        badge: 'ถึงเวลาตัดพอดี',
        title: `ตอนนี้ตรง ${snapshot.cutoffLabel} น.`,
        hint: 'ยังนับเป็นมาเรียน — หลังจากนี้จะเป็นมาสาย',
      };
    case 'late':
      return {
        badge: 'เลยช่วงมาเรียนแล้ว',
        title: `เลย ${snapshot.cutoffLabel} น. ไปแล้ว ${past}`,
        hint: 'เช็คชื่อตอนนี้จะได้สถานะ “มาสาย”',
      };
  }
}
