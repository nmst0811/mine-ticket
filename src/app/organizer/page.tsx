'use client';

import { useState } from 'react';
import { createEvent } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function OrganizerPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'SEATING' | 'NUMBERED'>('SEATING');
  const [rowRange, setRowRange] = useState('A-E');
  const [colRange, setColRange] = useState(10);
  const [capacity, setCapacity] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const eventId = await createEvent({
        title,
        date: new Date(date),
        type,
        rowRange: type === 'SEATING' ? rowRange : undefined,
        colRange: type === 'SEATING' ? colRange : undefined,
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
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setType('SEATING')}
              className={`flex-1 py-3 rounded-lg border transition-all ${type === 'SEATING'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                }`}
            >
              座席指定 (Seating)
            </button>
            <button
              type="button"
              onClick={() => setType('NUMBERED')}
              className={`flex-1 py-3 rounded-lg border transition-all ${type === 'NUMBERED'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-750'
                }`}
            >
              整理券 (Numbered)
            </button>
          </div>
        </div>

        {type === 'SEATING' ? (
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
