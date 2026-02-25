'use server';

import { PrismaClient } from '@prisma/client';
import { generateSeats } from '@/lib/utils/seat-utils';

const prisma = new PrismaClient();

export async function createDemoEvent() {
  const rowStart = 'A';
  const rowEnd = 'E';
  const colCount = 10;

  const event = await prisma.event.create({
    data: {
      title: 'ファンメイドライブ 2026 (Demo)',
      date: new Date(),
      rowRange: `${rowStart}-${rowEnd}`,
      colRange: colCount,
    }
  });

  const seatsData = generateSeats(rowStart, rowEnd, colCount).map(s => ({
    eventId: event.id,
    rowName: s.rowName,
    seatNum: s.seatNum,
    status: s.status,
  }));

  await prisma.seat.createMany({
    data: seatsData,
  });

  return event.id;
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

export async function toggleSeatStatus(seatId: string, currentStatus: string) {
  const newStatus = currentStatus === 'available' ? 'blocked' : 'available';
  return await prisma.seat.update({
    where: { id: seatId },
    data: { status: newStatus },
  });
}

export async function bookSeat(eventId: string, seatId: string) {
  return await prisma.$transaction(async (tx) => {
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
