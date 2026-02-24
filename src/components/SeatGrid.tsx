'use client';

import { Seat } from '@/lib/utils/seat-utils';
import { cn } from '@/lib/utils'; // Assuming standard shadcn cn utility will be available or implemented

interface SeatGridProps {
  seats: Seat[];
  onSeatClick?: (seatId: string) => void;
  mode: 'organizer' | 'visitor';
}

export default function SeatGrid({ seats, onSeatClick, mode }: SeatGridProps) {
  // Group seats by row for cleaner layout
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.rowName]) acc[seat.rowName] = [];
    acc[seat.rowName].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="flex flex-col gap-4 overflow-auto p-4 bg-white/5 rounded-xl border border-white/10">
      {Object.entries(rows).map(([rowName, rowSeats]) => (
        <div key={rowName} className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white/40 uppercase">
            {rowName}
          </div>
          <div className="flex gap-2">
            {rowSeats.sort((a, b) => a.seatNum - b.seatNum).map((seat) => (
              <button
                key={seat.id}
                onClick={() => onSeatClick?.(seat.id)}
                disabled={mode === 'visitor' && seat.status !== 'available'}
                className={cn(
                  "w-8 h-8 rounded-md text-[10px] flex items-center justify-center transition-all border",
                  seat.status === 'available' && "bg-white/10 border-white/10 text-white hover:bg-cyan-400/20 hover:border-cyan-400/50",
                  seat.status === 'reserved' && "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]",
                  seat.status === 'blocked' && "bg-white/5 border-dashed border-white/20 text-white/20 cursor-not-allowed",
                  mode === 'organizer' && seat.status === 'blocked' && "bg-red-500/20 border-red-500/50 text-red-400"
                )}
                title={`${seat.rowName}-${seat.seatNum} (${seat.status})`}
              >
                {seat.seatNum}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
