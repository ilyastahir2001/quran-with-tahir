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
    <section id="pricing" className="py-24 bg-cream-light relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-5" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-gold-primary/10 text-gold-primary border-gold-primary/20 mb-4 px-4 py-1">
            Affordable Plans
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[hsl(var(--islamic-blue-dark))] mb-6">
            Investment in Your Child's <span className="text-gold-primary">Akhirah</span>
          </h2>
          <div className="w-24 h-1 bg-gold-primary mx-auto mb-6 rounded-full" />
          <p className="text-lg text-slate-600">
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
                  ? 'border-2 border-gold-primary shadow-xl shadow-gold-primary/10'
                  : 'border border-slate-200 hover:border-gold-primary/50'
                } rounded-3xl group`}
            >
              {/* Mihrab Arched Header */}
              <div className={`pt-10 pb-6 px-6 text-center relative overflow-hidden ${plan.popular ? 'bg-[hsl(var(--islamic-blue-dark))] text-white' : 'bg-slate-50 text-slate-800'
                } islamic-arched`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 p-2">
                    <Star className="w-5 h-5 text-gold-accent fill-gold-accent transform rotate-12" />
                  </div>
                )}
                <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                <p className={`text-xs ${plan.popular ? 'text-blue-100/60' : 'text-slate-500'} uppercase tracking-widest font-bold`}>
                  {plan.perWeek}
                </p>
              </div>

              <CardContent className="space-y-6 pt-8 flex-grow">
                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-bold text-slate-400 mt-2">$</span>
                    <span className="text-5xl font-black text-slate-800 tracking-tight">{plan.price}</span>
                    <span className="text-slate-400 text-sm font-medium">{plan.duration}</span>
                  </div>
                  <Badge variant="outline" className="mt-4 border-gold-primary/30 text-gold-primary font-bold">
                    {plan.sessions} Total
                  </Badge>
                </div>

                {/* Features */}
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-gold-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pb-8 pt-4">
                <Button
                  onClick={scrollToContact}
                  className={`w-full h-14 text-lg font-bold transition-all duration-300 ${plan.popular
                      ? 'bg-gold-primary hover:bg-gold-accent text-white shadow-lg transform hover:-translate-y-1'
                      : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-gold-primary hover:text-gold-primary hover:bg-gold-primary/5'
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
        <div className="mt-16 p-8 bg-[hsl(var(--islamic-blue-dark))] rounded-[2rem] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-islamic-pattern opacity-10" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gold-primary/20 backdrop-blur-md flex items-center justify-center border border-gold-primary/30">
              <Zap className="w-10 h-10 text-gold-accent" />
            </div>
            <div>
              <h3 className="font-bold text-2xl text-white">Trust & Quality Guaranteed</h3>
              <p className="text-blue-100/60 max-w-md">
                We are so confident in our quality that we offer a 100% money-back guarantee if you're not satisfied within the first week.
              </p>
            </div>
          </div>
          <Button
            onClick={scrollToContact}
            className="relative z-10 h-14 px-10 bg-white text-blue-900 font-bold hover:bg-gold-accent hover:text-white transition-all transform hover:scale-105 whitespace-nowrap"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
}
