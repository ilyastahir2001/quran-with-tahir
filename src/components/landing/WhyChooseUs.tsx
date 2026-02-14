import { Badge } from '@/components/ui/badge';
import { Video, Clock, Users, Shield, Award, Headphones, BookOpen, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const reasons = [
  { icon: Video, title: 'Live 1-on-1 Classes', description: 'Real-time interactive sessions with dedicated teachers, focused entirely on your child.' },
  { icon: Clock, title: 'Flexible Scheduling', description: 'Late night or early morning - we adapt to your busy lifestyle seamlessly.' },
  { icon: Users, title: 'Male & Female Tutors', description: 'We prioritize comfort and modesty with qualified teachers of both genders.' },
  { icon: Shield, title: 'Parental Peace of Mind', description: 'Monitor classes, view recordings, and track progress through our secure portal.' },
  { icon: Award, title: 'Sanad & Ijazah', description: 'Learn from scholars with authentic chains of narration directly back to the Prophet ﷺ.' },
  { icon: Headphones, title: 'Instant WhatsApp Help', description: 'Direct access to your teacher and support team whenever you need it.' },
  { icon: BookOpen, title: 'Holistic Curriculum', description: 'Beyond reading - we teach Islamic character (Akhlaq) and essential Duaas.' },
  { icon: Sparkles, title: 'Free Assessment', description: 'Professional evaluation of your current level to create a perfect learning path.' },
];

export function WhyChooseUs() {
  return (
    <section className="py-32 relative overflow-hidden bg-white">
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[hsl(40,33%,98%)] to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[hsl(40,33%,98%)] to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex flex-col items-center gap-4">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100/50 mb-2 px-6 py-2 uppercase tracking-widest text-[10px] font-black">The Gold Standard</Badge>
            <h2 className="text-4xl sm:text-6xl font-black text-slate-800 tracking-tighter leading-tight">Why Parents <span className="gradient-text-emerald">Trust Us</span></h2>
            <div className="w-20 h-1.5 bg-gold-primary rounded-full mb-4" />
            <p className="text-lg text-slate-500 font-bold leading-relaxed">We provide the most professional and secure environment for your family to bond with the Holy Quran.</p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {reasons.map((reason, index) => (
            <motion.div key={reason.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="group relative">
              <div className="relative p-8 bg-[#fcfaf7] border border-slate-100 rounded-[2rem] group-hover:bg-white group-hover:border-emerald-100 transition-all duration-500 premium-shadow-hover h-full flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="absolute -inset-2 bg-emerald-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 bg-emerald-600 octagonal-shape flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 group-hover:rotate-[15deg] transition-transform duration-500">
                    <reason.icon className="w-9 h-9" />
                  </div>
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-4 group-hover:text-emerald-700 transition-colors">{reason.title}</h3>
                <p className="text-slate-500 text-sm font-bold leading-relaxed">{reason.description}</p>
                <div className="mt-auto pt-6 flex items-center gap-1.5 text-emerald-600/40 text-[9px] uppercase font-black tracking-widest">
                  <ShieldCheck className="w-3 h-3" />Safe &amp; Secure
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mt-32 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 via-gold-primary/20 to-emerald-600/20 rounded-[3rem] blur-2xl opacity-50" />
          <div className="relative p-10 lg:p-16 bg-islamic-green-dark rounded-[3.5rem] text-white overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute inset-0 bg-islamic-pattern opacity-[0.05] pointer-events-none" />
            <div className="relative z-10 grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-12 text-center mb-4">
                <Badge className="bg-white/10 text-white border-white/20 mb-6 px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[10px]">Global Credibility</Badge>
                <h3 className="text-3xl lg:text-5xl font-black mb-6 tracking-tight">Empowering <span className="text-gold-accent">Spiritual Growth</span> Worldwide</h3>
              </div>
              <div className="lg:col-span-12 flex flex-wrap justify-center gap-x-12 gap-y-10 lg:gap-x-24">
                {[
                  { label: 'Families Trusted', value: '2,500+', sub: 'Globally' },
                  { label: 'Scholar Rating', value: '4.9/5.0', sub: 'Verified Reviews' },
                  { label: 'Money-Back', value: '100%', sub: 'Satisfaction Guarantee' },
                  { label: 'Support 24/7', value: 'Instant', sub: 'Via WhatsApp' },
                ].map((stat, i) => (
                  <div key={i} className="text-center group/stat">
                    <div className="text-4xl lg:text-5xl font-black text-white mb-2 group-hover/stat:text-gold-accent transition-colors">{stat.value}</div>
                    <div className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">{stat.label}</div>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
