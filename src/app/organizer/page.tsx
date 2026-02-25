'use client';

import { useState } from 'react';
import { createEvent } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

type EventTypeValue = 'FREE_SEATING' | 'ASSIGNED_SEATING' | 'NUMBERED';

export default function OrganizerPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<EventTypeValue>('FREE_SEATING');
  const [rowRange, setRowRange] = useState('A-E');
  const [colRange, setColRange] = useState(10);
  const [capacity, setCapacity] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const isSeatingType = type === 'FREE_SEATING' || type === 'ASSIGNED_SEATING';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const eventId = await createEvent({
        title,
        date: new Date(date),
        type,
        rowRange: isSeatingType ? rowRange : undefined,
        colRange: isSeatingType ? colRange : undefined,
        capacity: type === 'NUMBERED' ? capacity : undefined,
      });
      router.push(`/event/${eventId}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('イベントの作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions: { value: EventTypeValue; label: string; desc: string }[] = [
    { value: 'FREE_SEATING', label: '🪑 自由席', desc: '来場者が座席を選択' },
    { value: 'ASSIGNED_SEATING', label: '🎯 指定席', desc: 'ランダム割り当て' },
    { value: 'NUMBERED', label: '🎟️ 整理券', desc: '枚数のみ' },
  ];

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-white">イベント作成 (主催者管理画面)</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900/50 p-6 rounded-xl border border-gray-800 backdrop-blur-sm">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">ライブ名 / イベント名</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="例: ファンメイドライブ 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">開催日時</label>
          <input
            type="datetime-local"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">入場方式</label>
          <div className="grid grid-cols-3 gap-3">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={cn(
                  "py-3 rounded-lg border text-sm transition-all text-center",
                  type === opt.value
                    ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                )}
              >
                <div className="font-bold">{opt.label}</div>
                <div className="text-xs text-gray-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {isSeatingType ? (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">列の範囲 (例: A-E)</label>
              <input
                type="text"
                value={rowRange}
                onChange={(e) => setRowRange(e.target.value)}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">1列あたりの席数</label>
              <input
                type="number"
                value={colRange}
                onChange={(e) => setColRange(parseInt(e.target.value))}
                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">発行枚数 (定員)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value))}
              className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 shadow-lg shadow-purple-500/20"
        >
          {isLoading ? '作成中...' : 'イベントを作成する'}
        </button>
      </form>
    </div>
  );
}
