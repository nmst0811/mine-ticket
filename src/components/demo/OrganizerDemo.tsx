'use client';

import { useState } from 'react';
import { generateSeats, Seat } from '@/lib/utils/seat-utils';
import SeatGrid from '@/components/SeatGrid';

export default function OrganizerDemo() {
  const [rowStart, setRowStart] = useState('A');
  const [rowEnd, setRowEnd] = useState('E');
  const [cols, setCols] = useState(10);
  const [seats, setSeats] = useState<Seat[]>(generateSeats('A', 'E', 10));

  const handleUpdate = () => {
    setSeats(generateSeats(rowStart, rowEnd, cols));
  };

  const toggleBlock = (seatId: string) => {
    setSeats(seats.map(s =>
      s.id === seatId
        ? { ...s, status: s.status === 'blocked' ? 'available' : 'blocked' }
        : s
    ));
  };

  return (
    <div className="space-y-6 w-full max-w-4xl animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-6 rounded-2xl border border-white/10">
        <div className="space-y-2">
          <label className="text-xs font-bold text-white/40 uppercase tracking-wider">列の範囲</label>
          <div className="flex items-center gap-2">
            <input
              value={rowStart}
              onChange={(e) => setRowStart(e.target.value.toUpperCase())}
              className="w-full bg-black border border-white/10 rounded-lg p-2 text-white focus:border-cyan-400 outline-none transition-colors"
              maxLength={1}
            />
            <span className="text-white/40">~</span>
            <input
              value={rowEnd}
              onChange={(e) => setRowEnd(e.target.value.toUpperCase())}
              className="w-full bg-black border border-white/10 rounded-lg p-2 text-white focus:border-cyan-400 outline-none transition-colors"
              maxLength={1}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-white/40 uppercase tracking-wider">番号の数 (1-20)</label>
          <input
            type="number"
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="w-full bg-black border border-white/10 rounded-lg p-2 text-white focus:border-cyan-400 outline-none transition-colors"
            min={1}
            max={20}
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleUpdate}
            className="w-full bg-cyan-400 text-black font-bold py-2 rounded-lg hover:bg-cyan-300 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            座席表を再生成
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">プレビュー / 座席ブロック設定</h3>
          <p className="text-xs text-white/40">クリックして「関係者席（ブロック）」を切り替え</p>
        </div>
        <SeatGrid seats={seats} onSeatClick={toggleBlock} mode="organizer" />
      </div>
    </div>
  );
}
