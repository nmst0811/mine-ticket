import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tighter text-cyan-400">Mine-Ticket</span>
        </div>
        <nav className="flex items-center gap-8">
          <Link href="/#about" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            about
          </Link>
          <Link href="/#try" className="text-sm font-medium text-white/70 transition-colors hover:text-white">
            try
          </Link>
        </nav>
      </div>
    </header>
  );
}
