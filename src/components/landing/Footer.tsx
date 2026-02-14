import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="bg-emerald-950 text-emerald-100 pt-20 pb-10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-accent rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gold-accent rounded-lg flex items-center justify-center">
                <span className="text-emerald-950 font-black text-xl">QT</span>
              </div>
              <span className="text-2xl font-black text-white tracking-tight">Quran With Tahir</span>
            </div>
            <p className="text-emerald-200/80 leading-relaxed text-sm">
              Connecting hearts to the Holy Quran through expert online education. Join our global community of learners today.
            </p>
            <div className="flex gap-4">
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center hover:bg-gold-accent hover:text-emerald-950 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center hover:bg-gold-accent hover:text-emerald-950 transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center hover:bg-gold-accent hover:text-emerald-950 transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'About Us', 'Courses', 'Pricing', 'Teachers'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-emerald-200/80 hover:text-gold-accent transition-colors text-sm font-medium flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 group-hover:bg-gold-accent transition-colors" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-black text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-accent flex-shrink-0 mt-1" />
                <span className="text-emerald-200/80 text-sm">123 Islamic Center Drive,<br />London, UK</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-accent flex-shrink-0" />
                <span className="text-emerald-200/80 text-sm">+92 311 026 7879</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-accent flex-shrink-0" />
                <span className="text-emerald-200/80 text-sm">support@quranwithtahir.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-black text-lg mb-6">Newsletter</h4>
            <p className="text-emerald-200/80 text-sm mb-4">Subscribe to receive updates and free Islamic resources.</p>
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-emerald-900/50 border-emerald-800 text-white placeholder:text-emerald-600 focus:border-gold-accent rounded-xl"
              />
              <Button className="w-full bg-gold-accent text-emerald-950 hover:bg-white font-black rounded-xl">
                Subscribe
              </Button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-emerald-400/60 text-xs font-medium">
            © 2024 Quran With Tahir. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs font-medium text-emerald-400/60">
            <a href="#" className="hover:text-gold-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gold-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}