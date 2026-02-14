import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, BookOpen, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/holy-quran', label: 'Holy Quran', isExternal: true },
  { href: '#features', label: 'Programs' },
  { href: '#about', label: 'About Us' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
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

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg border-b'
          : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group transition-all duration-300">
            <img 
              src="/logo.png" 
              alt="Quran With Tahir" 
              className="h-16 md:h-20 w-auto object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500 animate-in fade-in zoom-in duration-1000" 
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isExternal ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm font-medium text-foreground/80 hover:text-emerald-600 transition-colors"
                >
                  {link.label}
                </button>
              )
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+923110267879"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>+92 311 026 7879</span>
            </a>
            <Link to="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Button
              onClick={() => scrollToSection('#contact')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg"
            >
              Free Trial Class
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t bg-background/95 backdrop-blur-md">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                link.isExternal ? (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="py-3 text-lg font-bold text-emerald-600 border-b border-border flex items-center gap-3"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpen className="w-5 h-5" />
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-left py-2 text-foreground/80 hover:text-emerald-600 transition-colors"
                  >
                    {link.label}
                  </button>
                )
              ))}
              <div className="flex flex-col gap-3 pt-4 border-t">
                <a
                  href="tel:+923110267879"
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Phone className="w-4 h-4" />
                  <span>+92 311 026 7879</span>
                </a>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Button
                  onClick={() => scrollToSection('#contact')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
                >
                  Free Trial Class
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
