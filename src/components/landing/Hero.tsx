import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShieldCheck, Lock, Users, Phone, Mail, ArrowRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-[hsl(var(--islamic-blue-dark))]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-10 pointer-events-none" />

      {/* Decorative Orbs */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-gold-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-islamic-blue-main/20 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2"
            >
              <Badge className="bg-gold-primary/20 text-gold-accent border-gold-primary/30 px-4 py-1.5 hover:bg-gold-primary/30 font-bold">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Trusted by 2500+ Active Students Globally
              </Badge>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter"
              >
                Master the <span className="text-gold-accent">Holy Quran</span>
                <br />
                <span className="text-4xl lg:text-6xl opacity-90 font-bold mt-2 inline-block">With Expert Guidance.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg lg:text-xl text-blue-100/80 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Personalized <span className="text-white font-bold border-b-2 border-gold-accent/40">One-on-One sessions</span> with certified scholars.
                Experience the most secure and effective way to learn Quran online from the comfort of your home.
              </motion.p>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center lg:justify-start gap-3"
            >
              {[
                { icon: ShieldCheck, text: "Background Checked Tutors" },
                { icon: Lock, text: "Privacy Protected Lessons" },
                { icon: Users, text: "Male/Female Qualified Teachers" }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm backdrop-blur-md">
                  <feature.icon className="w-4 h-4 text-gold-accent" />
                  {feature.text}
                </div>
              ))}
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-12 py-8 border-y border-white/10 max-w-xl"
            >
              <div className="text-center lg:text-left">
                <div className="text-4xl font-black text-gold-accent">1000+</div>
                <p className="text-[10px] text-blue-100/60 font-black uppercase tracking-[0.2em]">Verified Students</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-4xl font-black text-gold-accent">50+</div>
                <p className="text-[10px] text-blue-100/60 font-black uppercase tracking-[0.2em]">Expert Scholars</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-gold-accent fill-gold-accent" />
                  <span className="text-4xl font-black text-gold-accent">4.9</span>
                </div>
                <p className="text-[10px] text-blue-100/60 font-black uppercase tracking-[0.2em]">Parent Rating</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Registration Form (Premium Islamic Arched) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative lg:ml-auto w-full max-w-md"
          >
            {/* Decorative blobs behind form */}
            <div className="absolute -inset-4 bg-gradient-to-r from-gold-primary to-gold-accent rounded-[2rem] opacity-20 blur-2xl -z-10" />

            <Card className="border-0 shadow-2xl bg-white overflow-hidden rounded-[2rem] islamic-arched relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gold-primary via-gold-accent to-gold-primary" />

              <CardContent className="p-8 space-y-6 pt-12">
                <div className="text-center space-y-2">
                  <Badge variant="outline" className="border-gold-primary/20 bg-gold-primary/5 text-gold-primary px-4 py-1 font-black">
                    LIMITED SLOTS AVAILABLE
                  </Badge>
                  <h3 className="text-3xl font-black text-slate-900">
                    Start Your <span className="text-gold-accent uppercase">Free</span><br />Week Trial
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">Experience professional Quranic education locally.</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Student Name</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                      <input
                        type="text"
                        placeholder="e.g. Yusuf Abdullah"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-gold-primary focus:ring-0 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                        <input
                          type="tel"
                          placeholder="+92..."
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-gold-primary focus:ring-0 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 ml-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-300" />
                        <input
                          type="email"
                          placeholder="Email"
                          className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-gold-primary focus:ring-0 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  <Button size="lg" className="w-full h-14 text-lg font-black rounded-xl shadow-lg bg-[hsl(var(--islamic-blue-main))] hover:bg-[hsl(var(--islamic-blue-dark))] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <Lock className="w-3 h-3" />
                    No credit card required
                  </div>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-gold-primary font-black text-xs hover:scale-105 transition-transform cursor-pointer">
                    <div className="w-7 h-7 rounded-full bg-gold-primary/10 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span>Direct Support: +92 311 026 7879</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-gold-accent text-white p-4 rounded-2xl shadow-xl border-4 border-white flex items-center gap-3 animate-bounce">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-6 h-6 fill-white" />
              </div>
              <div className="pr-2">
                <p className="font-black text-lg leading-none">4.9/5</p>
                <p className="text-[8px] font-black uppercase tracking-tighter opacity-90">Parent Rating</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
