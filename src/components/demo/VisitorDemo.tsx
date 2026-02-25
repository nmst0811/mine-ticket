'use client';

import { useState, useEffect } from 'react';
import { getEventSeats, bookSeat } from '@/app/actions';
import { Seat } from '@/lib/utils/seat-utils';
import SeatGrid from '@/components/SeatGrid';

interface VisitorDemoProps {
  eventId: string;
}

export default function VisitorDemo({ eventId }: VisitorDemoProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeats = async () => {
      const data = await getEventSeats(eventId);
      setSeats(data as Seat[]);
      setLoading(false);
    };
    fetchSeats();
  }, [eventId]);

  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(prev => prev === seatId ? null : seatId);
  };

  const handleBook = async () => {
    if (!selectedSeat) return;

    try {
      await bookSeat(eventId, selectedSeat);
      // Refresh seats
      const data = await getEventSeats(eventId);
      setSeats(data as Seat[]);
      setSelectedSeat(null);
      alert('チケットを確保しました！（DBに保存されました）');
    } catch (e) {
      alert('予約に失敗しました。他の人が先に予約した可能性があります。');
    }
  };

  if (loading) return <div className="text-white/20">Loading seats...</div>;

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
        </div>

        <div className="relative overflow-hidden mb-8">
          <SeatGrid
            seats={seats.map(s => s.id === selectedSeat ? { ...s, status: 'reserved' as any } : s)}
            onSeatClick={handleSeatSelect}
            mode="visitor"
          />
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
