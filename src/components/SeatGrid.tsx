'use client';

import { Seat } from '@/lib/utils/seat-utils';
import { cn } from '@/lib/utils';

interface SeatGridProps {
  seats: Seat[];
  onSeatClick?: (seatId: string) => void;
  onSeatHover?: (seatId: string | null) => void;
  rangePreviewIds?: Set<string>;
  mode: 'organizer' | 'visitor';
}

export default function SeatGrid({ seats, onSeatClick, onSeatHover, rangePreviewIds, mode }: SeatGridProps) {
  // Group seats by row for cleaner layout
  const rows = seats.reduce((acc, seat) => {
    if (!acc[seat.rowName]) acc[seat.rowName] = [];
    acc[seat.rowName].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex flex-col items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 min-w-max mx-auto">
        {Object.entries(rows).map(([rowName, rowSeats]) => {
          const sortedRowSeats = rowSeats.sort((a, b) => a.seatNum - b.seatNum);

          // 整理券方式（Ticket）の場合は10個ずつに分割して表示
          if (rowName === 'Ticket') {
            const chunks = [];
            for (let i = 0; i < sortedRowSeats.length; i += 10) {
              chunks.push(sortedRowSeats.slice(i, i + 10));
            }
            return chunks.map((chunk, idx) => (
              <div key={`${rowName}-${idx}`} className="flex items-center gap-2">
                <div className="w-8 h-8 flex items-center justify-center text-[10px] font-bold text-white/20 uppercase">
                  {idx * 10 + 1}
                </div>
                <div className="flex gap-2">
                  {chunk.map((seat) => renderSeat(seat))}
                </div>
              </div>
            ));
          }

          // 通常の座席指定
          return (
            <div key={rowName} className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center text-xs font-bold text-white/40 uppercase">
                {rowName}
              </div>
              <div className="flex gap-2">
                {sortedRowSeats.map((seat) => renderSeat(seat))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  function renderSeat(seat: Seat) {
    const isRangePreview = rangePreviewIds?.has(seat.id);
    return (
      <button
        key={seat.id}
        onClick={() => onSeatClick?.(seat.id)}
        onMouseEnter={() => onSeatHover?.(seat.id)}
        onMouseLeave={() => onSeatHover?.(null)}
        disabled={mode === 'visitor' && seat.status !== 'available' && seat.status !== 'selected'}
        className={cn(
          "w-8 h-8 rounded-md text-[10px] flex items-center justify-center transition-all border",
          isRangePreview && "bg-purple-500/40 border-purple-400 text-white ring-1 ring-purple-400 scale-105",
          !isRangePreview && seat.status === 'available' && "bg-white/10 border-white/10 text-white hover:bg-cyan-400/20 hover:border-cyan-400/50",
          !isRangePreview && seat.status === 'selected' && "bg-amber-400 text-black border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)] scale-110",
          !isRangePreview && seat.status === 'reserved' && "bg-cyan-400 text-black border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]",
          !isRangePreview && seat.status === 'blocked' && "bg-white/5 border-dashed border-white/20 text-white/20 cursor-not-allowed",
          !isRangePreview && mode === 'organizer' && seat.status === 'blocked' && "bg-red-500/20 border-red-500/50 text-red-400",
        )}
        title={`${seat.rowName === 'Ticket' ? 'No.' : seat.rowName + '-'}${seat.seatNum} (${seat.status})`}
      >
        {seat.seatNum}
      </button>
    );
  }
}
