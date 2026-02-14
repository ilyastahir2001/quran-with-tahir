import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, Star, ShieldCheck, Lock, Globe, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    price: '$30',
    frequency: 'Month',
    features: ['2 Classes per week', '30 Minutes duration', 'Certified Tutors', 'Basic Progress Report'],
    popular: false,
    color: 'emerald'
  },
  {
    name: 'Recommended',
    price: '$50',
    frequency: 'Month',
    features: ['3 Classes per week', '30 Minutes duration', 'Senior Scholars', 'Weekly Progress Report', 'Offline Hifz Support'],
    popular: true,
    color: 'gold'
  },
  {
    name: 'Intensive',
    price: '$80',
    frequency: 'Month',
    features: ['5 Classes per week', '45 Minutes duration', 'Ijazah Certified Tutors', '24/7 Support Access', 'Detailed Analysis'],
    popular: false,
    color: 'emerald'
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[hsl(35,30%,96%)] relative overflow-hidden">
      <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge className="bg-emerald-100 text-emerald-800 border-none mb-4 px-6 py-2 font-black uppercase tracking-widest text-[10px]">
            Affordable Excellence
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-black text-emerald-950 mb-6 tracking-tight">
            Simple, Transparent <span className="text-emerald-600">Pricing</span>
          </h2>
          <p className="text-xl text-stone-600 font-bold max-w-2xl mx-auto leading-relaxed">
            Invest in your spiritual future with plans designed for every family budget.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`relative ${plan.popular ? 'md:-mt-8 md:-mb-8 z-10' : 'z-0'}`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 flex justify-center z-20">
                  <Badge className="bg-gold-accent text-emerald-950 border-4 border-[hsl(35,30%,96%)] px-6 py-1.5 text-xs font-black uppercase tracking-wider shadow-lg">
                    Most Parents Choose This
                  </Badge>
                </div>
              )}

              <Card className={`h-full border-0 relative overflow-hidden flex flex-col ${plan.popular
                  ? 'shadow-2xl scale-105 bg-white ring-4 ring-gold-accent/20'
                  : 'shadow-lg bg-white/60 backdrop-blur-sm hover:bg-white transition-colors'
                }`}>
                {/* Header Pattern */}
                <div className={`absolute top-0 inset-x-0 h-2 ${plan.popular ? 'bg-gold-accent' : 'bg-emerald-600'}`} />

                <CardContent className="p-8 pb-0 flex-grow text-center">
                  <h3 className="text-xl font-black text-emerald-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-6">
                    <span className={`text-5xl font-black tracking-tight ${plan.popular ? 'text-emerald-950' : 'text-emerald-800'}`}>{plan.price}</span>
                    <span className="text-sm font-bold text-stone-400">/{plan.frequency}</span>
                  </div>

                  <div className="space-y-4 text-left">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 group">
                        <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.popular ? 'text-gold-accent' : 'text-emerald-500 group-hover:text-emerald-600'}`} />
                        <span className={`text-sm font-bold ${plan.popular ? 'text-slate-700' : 'text-slate-500'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-8 mt-auto">
                  <Button
                    className={`w-full h-12 text-sm font-black rounded-xl shadow-lg transition-all ${plan.popular
                        ? 'bg-gold-accent hover:bg-amber-400 text-emerald-950 hover:scale-[1.02]'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                  >
                    Get Started
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Guarantee Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto text-center bg-white rounded-3xl p-8 border border-emerald-100 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-gold-accent to-emerald-400" />
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="text-left">
              <h4 className="text-xl font-black text-emerald-950 mb-1">100% Satisfaction Guarantee</h4>
              <p className="text-stone-500 text-sm font-medium">If you are not satisfied with your first week of classes, we will refund your fee. No questions asked.</p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}