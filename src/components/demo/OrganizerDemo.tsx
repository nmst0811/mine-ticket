'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEventSeats, toggleSeatStatus } from '@/app/actions';
import { Seat } from '@/lib/utils/seat-utils';
import SeatGrid from '@/components/SeatGrid';
import { cn } from '@/lib/utils';

interface OrganizerDemoProps {
  eventId: string;
}

function sortedRows(seats: Seat[]): string[] {
  const unique = [...new Set(seats.map(s => s.rowName))];
  return unique.sort((a, b) => {
    const na = parseInt(a, 10), nb = parseInt(b, 10);
    return (!isNaN(na) && !isNaN(nb)) ? na - nb : a.localeCompare(b);
  });
}

function getSeatsInRange(seats: Seat[], from: Seat, to: Seat): Set<string> {
  const rows = sortedRows(seats);
  const fromRowIdx = rows.indexOf(from.rowName);
  const toRowIdx = rows.indexOf(to.rowName);
  const minRowIdx = Math.min(fromRowIdx, toRowIdx);
  const maxRowIdx = Math.max(fromRowIdx, toRowIdx);
  const minCol = Math.min(from.seatNum, to.seatNum);
  const maxCol = Math.max(from.seatNum, to.seatNum);

  const ids = new Set<string>();
  seats.forEach(s => {
    const rowIdx = rows.indexOf(s.rowName);
    if (rowIdx >= minRowIdx && rowIdx <= maxRowIdx && s.seatNum >= minCol && s.seatNum <= maxCol) {
      ids.add(s.id);
    }
  });
  return ids;
}

export default function OrganizerDemo({ eventId }: OrganizerDemoProps) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingChanges, setPendingChanges] = useState<Map<string, string>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  const [rangeMode, setRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState<Seat | null>(null);
  const [hoverSeat, setHoverSeat] = useState<Seat | null>(null);

  useEffect(() => {
    getEventSeats(eventId).then(data => {
      setSeats(data as Seat[]);
      setLoading(false);
    });
  }, [eventId]);

  const rangePreviewIds: Set<string> | undefined = (() => {
    if (!rangeMode || !rangeStart) return undefined;
    const target = hoverSeat ?? rangeStart;
    return getSeatsInRange(seats, rangeStart, target);
  })();

  const handleSeatClick = useCallback((seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    if (rangeMode) {
      if (!rangeStart) {
        setRangeStart(seat);
      } else {
        const rangeIds = getSeatsInRange(seats, rangeStart, seat);
        const effectiveAnchorStatus = pendingChanges.has(rangeStart.id)
          ? pendingChanges.get(rangeStart.id)!
          : rangeStart.status;
        const targetStatus = effectiveAnchorStatus === 'blocked' ? 'available' : 'blocked';

        setPendingChanges(prev => {
          const next = new Map(prev);
          rangeIds.forEach(id => {
            const s = seats.find(s => s.id === id)!;
            if (s.status !== targetStatus) {
              next.set(id, targetStatus);
            } else {
              next.delete(id);
            }
          });
          return next;
        });
        setRangeStart(null);
        setHoverSeat(null);
      }
    } else {
      setPendingChanges(prev => {
        const next = new Map(prev);
        const effectiveStatus = next.has(seatId) ? next.get(seatId)! : seat.status;
        const newStatus = effectiveStatus === 'blocked' ? 'available' : 'blocked';
        if (newStatus === seat.status) {
          next.delete(seatId);
        } else {
          next.set(seatId, newStatus);
        }
        return next;
      });
    }
  }, [seats, rangeMode, rangeStart, pendingChanges]);

  const handleConfirm = async () => {
    if (pendingChanges.size === 0) return;
    setIsSaving(true);
    try {
      await Promise.all(
        Array.from(pendingChanges.entries()).map(([seatId]) => {
          const seat = seats.find(s => s.id === seatId)!;
          return toggleSeatStatus(seatId, seat.status);
        })
      );
      const data = await getEventSeats(eventId);
      setSeats(data as Seat[]);
      setPendingChanges(new Map());
    } catch {
      alert('保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setPendingChanges(new Map());
    setRangeStart(null);
  };

  const toggleRangeMode = () => {
    setRangeMode(v => !v);
    setRangeStart(null);
    setHoverSeat(null);
  };

  const displaySeats = seats.map(s =>
    pendingChanges.has(s.id)
      ? { ...s, status: pendingChanges.get(s.id) as Seat['status'] }
      : s
  );

  if (loading) return <div className="text-white/20 text-sm">Loading seats from database...</div>;

  return (
    <div className="space-y-4 w-full max-w-4xl animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white">座席ブロック設定</h3>
          <p className="text-xs text-white/40 mt-0.5">
            {rangeMode
              ? rangeStart
                ? '終点の座席をクリックして範囲を確定'
                : '始点の座席をクリック'
              : 'クリックで「関係者席」を切り替え。決定を押してDBに保存。'
            }
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={toggleRangeMode}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg border font-bold transition-all",
              rangeMode
                ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
            )}
          >
            {rangeMode ? '⬛ 範囲選択中' : '⬜ 範囲選択'}
          </button>

          {pendingChanges.size > 0 && (
            <>
              <span className="text-xs text-amber-400 font-medium whitespace-nowrap">{pendingChanges.size} 件の変更</span>
              <button
                onClick={handleDiscard}
                className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
              >
                取り消し
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSaving}
                className="text-xs px-4 py-1.5 rounded-lg bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                {isSaving ? '保存中...' : '✓ 決定'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Range start indicator */}
      {rangeMode && rangeStart && (
        <div className="text-xs text-purple-300 bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2">
          始点: <strong>{rangeStart.rowName}-{rangeStart.seatNum}</strong>　→　終点をクリックして範囲を確定
          <button onClick={() => setRangeStart(null)} className="ml-3 text-purple-400 hover:text-white">✕ キャンセル</button>
        </div>
      )}

      <SeatGrid
        seats={displaySeats}
        onSeatClick={handleSeatClick}
        onSeatHover={(id) => setHoverSeat(id ? (seats.find(s => s.id === id) ?? null) : null)}
        rangePreviewIds={rangePreviewIds}
        mode="organizer"
      />
    </div>
  );
}
