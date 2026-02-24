'use client';

import { useState } from 'react';
import { generateSeats, Seat } from '@/lib/utils/seat-utils';
import SeatGrid from '@/components/SeatGrid';

export default function VisitorDemo() {
  const [seats, setSeats] = useState<Seat[]>(() => {
    const s = generateSeats('A', 'E', 10);
    // Mock some already reserved seats
    return s.map((seat, i) => i % 7 === 0 ? { ...seat, status: 'reserved' } : seat);
  });
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(prev => prev === seatId ? null : seatId);
  };

  const handleBook = () => {
    if (!selectedSeat) return;
    setSeats(seats.map(s => s.id === selectedSeat ? { ...s, status: 'reserved' } : s));
    setSelectedSeat(null);
    alert('チケットを確保しました！（デモモード）');
  };

  return (
    <div className="space-y-6 w-full max-w-4xl animate-fade-in">
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
        <h3 className="text-xl font-bold text-white mb-2">ファンメイドライブ 2026</h3>
        <p className="text-sm text-white/60 mb-6 font-light">お好きな座席を選択してください（1人1枚まで）</p>

        <div className="flex justify-center gap-6 mb-8 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-white/10 border border-white/10" />
            <span className="text-white/40 uppercase">空席</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-400" />
            <span className="text-white/40 uppercase">予約済み</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-white/40 uppercase">選択中</span>
          </div>
        </div>

        <div className="relative overflow-hidden mb-8">
          {/* Displaying selected seat as blue for visual distinction in demo */}
          <SeatGrid
            seats={seats.map(s => s.id === selectedSeat ? { ...s, status: 'reserved' as any } : s)}
            onSeatClick={handleSeatSelect}
            mode="visitor"
          />
          {/* Overriding styles for 'selected' state in the grid would be better, 
                but for the demo we just swap status or we can add a selected style to SeatGrid.
                Let's stick to this simple approach for now. */}
        </div>

        <button
          onClick={handleBook}
          disabled={!selectedSeat}
          className="w-full max-w-xs bg-cyan-400 text-black font-extrabold py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)]"
        >
          {selectedSeat ? `${selectedSeat} を予約する` : '座席を選択してください'}
        </button>
      </div>
    </div>
  );
}
