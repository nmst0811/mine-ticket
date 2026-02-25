'use client';

import { useState } from 'react';
import OrganizerDemo from './OrganizerDemo';
import VisitorDemo from './VisitorDemo';
import { cn } from '@/lib/utils';
import { createEvent } from '@/app/actions';

type Mode = 'organizer' | 'visitor' | null;
type OrganizerStep = 'setup' | 'manage';
type EventTypeValue = 'FREE_SEATING' | 'ASSIGNED_SEATING' | 'NUMBERED';

export default function Sandbox() {
  const [activeMode, setActiveMode] = useState<Mode>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventType, setEventType] = useState<EventTypeValue>('FREE_SEATING');
  const [organizerStep, setOrganizerStep] = useState<OrganizerStep>('setup');

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventTypeValue>('FREE_SEATING');
  const [rowRange, setRowRange] = useState('A-E');
  const [colRange, setColRange] = useState(10);
  const [capacity, setCapacity] = useState(50);
  const [isCreating, setIsCreating] = useState(false);

  const handleModeChange = (mode: Mode) => {
    setActiveMode(mode);
    if (mode === 'organizer' && eventId) {
      setOrganizerStep('manage');
    } else if (mode === 'organizer') {
      setOrganizerStep('setup');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const isSeating = type === 'FREE_SEATING' || type === 'ASSIGNED_SEATING';
    try {
      const id = await createEvent({
        title: title || 'サンドボックス イベント',
        date: new Date(),
        type,
        rowRange: isSeating ? rowRange : undefined,
        colRange: isSeating ? colRange : undefined,
        capacity: type === 'NUMBERED' ? capacity : undefined,
      });
      setEventId(id);
      setEventType(type);
      setOrganizerStep('manage');
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('イベントの作成に失敗しました。');
    } finally {
      setIsCreating(false);
    }
  };

  const isSeatingType = type === 'FREE_SEATING' || type === 'ASSIGNED_SEATING';

  const typeOptions: { value: EventTypeValue; icon: string; label: string; desc: string }[] = [
    { value: 'FREE_SEATING', icon: '🪑', label: '自由席', desc: '来場者が座席を選択' },
    { value: 'ASSIGNED_SEATING', icon: '🎯', label: '指定席', desc: '主催者がランダム割り当て' },
    { value: 'NUMBERED', icon: '🎟️', label: '整理券', desc: '枚数のみ・番号自動' },
  ];

  return (
    <div id="try" className="w-full py-16 md:py-24 scroll-mt-16">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col items-center">
        <div className="text-center mb-10 md:mb-16 space-y-3 md:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            サンドボックスモード (DB連携版)
          </h2>
          <p className="text-sm sm:text-lg text-white/50 max-w-2xl mx-auto font-light">
            ログインなしで、実際のデータベースへの保存と座席管理を今すぐ体験。
          </p>
        </div>

        {/* Mode tabs */}
        <div className="flex w-full max-w-sm sm:max-w-none sm:w-auto gap-2 sm:gap-4 mb-8 md:mb-12 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => handleModeChange('organizer')}
            className={cn(
              "flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeMode === 'organizer' ? "bg-cyan-400 text-black shadow-lg" : "text-white/60 hover:text-white"
            )}
          >
            主催者として試す
          </button>
          <button
            onClick={() => handleModeChange('visitor')}
            disabled={!eventId}
            title={!eventId ? '先に主催者でイベントを作成してください' : undefined}
            className={cn(
              "flex-1 sm:flex-none px-4 sm:px-8 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all",
              activeMode === 'visitor' ? "bg-cyan-400 text-black shadow-lg" : "text-white/60 hover:text-white",
              !eventId && "opacity-40 cursor-not-allowed"
            )}
          >
            来場者として試す
          </button>
        </div>

        <div className="w-full flex justify-center min-h-[400px] md:min-h-[500px]">
          {!activeMode ? (
            <div className="flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl w-full max-w-4xl bg-white/[0.02]">
              <p className="text-white/20 font-medium text-sm">モードを選択してデモを開始</p>
            </div>
          ) : activeMode === 'organizer' && organizerStep === 'setup' ? (
            // ── Phase 1: Event Creation Form ──
            <div className="w-full max-w-xl animate-fade-in">
              <form onSubmit={handleCreateEvent} className="space-y-5 bg-white/[0.03] p-5 sm:p-8 rounded-3xl border border-white/10">
                <h3 className="text-lg sm:text-xl font-bold text-white">イベントを作成する</h3>

                {/* Title */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/50 mb-2">ライブ名 / イベント名</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例: ファンメイドライブ 2026"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  />
                </div>

                {/* Type Toggle — 3 options */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white/50 mb-3">入場方式</label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {typeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setType(opt.value)}
                        className={cn(
                          "py-3 sm:py-4 rounded-xl border text-xs sm:text-sm font-bold transition-all",
                          type === opt.value
                            ? "bg-cyan-400/20 border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                            : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <div className="text-base sm:text-lg mb-1">{opt.icon}</div>
                        {opt.label}
                        <div className="text-[10px] sm:text-xs font-normal text-white/30 mt-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional layout inputs */}
                {isSeatingType ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/50 mb-2">列の範囲 (例: A-E・1-10)</label>
                      <input
                        type="text"
                        value={rowRange}
                        onChange={(e) => setRowRange(e.target.value)}
                        placeholder="例: A-E または 1-10"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-white/50 mb-2">1列あたりの席数</label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={colRange}
                        onChange={(e) => setColRange(parseInt(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-white/50 mb-2">発行枚数 (定員)</label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-cyan-400 text-black font-extrabold py-4 rounded-xl hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-50 text-sm sm:text-base"
                >
                  {isCreating ? '作成中...' : 'イベントを作成する →'}
                </button>
              </form>
            </div>
          ) : activeMode === 'organizer' && organizerStep === 'manage' && eventId ? (
            // ── Phase 2: Seat/Ticket Management ──
            <div className="w-full max-w-4xl animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">
                  方式: {eventType === 'FREE_SEATING' ? '🪑 自由席' : eventType === 'ASSIGNED_SEATING' ? '🎯 指定席' : '🎟️ 整理券'}
                </span>
                <button
                  onClick={() => { setOrganizerStep('setup'); setEventId(null); }}
                  className="text-xs text-white/30 hover:text-white/60 transition-colors"
                >
                  ← 別のイベントを作成
                </button>
              </div>
              <OrganizerDemo eventId={eventId} />
            </div>
          ) : activeMode === 'visitor' && eventId ? (
            <VisitorDemo eventId={eventId} eventType={eventType} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
