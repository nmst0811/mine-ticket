'use server';

import prisma from '@/lib/db';
import { generateSeats } from '@/lib/utils/seat-utils';
import { Prisma } from '@prisma/client';

export async function createEvent(formData: {
  title: string;
  date: Date;
  type: 'SEATING' | 'NUMBERED';
  rowRange?: string;
  colRange?: number;
  capacity?: number;
}) {
  const event = await prisma.event.create({
    data: {
      title: formData.title,
      date: formData.date,
      type: formData.type,
      rowRange: formData.type === 'SEATING' ? (formData.rowRange ?? null) : null,
      colRange: formData.type === 'SEATING' ? (formData.colRange ?? null) : null,
      capacity: formData.type === 'NUMBERED' ? (formData.capacity ?? null) : null,
    }
  });

  if (formData.type === 'SEATING' && formData.rowRange && formData.colRange) {
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
    type: 'SEATING',
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

export async function toggleSeatStatus(seatId: string, currentStatus: string) {
  const newStatus = currentStatus === 'available' ? 'blocked' : 'available';
  return await prisma.seat.update({
    where: { id: seatId },
    data: { status: newStatus },
  });
}

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
