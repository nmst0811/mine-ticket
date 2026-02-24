export interface Seat {
  id: string;
  rowName: string;
  seatNum: number;
  status: 'available' | 'reserved' | 'blocked';
}

/**
 * Generates an array of seats based on row range (A-Z) and column count.
 */
export function generateSeats(rowStart: string, rowEnd: string, colCount: number): Seat[] {
  const seats: Seat[] = [];
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
