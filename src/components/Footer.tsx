export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-12">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm text-white/50">
          &copy; {new Date().getFullYear()} Mine-Ticket. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
