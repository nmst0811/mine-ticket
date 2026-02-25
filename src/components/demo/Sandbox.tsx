'use client';

import { useState, useEffect } from 'react';
import OrganizerDemo from './OrganizerDemo';
import VisitorDemo from './VisitorDemo';
import { cn } from '@/lib/utils';
import { createDemoEvent } from '@/app/actions';

export default function Sandbox() {
  const [activeMode, setActiveMode] = useState<'organizer' | 'visitor' | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    const initDemo = async () => {
      // In a real app, you'd check for an existing demo ID in localStorage or similar
      // For this demo, we'll create a new one if not present to ensure the DB has data
      try {
        const id = await createDemoEvent();
        setEventId(id);
      } catch (e) {
        console.error("Failed to init demo", e);
      }
    };
    initDemo();
  }, []);

  return (
    <div id="try" className="w-full py-24 scroll-mt-16">
      <div className="container mx-auto px-6 flex flex-col items-center">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
            サンドボックスモード (DB連携版)
          </h2>
          <p className="text-lg text-white/50 max-w-2xl mx-auto font-light">
            ログインなしで、実際のデータベースへの保存と座席管理を今すぐ体験。
          </p>
        </div>

        <div className="flex gap-4 mb-12 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveMode('organizer')}
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-bold transition-all",
              activeMode === 'organizer' ? "bg-cyan-400 text-black shadow-lg" : "text-white/60 hover:text-white"
            )}
          >
            主催者として試す
          </button>
          <button
            onClick={() => setActiveMode('visitor')}
            className={cn(
              "px-8 py-3 rounded-xl text-sm font-bold transition-all",
              activeMode === 'visitor' ? "bg-cyan-400 text-black shadow-lg" : "text-white/60 hover:text-white"
            )}
          >
            来場者として試す
          </button>
        </div>

        <div className="w-full flex justify-center min-h-[500px]">
          {!activeMode ? (
            <div className="flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl w-full max-w-4xl bg-white/[0.02]">
              <p className="text-white/20 font-medium">モードを選択してデモを開始</p>
            </div>
          ) : !eventId ? (
            <div className="text-white/20">データベース上にイベントを準備中...</div>
          ) : activeMode === 'organizer' ? (
            <OrganizerDemo eventId={eventId} />
          ) : (
            <VisitorDemo eventId={eventId} />
          )}
        </div>
      </div>
    </div>
  );
}
