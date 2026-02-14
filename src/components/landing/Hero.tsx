import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, CheckCircle2, Phone, Globe, ShieldCheck, Lock, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative min-h-screen flex items-center pt-28 lg:pt-32 pb-20 overflow-hidden bg-[hsl(40,33%,98%)]">
      {/* Premium Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-x-0 top-0 h-[80vh] bg-gradient-to-b from-emerald-50/50 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 w-2/3 h-full opacity-[0.08] bg-no-repeat bg-right-top bg-contain lg:bg-auto pointer-events-none grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1591604129939-f1efa4d8f7ec?auto=format&fit=crop&q=80&w=2070')`, maskImage: 'radial-gradient(circle at 70% 30%, black 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(circle at 70% 30%, black 0%, transparent 70%)' }} />
        <div className="absolute inset-0 bg-islamic-pattern opacity-[0.04] pointer-events-none" />
      </div>

      {/* Floating Decorative Elements */}
      <motion.div animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[5%] top-[20%] w-32 h-32 bg-gold-primary/5 rounded-full blur-3xl" />
      <motion.div animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute right-[10%] bottom-[15%] w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column: Content */}
          <div className="lg:col-span-7 space-y-10">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
              <Badge className="bg-white/80 backdrop-blur-md text-emerald-700 border-emerald-100/50 px-5 py-2 hover:bg-white flex w-fit items-center gap-2.5 shadow-sm premium-shadow-hover cursor-default">
                <Globe className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="font-black tracking-tight">Trusted by 2500+ Active Students Globally</span>
              </Badge>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-[5.5rem] font-black leading-[1] text-slate-900 tracking-tighter">
                  Master the <span className="gradient-text-emerald">Holy Quran</span>
                  <br />
                  <span className="text-slate-800 text-4xl lg:text-6xl tracking-tight">With Expert Guidance.</span>
                </h1>

                <p className="text-lg lg:text-xl text-slate-600 max-w-2xl leading-relaxed font-semibold">
                  Personalized <span className="text-emerald-700 underline decoration-gold-primary/40 decoration-wavy underline-offset-8">One-on-One sessions</span> with certified scholars.
                  Experience the most secure and effective way to learn Quran online.
                </p>
              </div>
            </motion.div>

            {/* Feature Pills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-wrap gap-4">
              {[
                { icon: ShieldCheck, text: "Background Checked Tutors", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Lock, text: "Privacy Protected Lessons", color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: Users, text: "Male/Female Qualified Teachers", color: "text-gold-primary", bg: "bg-orange-50" }
              ].map((item, idx) => (
                <div key={idx} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-transparent hover:border-slate-200 hover:bg-white transition-all duration-300 shadow-sm font-bold text-sm ${item.bg} ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                  {item.text}
                </div>
              ))}
            </motion.div>

            {/* Trust Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-wrap gap-8 items-center pt-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm shadow-emerald-500/5">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden ring-4 ring-emerald-50/50">
                      <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="Student" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 font-black text-slate-800 text-sm">
                    <Star className="w-4 h-4 text-gold-accent fill-gold-accent" />
                    4.9/5 Rating
                  </div>
                  <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">Join 5000+ Happy Learners</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-gold-primary" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-800">Ijazah Certified</div>
                  <div className="text-xs font-bold text-slate-500">Traditional Authenticity</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium Secure Form */}
          <motion.div initial={{ opacity: 0, scale: 0.95, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-5 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-gold-primary/20 to-emerald-500/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />

            <div className="relative bg-white/95 backdrop-blur-xl rounded-[3rem] p-8 lg:p-12 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden">
              <div className="absolute top-0 inset-x-0 py-1.5 bg-emerald-600/5 flex items-center justify-center gap-2">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-800/60">End-to-End Encrypted Secure Registration</span>
              </div>

              <div className="relative z-10 pt-4">
                <div className="text-center mb-8">
                  <div className="inline-block px-3 py-1 bg-gold-primary/10 text-gold-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-gold-primary/10">Limited Slots Available</div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tight">Start Your <span className="text-emerald-600">Free</span><br />07 Days Trial</h2>
                  <p className="text-slate-500 text-sm font-bold mt-4">Experience personalized learning before you commit.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Full Name</label>
                    <div className="relative">
                      <Input placeholder="e.g. Yusuf Abdullah" className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all rounded-2xl font-bold pr-10" required />
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp No.</label>
                      <Input placeholder="+92..." className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white rounded-2xl font-bold" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Parent Email</label>
                      <Input placeholder="yours@email.com" type="email" className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white rounded-2xl font-bold" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Level</label>
                    <select className="flex h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white text-slate-800 font-bold appearance-none">
                      <option value="">Choose Learning Path</option>
                      <option value="beginner">Noorani Qaida (Beginner)</option>
                      <option value="nazra">Nazra Quran (Fluency)</option>
                      <option value="hifz">Hifz-e-Quran (Memorization)</option>
                      <option value="tajweed">Advanced Tajweed &amp; Makhraj</option>
                    </select>
                  </div>

                  <Button type="submit" className="w-full h-16 text-lg font-black bg-islamic-green-main hover:bg-slate-900 text-white shadow-xl shadow-emerald-500/20 rounded-[1.25rem] transition-all transform hover:-translate-y-1 active:scale-95 mt-4">Get My Free Trial Now</Button>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <div className="flex -space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <Lock className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">No Credit Card Required</span>
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-xs group cursor-pointer hover:scale-105 transition-transform">
                    <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Phone className="w-3 h-3" />
                    </div>
                    <span>Direct Support: +92 311 026 7879</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
