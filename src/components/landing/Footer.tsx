import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';

const footerLinks = {
  courses: [
    { label: 'Quran Reading', href: '#features' },
    { label: 'Tajweed Course', href: '#features' },
    { label: 'Hifz Program', href: '#features' },
    { label: 'Arabic Language', href: '#features' },
    { label: 'Islamic Studies', href: '#features' },
    { label: 'Ijazah Program', href: '#features' },
  ],
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Teachers', href: '#about' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Contact', href: '#contact' },
  ],
  support: [
    { label: 'FAQs', href: '#' },
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: MessageCircle, href: 'https://wa.me/923110267879', label: 'WhatsApp' },
];

export function Footer() {
  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-[hsl(var(--islamic-blue-dark))] text-white relative overflow-hidden">
      {/* Mosaic Overlay */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-5" />

      {/* Mosque Silhouette at Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-10 pointer-events-none z-0">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
          <path fill="#ffffff" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,218.7C672,224,768,224,864,202.7C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          {/* Simple Mosque Shapes */}
          <rect x="200" y="240" width="100" height="80" fill="white" />
          <path d="M200,240 Q250,180 300,240" fill="white" />
          <rect x="245" y="150" width="10" height="100" fill="white" />
          <circle cx="250" cy="140" r="10" fill="white" />

          <rect x="1100" y="220" width="120" height="100" fill="white" />
          <path d="M1100,220 Q1160,140 1220,220" fill="white" />
          <rect x="1155" y="100" width="10" height="150" fill="white" />
          <circle cx="1160" cy="90" r="10" fill="white" />
        </svg>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 pt-20 pb-24 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-16">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gold-primary flex items-center justify-center shadow-lg transform -rotate-3">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-black tracking-tight text-white">Quran With <span className="text-gold-accent">Tahir</span></span>
                </div>
              </div>
              <p className="text-blue-100/60 text-lg max-w-sm mt-4 leading-relaxed">
                Empowering the next generation with authentic Quranic wisdom and spiritual excellence.
              </p>
            </Link>

            {/* Contact Info */}
            <div className="space-y-4 pt-4">
              <a
                href="tel:+923110267879"
                className="flex items-center gap-4 text-blue-100/70 hover:text-gold-accent transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-primary/20">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="font-bold">+92 311 026 7879</span>
              </a>
              <a
                href="mailto:ilyastahir2001@gmail.com"
                className="flex items-center gap-4 text-blue-100/70 hover:text-gold-accent transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold-primary/20">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="font-bold">ilyastahir2001@gmail.com</span>
              </a>
              <div className="flex items-center gap-4 text-blue-100/70">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-medium">Global Support (USA, UK, AU, EU)</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-white/5 backdrop-blur-md flex items-center justify-center hover:bg-gold-primary hover:text-white hover:-translate-y-1 transition-all border border-white/10"
                  aria-label={social.label}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div className="lg:pt-4">
            <h3 className="font-black text-xl mb-8 text-gold-accent flex items-center gap-2">
              <span className="w-2 h-2 bg-gold-primary rounded-full"></span>
              Courses
            </h3>
            <ul className="space-y-4">
              {footerLinks.courses.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-blue-100/60 hover:text-gold-accent transition-all text-left font-medium hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:pt-4">
            <h3 className="font-black text-xl mb-8 text-gold-accent flex items-center gap-2">
              <span className="w-2 h-2 bg-gold-primary rounded-full"></span>
              Company
            </h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-blue-100/60 hover:text-gold-accent transition-all text-left font-medium hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:pt-4">
            <h3 className="font-black text-xl mb-8 text-gold-accent flex items-center gap-2">
              <span className="w-2 h-2 bg-gold-primary rounded-full"></span>
              Support
            </h3>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-blue-100/60 hover:text-gold-accent transition-all text-left font-medium hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 relative z-10 bg-black/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-blue-100/40 text-sm font-medium">
              © {new Date().getFullYear()} Quran With Tahir. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10">
              <p className="text-blue-100/40 text-xs font-bold uppercase tracking-widest">
                Made with <span className="text-rose-500 animate-pulse">❤️</span> for the Ummah
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
