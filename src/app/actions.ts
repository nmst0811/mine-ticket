'use server';

import prisma from '@/lib/db';
import { generateSeats } from '@/lib/utils/seat-utils';
import { Prisma } from '@prisma/client';

export async function createEvent(formData: {
  title: string;
  date: Date;
  type: 'FREE_SEATING' | 'ASSIGNED_SEATING' | 'NUMBERED';
  rowRange?: string;
  colRange?: number;
  capacity?: number;
}) {
  const isSeating = formData.type === 'FREE_SEATING' || formData.type === 'ASSIGNED_SEATING';

  const event = await prisma.event.create({
    data: {
      title: formData.title,
      date: formData.date,
      type: formData.type,
      rowRange: isSeating ? (formData.rowRange ?? null) : null,
      colRange: isSeating ? (formData.colRange ?? null) : null,
      capacity: formData.type === 'NUMBERED' ? (formData.capacity ?? null) : null,
    }
  });

  if (isSeating && formData.rowRange && formData.colRange) {
    const [rowStart, rowEnd] = formData.rowRange!.split('-');
    const seatsData = generateSeats(rowStart, rowEnd, formData.colRange!).map(s => ({
      eventId: event.id,
      rowName: s.rowName,
      seatNum: s.seatNum,
      status: 'available',
    }));

    await prisma.seat.createMany({
      data: seatsData,
    });
  } else if (formData.type === 'NUMBERED' && formData.capacity) {
    const seatsData = Array.from({ length: formData.capacity }, (_, i) => ({
      eventId: event.id,
      rowName: 'Ticket',
      seatNum: i + 1,
      status: 'available',
    }));

    await prisma.seat.createMany({
      data: seatsData,
    });
  }

  return event.id;
}

export async function createDemoEvent() {
  return await createEvent({
    title: 'ファンメイドライブ 2026 (Demo)',
    date: new Date(),
    type: 'FREE_SEATING',
    rowRange: 'A-E',
    colRange: 10,
  });
}

export async function getEventSeats(eventId: string) {
  return await prisma.seat.findMany({
    where: { eventId },
    orderBy: [
      { rowName: 'asc' },
      { seatNum: 'asc' },
    ],
  });
}

export async function getEventType(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { type: true },
  });
  return event?.type ?? 'FREE_SEATING';
}

export async function toggleSeatStatus(seatId: string, currentStatus: string) {
  const newStatus = currentStatus === 'available' ? 'blocked' : 'available';
  return await prisma.seat.update({
    where: { id: seatId },
    data: { status: newStatus },
  });
}

/** 自由席用: 来場者が指定した1席を予約 */
export async function bookSeat(eventId: string, seatId: string) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const seat = await tx.seat.findUnique({
      where: { id: seatId },
    });

    if (!seat || seat.status !== 'available') {
      throw new Error('Seat is not available');
    }

    await tx.seat.update({
      where: { id: seatId },
      data: { status: 'reserved' },
    });

    return await tx.ticket.create({
      data: {
        eventId,
        seatId,
        qrHash: Math.random().toString(36).substring(7),
      }
    });
  });
}

/** 指定席・整理券用: 空席からランダムに quantity 席を予約 */
export async function bookRandom(eventId: string, quantity: number, preferContiguous: boolean = false) {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const availableSeats = await tx.seat.findMany({
      where: { eventId, status: 'available' },
      orderBy: [
        { rowName: 'asc' },
        { seatNum: 'asc' },
      ],
    });

    if (availableSeats.length < quantity) {
      throw new Error(`空席が足りません（残り${availableSeats.length}席）`);
    }

    let picked: typeof availableSeats = [];

    // 連番希望（preferContiguous）のロジック
    if (preferContiguous && quantity > 1) {
      // 行ごとにグループ化
      const rows: Record<string, typeof availableSeats> = {};
      availableSeats.forEach(s => {
        if (!rows[s.rowName]) rows[s.rowName] = [];
        rows[s.rowName].push(s);
      });

      // 各行を走査して連番ペアを探す
      for (const rowName in rows) {
        const rowSeats = rows[rowName]; // 既に seatNum 順
        if (rowSeats.length < quantity) continue;

        for (let i = 0; i <= rowSeats.length - quantity; i++) {
          const chunk = rowSeats.slice(i, i + quantity);
          // 全てが連続しているかチェック (例: 1, 2, 3)
          const isContiguous = chunk.every((s, idx) => {
            if (idx === 0) return true;
            return s.seatNum === chunk[idx - 1].seatNum + 1;
          });

          if (isContiguous) {
            picked = chunk;
            break;
          }
        }
        if (picked.length > 0) break;
      }
    }

    // 連番が見つからない、または連番希望でない場合はランダム
    if (picked.length === 0) {
      const shuffled = [...availableSeats];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      picked = shuffled.slice(0, quantity);
    }

    const tickets = [];
    for (const seat of picked) {
      await tx.seat.update({
        where: { id: seat.id },
        data: { status: 'reserved' },
      });

      const ticket = await tx.ticket.create({
        data: {
          eventId,
          seatId: seat.id,
          qrHash: Math.random().toString(36).substring(7),
        }
      });
      tickets.push({ ...ticket, rowName: seat.rowName, seatNum: seat.seatNum });
    }

    return tickets;
  });
}
