import { Badge } from '@/components/ui/badge';
import { BookOpen, GraduationCap, Star, CheckCircle, ArrowRight, Sparkles, BookCheck, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const programs = [
  {
    title: 'Noorani Qaida',
    subtitle: 'Foundation Course',
    description: 'Perfect for beginners. Master the Arabic alphabet and basic pronunciation rules in a fun, engaging way.',
    features: ['Letter Recognition', 'Basic Makharij', 'Short Vowels/Harakat', 'Connective Reading'],
    icon: Languages,
    color: 'emerald'
  },
  {
    title: 'Quran Reading',
    subtitle: 'Nazra Mastery',
    description: 'Develop fluency in reading the Holy Quran with correct Tajweed rules and beautiful rhythm.',
    features: ['Fluency Building', 'Tajweed Rules', 'Stop Symbols (Waqf)', 'Daily Recitation Practice'],
    icon: BookOpen,
    color: 'gold',
    popular: true
  },
  {
    title: 'Memorization',
    subtitle: 'Hifz Program',
    description: 'A structured approach to help you or your child memorize the Quran with a long-term retention system.',
    features: ['Juz Amma focus', 'Revision Systems', 'Individual Pace', 'Mental Discipline'],
    icon: Star,
    color: 'emerald'
  },
  {
    title: 'Islamic Studies',
    subtitle: 'Character Building',
    description: 'Essential Islamic knowledge, Duas, and character development based on Prophetic teachings.',
    features: ['Daily Adhkar', 'Basic Fiqh', 'Prophetic Stories', 'Islamic Manners (Adab)'],
    icon: GraduationCap,
    color: 'gold'
  }
];

const steps = [
  {
    id: 1,
    title: 'Free Assessment',
    description: 'Our senior scholars will evaluate your level and recommend the best path.',
    icon: BookCheck
  },
  {
    id: 2,
    title: 'Select Schedule',
    description: 'Choose timings that work for you. We adapt to your time zone 24/7.',
    icon: Star
  },
  {
    id: 3,
    title: 'Begin Learning',
    description: 'Enter your secure virtual classroom and start your spiritual journey.',
    icon: Sparkles
  }
];

export function Features() {
  return (
    <section id="features" className="py-32 bg-[hsl(35,30%,96%)] relative overflow-hidden">
      {/* Decorative Mosque Silhouette Overlay (Subtle) */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-emerald-100/50 text-emerald-800 border-emerald-200 mb-6 px-6 py-2 font-black uppercase tracking-widest text-[10px]">
              Our Professional Programs
            </Badge>
            <h2 className="text-4xl lg:text-7xl font-black text-emerald-950 mb-8 tracking-tighter">
              A Plan For <span className="text-emerald-600">Every Student</span>
            </h2>
            <p className="text-xl text-stone-600 font-bold max-w-2xl mx-auto leading-relaxed">
              Tailored learning paths designed by world-class educators to ensure effective results for all ages.
            </p>
          </motion.div>
        </div>

        {/* Programs Grid - Mihrab Top Arches */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {programs.map((program, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative group h-full"
            >
              {program.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 w-max">
                  <Badge className="bg-gold-accent text-emerald-950 border-4 border-[hsl(35,30%,96%)] px-4 py-1 text-[10px] font-black uppercase tracking-wider shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="relative bg-white pt-12 pb-10 px-6 rounded-b-[2.5rem] islam-arched-full border border-amber-100/50 shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full">
                {/* Header Arch Style */}
                <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-emerald-500/10 via-gold-accent/10 to-emerald-500/10 rounded-t-full" />

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-2xl ${program.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-gold-accent'} group-hover:scale-110 transition-transform`}>
                    <program.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-emerald-950 mb-2">{program.title}</h3>
                  <div className={`text-[10px] font-black uppercase tracking-widest ${program.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {program.subtitle}
                  </div>
                </div>

                <p className="text-stone-500 leading-relaxed text-sm font-bold text-center mb-8">
                  {program.description}
                </p>

                <div className="space-y-4 mb-10 flex-grow">
                  {program.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-xs font-bold text-stone-600 text-left leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>

                <Button className="mt-auto w-full group-hover:bg-emerald-600 group-hover:text-white transition-colors font-black h-12 rounded-xl border-emerald-100 text-emerald-900" variant="outline">
                  Learn More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* The 3-Step Journey Redesigned */}
        <div className="relative pt-24 pb-20 px-8 lg:px-20 bg-emerald-900 rounded-[3rem] overflow-hidden shadow-2xl border border-emerald-800">
          <div className="absolute inset-0 bg-islamic-pattern opacity-[0.05] pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-20">
              <Badge className="bg-white/10 text-emerald-100 mb-6 px-4 py-1.5 font-black uppercase tracking-[0.2em] text-[10px] border border-white/10">
                Smooth Professional Process
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                3 Steps to <span className="text-gold-accent">Excellence</span>
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-16">
              {steps.map((step, idx) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  {/* Connector - Enhanced */}
                  {step.id < 3 && (
                    <div className="hidden lg:block absolute top-12 left-[80%] w-[40%] h-0.5 border-t border-dashed border-emerald-700 z-0" />
                  )}

                  <div className="w-24 h-24 relative mb-8">
                    <div className="absolute inset-0 bg-gold-accent/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative w-full h-full bg-emerald-800/50 backdrop-blur-xl border border-emerald-700 rounded-[2rem] flex items-center justify-center group-hover:bg-gold-accent group-hover:border-gold-accent transition-all duration-500 transform group-hover:-rotate-6 shadow-inner">
                      <step.icon className="w-10 h-10 text-gold-accent group-hover:text-emerald-900" />
                      <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-white text-emerald-900 rounded-full flex items-center justify-center font-black text-xl shadow-xl border-4 border-emerald-900">
                        {step.id}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-3">{step.title}</h3>
                  <p className="text-emerald-100/70 text-sm font-semibold leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}