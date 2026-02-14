import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, Star, Zap } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for trying out our services',
    price: 30,
    duration: '/month',
    sessions: '4 Classes',
    perWeek: '1 class/week',
    features: [
      '30-minute sessions',
      'Quran reading basics',
      'Progress tracking',
      'Parent dashboard access',
      'Email support',
    ],
    popular: false,
    cta: 'Start Learning',
  },
  {
    name: 'Standard',
    description: 'Most popular for consistent progress',
    price: 50,
    duration: '/month',
    sessions: '8 Classes',
    perWeek: '2 classes/week',
    features: [
      '30-minute sessions',
      'All course options',
      'Weekly progress reports',
      'Class recordings',
      'WhatsApp support',
      'Makeup classes',
    ],
    popular: true,
    cta: 'Get Started',
  },
  {
    name: 'Intensive',
    description: 'For serious learners & Hifz students',
    price: 90,
    duration: '/month',
    sessions: '16 Classes',
    perWeek: '4 classes/week',
    features: [
      '30-minute sessions',
      'All courses included',
      'Daily progress updates',
      'Priority scheduling',
      '24/7 WhatsApp support',
      'Unlimited makeup classes',
      'Monthly parent meetings',
    ],
    popular: false,
    cta: 'Enroll Now',
  },
  {
    name: 'Hifz Program',
    description: 'Complete Quran memorization',
    price: 120,
    duration: '/month',
    sessions: '20 Classes',
    perWeek: '5 classes/week',
    features: [
      '45-minute sessions',
      'Dedicated Hifz teacher',
      'Personalized memorization plan',
      'Daily revision sessions',
      'Monthly assessments',
      'Ijazah upon completion',
      'Certificate of completion',
    ],
    popular: false,
    cta: 'Join Hifz Program',
  },
];

export function Pricing() {
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="py-24 bg-[#fcfaf7] relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 mb-4 px-4 py-1.5 font-bold">
            Affordable Plans
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 mb-6 tracking-tight">
            Investment in Your Child's <span className="text-emerald-600">Akhirah</span>
          </h2>
          <div className="w-24 h-1.5 bg-gold-primary mx-auto mb-6 rounded-full" />
          <p className="text-lg text-slate-600 font-medium">
            Quality Quran education at prices every family can afford.
            Choose a plan that fits your child's learning goals.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-500 hover:shadow-2xl flex flex-col ${plan.popular
                  ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/10'
                  : 'border border-slate-200 hover:border-emerald-500/50 shadow-sm'
                } rounded-[2.5rem] group bg-white`}
            >
              {/* Mihrab Arched Header */}
              <div className={`pt-12 pb-8 px-8 text-center relative overflow-hidden ${plan.popular ? 'bg-emerald-800 text-white' : 'bg-slate-50 text-slate-800'
                } islamic-arched`}>
                {plan.popular && (
                  <div className="absolute top-2 right-2 p-2 group-hover:rotate-12 transition-transform">
                    <Star className="w-6 h-6 text-gold-accent fill-gold-accent" />
                  </div>
                )}
                <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                <p className={`text-[10px] ${plan.popular ? 'text-emerald-100/60' : 'text-slate-500'} uppercase tracking-widest font-black`}>
                  {plan.perWeek}
                </p>
              </div>

              <CardContent className="space-y-6 pt-10 flex-grow px-8 text-center">
                {/* Price */}
                <div className="mb-10">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-black text-slate-400 mt-2">$</span>
                    <span className="text-6xl font-black text-slate-800 tracking-tighter">{plan.price}</span>
                    <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">{plan.duration}</span>
                  </div>
                  <Badge variant="outline" className="mt-6 border-gold-primary/30 text-gold-primary font-black py-1 px-4 text-xs uppercase tracking-widest">
                    {plan.sessions} Total
                  </Badge>
                </div>

                {/* Features */}
                <ul className="space-y-4 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4">
                      <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-sm text-slate-600 font-bold leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-10 pt-4 px-8">
                <Button
                  onClick={scrollToContact}
                  className={`w-full h-16 text-lg font-black transition-all duration-300 rounded-2xl ${plan.popular
                      ? 'bg-emerald-600 hover:bg-slate-900 text-white shadow-xl shadow-emerald-500/20 transform hover:-translate-y-1'
                      : 'bg-white border-2 border-slate-100 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50'
                    }`}
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Money-Back Guarantee */}
        <div className="mt-20 p-10 bg-emerald-900 rounded-[3.5rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-2xl">
              <Zap className="w-12 h-12 text-gold-accent" />
            </div>
            <div>
              <h3 className="font-black text-3xl text-white tracking-tight">Trust & Quality Guaranteed</h3>
              <p className="text-emerald-100/60 max-w-lg text-lg font-medium mt-2">
                We are so confident in our quality that we offer a 100% money-back guarantee if you're not satisfied within the first week.
              </p>
            </div>
          </div>
          <Button
            onClick={scrollToContact}
            className="relative z-10 h-16 px-12 bg-white text-emerald-900 font-black text-lg rounded-2xl hover:bg-gold-accent hover:text-white transition-all transform hover:scale-105 shadow-xl"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
}
