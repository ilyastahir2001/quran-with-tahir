import { Badge } from '@/components/ui/badge';
import { BookOpen, Mic, GraduationCap, Heart, Star, Clock, UserPlus, CheckCircle } from 'lucide-react';

const mainFeatures = [
  {
    icon: GraduationCap,
    title: 'Expert Tutors',
    description: 'Learn from highly qualified and Ijazah-certified Quran teachers with years of experience.'
  },
  {
    icon: Clock,
    title: '24/7 Schedule',
    description: 'We offer flexible timing that fits your busy lifestyle, regardless of your time zone.'
  },
  {
    icon: Star,
    title: 'Tajweed Mastery',
    description: 'Our courses focus on proper pronunciation (Makhaarij) and recitation rules.'
  },
  {
    icon: Heart,
    title: '1-on-1 Attention',
    description: 'Personalized lessons tailored to each student speed and learning style.'
  },
  {
    icon: BookOpen,
    title: 'Structured Hifz',
    description: 'Dedicated revision systems to help you memorize and retain the Holy Quran.'
  },
  {
    icon: CheckCircle,
    title: 'Safe Environment',
    description: 'A secure, parent-monitored online platform for children and adults alike.'
  },
];

const steps = [
  {
    id: 1,
    title: 'Register Free Trial',
    description: 'Fill out the simple form and book your first 1-on-1 session with our experts.',
    icon: UserPlus
  },
  {
    id: 2,
    title: 'Select Your Plan',
    description: 'Choose from our economical monthly or hourly plans that suit your requirements.',
    icon: BookOpen
  },
  {
    id: 3,
    title: 'Start Learning',
    description: 'Begin your spiritual journey of understanding the Quran from the comfort of home.',
    icon: GraduationCap
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative Mosaic Background */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-5" />

      <div className="container mx-auto px-4 relative z-10">

        {/* Why Study With Us Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 mb-4 px-4 py-1.5 font-bold">
            Why Tahir Academy?
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800 mb-6 tracking-tight">
            Why Study With Us?
          </h2>
          <div className="w-24 h-1.5 bg-gold-primary mx-auto mb-6 rounded-full" />
          <p className="text-lg text-slate-600 font-medium">
            We provide a world-class platform for Quranic education, combining ancient wisdom with modern technology.
          </p>
        </div>

        {/* Feature Grid with Octagonal Icons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {mainFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="group p-10 bg-[#fcfaf7] border border-slate-100 rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-8 flex items-center justify-center bg-emerald-600 octagonal-shape text-white transform group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-emerald-500/20">
                  <feature.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 3 Steps Section */}
        <div className="bg-emerald-900 rounded-[3.5rem] p-12 lg:p-24 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-islamic-pattern opacity-5" />

          <div className="relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                3 Steps to Start Your <span className="text-gold-accent">Spiritual Journey</span>
              </h2>
              <p className="text-emerald-100/60 max-w-2xl mx-auto text-lg font-medium">
                Getting started is easy. Follow these simple steps to begin your journey with our expert tutors.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-16">
              {steps.map((step) => (
                <div key={step.id} className="relative group">
                  {/* Connector Line (Desktop) */}
                  {step.id < 3 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-[3px] bg-gradient-to-r from-gold-primary/50 to-transparent z-0 ml-8" />
                  )}

                  <div className="flex flex-col items-center text-center relative z-10">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-gold-primary group-hover:border-gold-primary transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-3 shadow-2xl">
                      <step.icon className="w-12 h-12 text-gold-accent group-hover:text-white" />
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-gold-primary text-white rounded-xl flex items-center justify-center font-black border-4 border-emerald-900 shadow-xl">
                        {step.id}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">{step.title}</h3>
                    <p className="text-emerald-100/60 text-base leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
