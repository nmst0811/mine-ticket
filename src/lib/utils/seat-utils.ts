export interface Seat {
  id: string;
  rowName: string;
  seatNum: number;
  status: 'available' | 'reserved' | 'blocked' | 'selected';
}

/**
 * Generates an array of seats based on row range (A-Z or 1-10) and column count.
 */
export function generateSeats(rowStart: string, rowEnd: string, colCount: number): Seat[] {
  const seats: Seat[] = [];

  const startNum = parseInt(rowStart, 10);
  const endNum = parseInt(rowEnd, 10);
  const isNumeric = !isNaN(startNum) && !isNaN(endNum);

  if (isNumeric) {
    // Numeric rows: 1, 2, 3, ..., 10
    for (let r = startNum; r <= endNum; r++) {
      for (let c = 1; c <= colCount; c++) {
        seats.push({
          id: `${r}-${c}`,
          rowName: String(r),
          seatNum: c,
          status: 'available',
        });
      }
    }
  } else {
    // Alphabetic rows: A, B, C, ..., E
    const startCode = rowStart.charCodeAt(0);
    const endCode = rowEnd.charCodeAt(0);
    for (let r = startCode; r <= endCode; r++) {
      const rowName = String.fromCharCode(r);
      for (let c = 1; c <= colCount; c++) {
        seats.push({
          id: `${rowName}-${c}`,
          rowName,
          seatNum: c,
          status: 'available',
        });
      }
    }
  }

  return seats;
}

/**
 * Mock data for the "Experience-based demo"
 */
export const MOCK_DEMO_EVENT = {
  id: 'demo-event',
  title: 'ファンメイドライブ 2026',
  rowRange: 'A-E',
  colRange: 10,
};
