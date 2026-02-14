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
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold">Quran With Tahir</span>
                <p className="text-sm text-slate-400">Quran with Tahir</p>
              </div>
            </Link>
            <p className="text-slate-400 max-w-sm">
              Providing authentic Quran education to Muslim families worldwide. 
              Our certified teachers help students of all ages connect with the Holy Quran.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="tel:+923110267879"
                className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>+92 311 026 7879</span>
              </a>
              <a
                href="mailto:ilyastahir2001@gmail.com"
                className="flex items-center gap-3 text-slate-400 hover:text-emerald-400 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>ilyastahir2001@gmail.com</span>
              </a>
              <div className="flex items-center gap-3 text-slate-400">
                <MapPin className="w-5 h-5" />
                <span>Serving USA, UK, Australia & Europe</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Courses</h3>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors text-left"
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
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Quran With Tahir. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm">
              Made with ❤️ for the Muslim Ummah
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
