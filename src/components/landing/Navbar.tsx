import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, BookOpen, Phone, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/holy-quran', label: 'Holy Quran' },
  { href: '/programs', label: 'Programs' },
  { href: '/about', label: 'About Us' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-500">
      {/* Top Trust Bar - instills immediate security feel */}
      <div className={cn(
        "bg-emerald-600 text-white/95 py-2 transition-all duration-500 overflow-hidden",
        isScrolled ? "h-0 opacity-0" : "h-10 opacity-100"
      )}>
        <div className="container mx-auto px-4 flex justify-between items-center text-[10px] sm:text-xs font-bold tracking-wider uppercase">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-accent" />
              Verified Professional Tutors
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold-accent" />
              100% Secure 1-on-1 Lessons
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-accent" />
              24/7 Global Availability
            </span>
          </div>
        </div>
      </div>

      <nav className={`w-full transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border/10 py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group transition-all duration-500">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Quran With Tahir"
                  className="h-16 md:h-20 w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-700 animate-in fade-in zoom-in duration-1000"
                />
                {!isScrolled && (
                  <div className="absolute -inset-2 bg-emerald-500/5 blur-2xl rounded-full -z-10 animate-pulse" />
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-black text-emerald-900/80 hover:text-emerald-700 transition-all duration-300 flex items-center gap-2 group relative"
                >
                  <span className="relative">
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-6">
              <a
                href="tel:+923110267879"
                className={cn(
                  "flex items-center gap-2 text-sm transition-all duration-300 font-extrabold group",
                  isScrolled ? "text-slate-500 hover:text-emerald-700" : "text-emerald-900/60 hover:text-emerald-700"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Phone className="w-4 h-4 text-emerald-600" />
                </div>
                <span>+92 311 026 7879</span>
              </a>

              <Link to="/login">
                <Button variant="ghost" className={cn(
                  "font-black px-6 hover:bg-emerald-50 transition-all",
                  isScrolled ? "text-slate-700" : "text-emerald-900"
                )}>
                  Login
                </Button>
              </Link>

              <Link to="/contact">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] font-black px-8 h-12 rounded-xl transition-all hover:-translate-y-1 active:scale-95 border-b-4 border-emerald-800"
                >
                  Free Trial Class
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "lg:hidden p-3 rounded-xl transition-all duration-300",
                isScrolled ? "bg-slate-50 text-slate-800" : "bg-white/50 backdrop-blur-md text-emerald-900"
              )}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="lg:hidden py-6 bg-white border border-emerald-50 shadow-2xl rounded-3xl mt-2 animate-in slide-in-from-top zoom-in-95 duration-500">
              <div className="flex flex-col gap-2 px-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="py-4 text-lg font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-3 active:scale-95 transition-all border-b border-slate-50"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label === 'Holy Quran' && <BookOpen className="w-6 h-6" />}
                    {link.label}
                  </Link>
                ))}

                <div className="flex flex-col gap-4 mt-6">
                  <a
                    href="tel:+923110267879"
                    className="flex lg:hidden items-center gap-3 bg-slate-50 p-4 rounded-2xl text-slate-600 font-bold"
                  >
                    <Phone className="w-5 h-5 text-emerald-600" />
                    <span>Inquiry: +92 311 026 7879</span>
                  </a>

                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full h-14 border-slate-200 font-black rounded-2xl">
                        Login
                      </Button>
                    </Link>
                    <Link to="/contact" onClick={() => setIsOpen(false)}>
                      <Button
                        className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg"
                      >
                        Free Trial
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
