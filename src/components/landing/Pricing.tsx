import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, Star, ShieldCheck, Lock, Globe, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Introductory',
    description: 'Perfect for trial & assessment',
    price: 30,
    duration: '/month',
    sessions: '4 Classes',
    perWeek: '1 class / week',
    features: [
      '30-minute 1-on-1 sessions',
      'Foundation & Noorani Qaida',
      'Basic Tajweed Assessment',
      'Parent Progress Dashboard',
      'Digital Certificate of Effort',
    ],
    popular: false,
    cta: 'Choose Introductory',
  },
  {
    name: 'Progressive',
    description: 'Most popular for consistent growth',
    price: 55,
    duration: '/month',
    sessions: '8 Classes',
    perWeek: '2 classes / week',
    features: [
      '30-minute 1-on-1 sessions',
      'All Course Access',
      'Weekly Detail Reports',
      'Lesson Recordings Access',
      'Priority Support Support',
      '2 Monthly Makeup Classes',
    ],
    popular: true,
    cta: 'Choose Progressive',
  },
  {
    name: 'Elite Learning',
    description: 'For rapid Hifz & Fluency',
    price: 95,
    duration: '/month',
    sessions: '12 Classes',
    perWeek: '3 classes / week',
    features: [
      '30-minute 1-on-1 sessions',
      'Advanced Tajweed Mastery',
      'Dedicated Revision Expert',
      '24/7 Teacher Access',
      'Unlimited Makeup Classes',
      'Monthly Scholar Meetup',
    ],
    popular: false,
    cta: 'Choose Elite',
  },
  {
    name: 'Hifz Intensive',
    description: 'Full Quran Memorization',
    price: 150,
    duration: '/month',
    sessions: '20 Classes',
    perWeek: '5 classes / week',
    features: [
      '45-minute deep focus sessions',
      'Sanad/Ijazah Certified Path',
      'Psychological Hifz Support',
      'Custom Revision Strategy',
      'Yearly Assessment Panel',
      'Final Graduation Sanad',
    ],
    popular: false,
    cta: 'Start Hifz Journey',
  },
];

export function Pricing() {
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-32 bg-white relative overflow-hidden">
      {/* Premium Overlays */}
      <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-emerald-50/30 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-gold-primary/10 text-gold-primary border-gold-primary/20 mb-6 px-6 py-2 font-black uppercase tracking-widest text-[10px]">
              Simple Transparent Pricing
            </Badge>
            <h2 className="text-4xl lg:text-7xl font-black text-slate-800 mb-8 tracking-tighter">
              Invest in Eternal <span className="gradient-text-emerald">Knowledge</span>
            </h2>
            <div className="flex items-center justify-center gap-4 text-slate-400 mb-8">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                <Lock className="w-3.5 h-3.5" />
                No Hidden Fees
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                Cancel Anytime
              </div>
            </div>
            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
              Premium 1-on-1 Quran education that fits your budget. Every plan starts with a 7-day free trial.
            </p>
          </motion.div>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex"
            >
              <Card
                className={`relative overflow-hidden transition-all duration-500 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.12)] flex flex-col w-full ${plan.popular
                    ? 'border-[3px] border-emerald-500 shadow-2xl scale-105 z-10'
                    : 'border border-slate-100 shadow-sm'
                  } rounded-[3rem] group bg-white`}
              >
                {/* Header Arch Style */}
                <div className={`pt-14 pb-10 px-8 text-center relative overflow-hidden ${plan.popular ? 'bg-islamic-green-dark text-white' : 'bg-[#fcfaf7] text-slate-800'
                  } islam-arched-full`}>
                  {plan.popular && (
                    <div className="absolute top-4 inset-x-0 flex justify-center">
                      <Badge className="bg-gold-primary text-white border-4 border-islamic-green-dark px-4 py-0.5 text-[8px] font-black uppercase tracking-widest">
                        Recommended
                      </Badge>
                    </div>
                  )}
                  <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                  <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${plan.popular ? 'text-emerald-400' : 'text-slate-400'
                    }`}>
                    {plan.perWeek}
                  </div>
                </div>

                <CardContent className="space-y-8 pt-12 flex-grow px-8 text-center">
                  <div className="relative inline-block">
                    <div className="flex items-start justify-center text-slate-900">
                      <span className="text-xl font-black mt-2 opacity-30">$</span>
                      <span className="text-7xl font-black tracking-tighter leading-none">{plan.price}</span>
                      <div className="flex flex-col items-start ml-1 mt-1">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">/USD</span>
                        <span className="text-[10px] font-bold text-slate-400">Monthly</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none font-black px-4 py-1 h-8 rounded-full">
                      {plan.sessions} Total Sessions
                    </Badge>
                  </div>

                  <ul className="space-y-4 pt-4">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        </div>
                        <span className="text-xs text-slate-600 font-bold text-left leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pb-12 pt-6 px-8">
                  <Button
                    onClick={scrollToContact}
                    className={`w-full h-16 text-lg font-black transition-all duration-500 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:scale-95 ${plan.popular
                        ? 'bg-islamic-green-main hover:bg-slate-900 text-white shadow-emerald-500/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50/50'
                      }`}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Global Security & Trust Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-32 relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-gold-primary/10 to-emerald-500/10 rounded-[3.5rem] blur-2xl opacity-50" />

          <div className="relative p-12 lg:p-20 bg-islamic-green-dark rounded-[4rem] overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute inset-0 bg-islamic-pattern opacity-[0.05]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="flex flex-col md:flex-row items-center gap-10 text-center md:text-left">
                <div className="w-28 h-28 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl flex items-center justify-center border border-white/20 shadow-[-20px_20px_60px_rgba(0,0,0,0.3)] transform rotate-3 hover:rotate-0 transition-transform duration-700">
                  <ShieldCheck className="w-14 h-14 text-gold-accent" />
                </div>
                <div>
                  <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tighter mb-4">
                    100% Satisfaction <span className="text-gold-accent">Guarantee</span>
                  </h3>
                  <p className="text-white/60 max-w-xl text-lg font-bold leading-relaxed">
                    Not satisfied with your first 2 lessons? We will refund your entire payment immediately, no questions asked. Your trust is our priority.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={scrollToContact}
                  className="h-16 px-12 bg-gold-primary hover:bg-white hover:text-emerald-950 text-white font-black text-xl rounded-2xl transition-all transform hover:scale-105 shadow-[0_20px_50px_rgba(217,119,6,0.3)]"
                >
                  Book 07 Days Free Trial
                </Button>
                <div className="flex items-center gap-2 text-white/40 text-[10px] uppercase font-black tracking-widest">
                  <Globe className="w-3.5 h-3.5" />
                  Secured by International Payment Gateways
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
