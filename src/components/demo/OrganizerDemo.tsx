'use client';

import { useState, useEffect } from 'react';
import { getEventSeats, toggleSeatStatus } from '@/app/actions';
import { Seat } from '@/lib/utils/seat-utils';
import SeatGrid from '@/components/SeatGrid';

interface OrganizerDemoProps {
  eventId: string;
}

export default function OrganizerDemo({ eventId }: OrganizerDemoProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeats = async () => {
      const data = await getEventSeats(eventId);
      setSeats(data as Seat[]);
      setLoading(false);
    };
    fetchSeats();
  }, [eventId]);

  const toggleBlock = async (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    // Optimistic update
    const oldSeats = [...seats];
    setSeats(seats.map(s => s.id === seatId ? { ...s, status: s.status === 'blocked' ? 'available' : 'blocked' } : s));

    try {
      await toggleSeatStatus(seatId, seat.status);
    } catch (e) {
      setSeats(oldSeats);
      alert('更新に失敗しました');
    }
  };

  if (loading) return <div className="text-white/20">Loading seats from database...</div>;

  return (
    <div className="space-y-6 w-full max-w-4xl animate-fade-in">
      {/* Configuration UI removed for simplified demo persistency, or keep as is with new logic */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">座席ブロック設定 (DB連携中)</h3>
          <p className="text-xs text-white/40">クリックで「関係者席」を切り替え（DBに保存されます）</p>
        </div>
        <SeatGrid seats={seats} onSeatClick={toggleBlock} mode="organizer" />
      </div>
    </div>
  );
}
