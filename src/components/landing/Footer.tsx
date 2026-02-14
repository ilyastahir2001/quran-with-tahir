import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin, Facebook, Instagram, Youtube, MessageCircle, ShieldCheck, Award, Globe, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const footerLinks = {
  courses: [
    { label: 'Noorani Qaida', href: '#features' },
    { label: 'Quran Reading', href: '#features' },
    { label: 'Hifz Program', href: '#features' },
    { label: 'Arabic Language', href: '#features' },
    { label: 'Islamic Studies', href: '#features' },
    { label: 'Ijazah Track', href: '#features' },
  ],
  company: [
    { label: 'About Our Vision', href: '#about' },
    { label: 'Verified Teachers', href: '#about' },
    { label: 'Parent Reviews', href: '#testimonials' },
    { label: 'Fee Structure', href: '#pricing' },
    { label: 'Contact Support', href: '#contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Study', href: '#' },
    { label: 'Refund Policy', href: '#' },
    { label: 'Safeguarding', href: '#' },
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
    <footer className="bg-islamic-green-dark text-white relative overflow-hidden">
      {/* Premium Decorative Overlays */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent opacity-10" />
      <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />

      {/* Dynamic Mosque Silhouette (Multi-layered for depth) */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] pointer-events-none z-0 overflow-hidden">
        <svg viewBox="0 0 1440 320" className="absolute bottom-0 w-full opacity-10" preserveAspectRatio="none">
          <path fill="#ffffff" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,218.7C672,224,768,224,864,202.7C960,181,1056,139,1152,138.7C1248,139,1344,181,1392,202.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        <div className="absolute bottom-0 left-[10%] w-[120px] h-[200px] bg-white opacity-[0.05] rounded-t-full" />
        <div className="absolute bottom-0 right-[15%] w-[150px] h-[250px] bg-white opacity-[0.05] rounded-t-full" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-24 relative z-10">

        {/* Credibility Row - High Trust Partners/Certs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-20 border-b border-white/5 mb-20 text-center">
          {[
            { icon: ShieldCheck, text: 'Background Verified' },
            { icon: Award, text: 'Ijazah Certified' },
            { icon: Globe, text: '24/7 Global Access' },
            { icon: Heart, text: 'Child Safeguarding' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-3 group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-gold-primary transition-colors">
                <item.icon className="w-6 h-6 text-gold-accent group-hover:text-white" />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest text-emerald-100/60 group-hover:text-white">
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24">

          {/* Brand & Mission */}
          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform">
                  <BookOpen className="w-10 h-10 text-gold-accent" />
                </div>
                <div>
                  <h3 className="text-3xl font-black tracking-tighter text-white">
                    Quran With <span className="text-gold-accent">Tahir</span>
                  </h3>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Academy Excellence</div>
                </div>
              </Link>
              <p className="text-emerald-100/60 text-lg font-bold leading-relaxed max-w-sm">
                Dedicated to providing the most professional and secure online Quran learning platform for the global Muslim community.
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              <a href="tel:+923110267879" className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-gold-primary transition-all group">
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-gold-accent group-hover:text-white" />
                  <div>
                    <div className="text-[9px] font-black uppercase text-emerald-100/40">Direct Call</div>
                    <div className="text-sm font-black">+92 311 026 7879</div>
                  </div>
                </div>
              </a>
              <a href="mailto:ilyastahir2001@gmail.com" className="p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-gold-primary transition-all group">
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-gold-accent group-hover:text-white" />
                  <div>
                    <div className="text-[9px] font-black uppercase text-emerald-100/40">Email Support</div>
                    <div className="text-sm font-black">ilyastahir2001@gmail.com</div>
                  </div>
                </div>
              </a>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3 pl-2">
              <div className="relative">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute" />
                <div className="w-3 h-3 bg-emerald-500 rounded-full relative" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Tutors Online Now</span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h4 className="text-gold-accent font-black uppercase tracking-widest text-xs mb-8">Programs</h4>
              <ul className="space-y-4">
                {footerLinks.courses.map((link) => (
                  <li key={link.label}>
                    <button onClick={() => scrollToSection(link.href)} className="text-sm font-bold text-emerald-100/60 hover:text-white hover:translate-x-1 transition-all">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-gold-accent font-black uppercase tracking-widest text-xs mb-8">Academy</h4>
              <ul className="space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <button onClick={() => scrollToSection(link.href)} className="text-sm font-bold text-emerald-100/60 hover:text-white hover:translate-x-1 transition-all text-left">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h4 className="text-gold-accent font-black uppercase tracking-widest text-xs mb-8">Social Connect</h4>
              <div className="flex gap-4 mb-10">
                {socialLinks.map((social) => (
                  <a key={social.label} href={social.href} aria-label={social.label} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-gold-primary hover:text-white transition-all border border-white/5">
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
              <h4 className="text-gold-accent font-black uppercase tracking-widest text-xs mb-6">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <button className="text-[10px] font-black uppercase tracking-widest text-emerald-100/30 hover:text-white transition-colors">
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Final Bottom Bar */}
      <div className="relative z-10 border-t border-white/5 bg-black/10">
        <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-emerald-100/20 text-[10px] font-black uppercase tracking-widest">
            © {new Date().getFullYear()} Quran With Tahir. Developed with spiritual excellence.
          </p>
          <div className="flex items-center gap-1.5 px-6 py-2 bg-white/5 rounded-full border border-white/10">
            <Heart className="w-3 h-3 text-gold-accent fill-gold-accent" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100/40">Serving the Global Ummah</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
