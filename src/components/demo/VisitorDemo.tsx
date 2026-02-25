'use client';

import { useState, useEffect } from 'react';
import { getEventSeats, bookSeat, bookRandom } from '@/app/actions';
import { Seat } from '@/lib/utils/seat-utils';
import SeatGrid from '@/components/SeatGrid';
import { cn } from '@/lib/utils';

interface VisitorDemoProps {
  eventId: string;
  eventType: 'FREE_SEATING' | 'ASSIGNED_SEATING' | 'NUMBERED';
}

export default function VisitorDemo({ eventId, eventType }: VisitorDemoProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [preferContiguous, setPreferContiguous] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [result, setResult] = useState<{ rowName: string; seatNum: number }[] | null>(null);

  useEffect(() => {
    const fetchSeats = async () => {
      const data = await getEventSeats(eventId);
      setSeats(data as Seat[]);
      setLoading(false);
    };
    fetchSeats();
  }, [eventId]);

  const availableCount = seats.filter(s => s.status === 'available').length;

  // ── FREE_SEATING: 座席を選んで予約 ──
  const handleSeatSelect = (seatId: string) => {
    setSelectedSeat(prev => prev?.id === seatId ? null : seats.find(s => s.id === seatId) ?? null);
  };

  const handleBookSingle = async () => {
    if (!selectedSeat) return;
    try {
      await bookSeat(eventId, selectedSeat.id);
      const data = await getEventSeats(eventId);
      setSeats(data as Seat[]);
      setSelectedSeat(null);
      alert('チケットを確保しました！（DBに保存されました）');
    } catch {
      alert('予約に失敗しました。他の人が先に予約した可能性があります。');
    }
  };

  // ── ASSIGNED_SEATING / NUMBERED: 枚数だけ指定して予約 ──
  const handleBookRandom = async () => {
    if (quantity < 1 || quantity > availableCount) return;
    setIsBooking(true);
    setResult(null);
    try {
      const tickets = await bookRandom(eventId, quantity, preferContiguous);
      const data = await getEventSeats(eventId);
      setSeats(data as Seat[]);
      setResult(tickets.map(t => ({ rowName: t.rowName, seatNum: t.seatNum })));
    } catch (err) {
      alert(err instanceof Error ? err.message : '予約に失敗しました。');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="text-white/20 text-sm">Loading seats...</div>;

  // ── ASSIGNED_SEATING / NUMBERED: 枚数選択 UI ──
  if (eventType === 'ASSIGNED_SEATING' || eventType === 'NUMBERED') {
    const isAssigned = eventType === 'ASSIGNED_SEATING';
    return (
      <div className="space-y-4 sm:space-y-6 w-full max-w-xl animate-fade-in">
        <div className="bg-white/5 p-6 sm:p-8 rounded-2xl border border-white/10 text-center space-y-6">
          <div>
            <h3 className="text-base sm:text-xl font-bold text-white mb-1">ファンメイドライブ 2026</h3>
            <p className="text-xs sm:text-sm text-white/60 font-light">
              {isAssigned ? '指定席 — 座席はランダムで割り当てられます' : '整理券 — 番号は自動で割り当てられます'}
            </p>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-center gap-2 text-sm text-white/40">
            <span className={availableCount > 0 ? 'text-cyan-400' : 'text-red-400'}>
              残り {availableCount} {isAssigned ? '席' : '枚'}
            </span>
          </div>

          {/* Quantity selector */}
          {availableCount > 0 && !result && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-white/50 mb-2">枚数を選択</label>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all"
                  >
                    −
                  </button>
                  <span className="text-2xl font-extrabold text-white w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(availableCount, Math.min(4, q + 1)))}
                    className="w-10 h-10 rounded-lg bg-white/10 text-white font-bold text-lg hover:bg-white/20 transition-all"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-2">最大4枚まで</p>
              </div>

              {/* Contiguous Option for Assigned Seating */}
              {isAssigned && quantity > 1 && (
                <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5 space-y-3">
                  <label className="flex items-center justify-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferContiguous}
                      onChange={(e) => setPreferContiguous(e.target.checked)}
                      className="w-5 h-5 rounded border-white/20 bg-black/40 text-cyan-400 focus:ring-cyan-400/50"
                    />
                    <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      連番を希望する
                    </span>
                  </label>
                  <p className="text-[11px] text-white/40 leading-relaxed max-w-[280px] mx-auto text-left sm:text-center">
                    ※ 可能な限り隣り合った席を確保しますが、空席状況により離れた席になる場合があります。その場合も予約は実行されます。
                  </p>
                </div>
              )}

              <button
                onClick={handleBookRandom}
                disabled={isBooking}
                className="w-full max-w-xs mx-auto block bg-cyan-400 text-black font-extrabold py-3 sm:py-4 rounded-xl disabled:opacity-50 hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] text-sm sm:text-base"
              >
                {isBooking ? '割り当て中...' : `${quantity}${isAssigned ? '席' : '枚'}を予約する`}
              </button>
            </div>
          )}

          {/* Result display */}
          {result && (
            <div className="bg-cyan-400/10 border border-cyan-400/30 rounded-xl p-4 sm:p-6 space-y-3 animate-fade-in">
              <div className="text-cyan-400 font-bold text-sm">✓ 予約が完了しました！</div>
              <div className="flex flex-wrap justify-center gap-2">
                {result.map((r, i) => (
                  <div
                    key={i}
                    className="bg-cyan-400/20 text-cyan-300 px-3 py-2 rounded-lg text-sm font-bold border border-cyan-400/30"
                  >
                    {isAssigned ? `${r.rowName}-${r.seatNum}` : `No.${r.seatNum}`}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-xs text-white/40 hover:text-white/60 transition-colors mt-2"
              >
                続けて予約する
              </button>
            </div>
          )}

          {availableCount === 0 && !result && (
            <div className="text-red-400/80 text-sm font-medium py-4">
              満席です
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── FREE_SEATING: 座席グリッド UI ──
  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-4xl animate-fade-in">
      <div className="bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10 text-center">
        <h3 className="text-base sm:text-xl font-bold text-white mb-1 sm:mb-2">ファンメイドライブ 2026</h3>
        <p className="text-xs sm:text-sm text-white/60 mb-4 sm:mb-6 font-light">お好きな座席を選択してください（1人1枚まで）</p>

        {/* Legend */}
        <div className="flex justify-center gap-4 sm:gap-6 mb-6 sm:mb-8 text-xs font-medium flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-white/10 border border-white/10" />
            <span className="text-white/40 uppercase">空席</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-400" />
            <span className="text-white/40 uppercase">選択中</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-cyan-400" />
            <span className="text-white/40 uppercase">予約済み</span>
          </div>
        </div>

        {/* Grid with horizontal scroll on mobile */}
        <div className="relative overflow-x-auto mb-6 sm:mb-8">
          <div className="inline-block min-w-full">
            <SeatGrid
              seats={seats.map(s => s.id === selectedSeat?.id ? { ...s, status: 'selected' as const } : s)}
              onSeatClick={handleSeatSelect}
              mode="visitor"
            />
          </div>
        </div>

        <button
          onClick={handleBookSingle}
          disabled={!selectedSeat}
          className="w-full max-w-xs bg-cyan-400 text-black font-extrabold py-3 sm:py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] text-sm sm:text-base"
        >
          {selectedSeat ? `${selectedSeat.rowName}-${selectedSeat.seatNum} を予約する` : '座席を選択してください'}
        </button>
      </div>
    </div>
  );
}
