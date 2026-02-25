import Link from "next/link";

import Sandbox from "@/components/demo/Sandbox";

export default function Home() {
  return (
    <div className="flex flex-col items-center bg-black overflow-hidden">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6 py-20 text-center relative">
        <div className="max-w-5xl space-y-8 relative z-10">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 text-sm font-medium tracking-wide animate-fade-in">
            もっと気軽に、手軽に。
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tighter text-white">
            ファンメイドライブに<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
              特化した座席決定。
            </span>
          </h1>
          <p className="text-base sm:text-xl text-white/60 md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            100〜300人規模の「手軽な」無料イベント管理。<br className="hidden md:block" />
            個人活動者やファンコミュニティのための、体験重視のチケットツール。
          </p>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#try" className="bg-cyan-400 text-black px-6 py-4 rounded-xl font-extrabold hover:bg-cyan-300 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)]">
              今すぐ試してみる
            </Link>
            <Link href="https://github.com/nmst0811/mine-ticket" target="_blank" rel="noopener noreferrer" className="bg-white/5 text-white border border-white/10 px-6 py-4 rounded-xl font-bold hover:bg-white/10 transition-all">
              詳しく知る
            </Link>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] -z-0" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] -z-0" />
      </section>

      {/* About Section */}
      <section id="about" className="w-full py-24 bg-white/[0.02] border-y border-white/5 scroll-mt-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                「もっと気軽に、<br />手軽に。」
              </h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-sm">主催者への価値</h4>
                  <p className="text-white/70 leading-relaxed font-light">
                    面倒な座席番号（列・番）の発行を、範囲選択で一瞬で終わらせたい。
                    もうエクセルや手書きの座席管理に悩む必要はありません。
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-blue-400 font-bold uppercase tracking-widest text-sm">来場者への価値</h4>
                  <p className="text-white/70 leading-relaxed font-light">
                    会員登録などの高いハードルなく、スムーズに座席を確保し、スマホで入場。
                    ファンとの大切な時間を、もっとスマートに。
                  </p>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-black border border-white/10 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  </div>
                  <div className="font-bold text-white">
                    ターゲット主催者
                  </div>
                </div>
                <ul className="space-y-3 text-sm text-white/50">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    個人活動者・Vtuber
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    ファンコミュニティ・オフ会
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    学生団体・文化祭
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sandbox Section */}
      <Sandbox />
    </div>
  );
}
