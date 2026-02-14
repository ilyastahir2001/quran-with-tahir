import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
            Affordable Plans
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Investment in Your Child's{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Akhirah
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Quality Quran education at prices every family can afford. 
            Choose a plan that fits your child's learning goals.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-2 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'border-2 hover:border-emerald-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                    <Star className="w-3 h-3 mr-1 fill-white" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">{plan.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                      {plan.sessions}
                    </Badge>
                    <span className="text-muted-foreground">• {plan.perWeek}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={scrollToContact}
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg'
                      : ''
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
        <div className="mt-12 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <Zap className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">100% Money-Back Guarantee</h3>
              <p className="text-muted-foreground">
                Not satisfied? Get a full refund within the first week - no questions asked.
              </p>
            </div>
          </div>
          <Button onClick={scrollToContact} variant="outline" className="whitespace-nowrap">
            Start Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
}
