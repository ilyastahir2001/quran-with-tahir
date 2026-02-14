import { Badge } from '@/components/ui/badge';
import { Video, Clock, Users, Shield, Award, Headphones, BookOpen, Sparkles } from 'lucide-react';

const reasons = [
  {
    icon: Video,
    title: 'Live 1-on-1 Classes',
    description: 'Real-time interactive sessions with dedicated teachers, not pre-recorded videos.',
  },
  {
    icon: Clock,
    title: 'Flexible Scheduling',
    description: 'Book classes at times that suit your family. Early morning to late night - we adapt to you.',
  },
  {
    icon: Users,
    title: 'Male & Female Teachers',
    description: 'Choose a teacher that makes your child most comfortable. Both options available.',
  },
  {
    icon: Shield,
    title: 'Parent Dashboard',
    description: 'Monitor your child\'s progress, view class recordings, and track attendance anytime.',
  },
  {
    icon: Award,
    title: 'Ijazah-Certified',
    description: 'Learn from teachers with authentic chains of narration directly to the Prophet ﷺ.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Questions? Concerns? Our support team is always ready to help via WhatsApp or email.',
  },
  {
    icon: BookOpen,
    title: 'Structured Curriculum',
    description: 'Research-backed teaching methods designed for effective and enjoyable learning.',
  },
  {
    icon: Sparkles,
    title: 'Free Trial Class',
    description: 'Experience our teaching quality risk-free. No payment required for your first class.',
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-emerald-50/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
            Why Choose Us
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Quran With Tahir
            </span> Difference
          </h2>
          <p className="text-lg text-muted-foreground">
            We combine traditional Islamic scholarship with modern technology to deliver 
            the best Quran learning experience for your family.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className="relative p-6 bg-background rounded-2xl border hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group"
            >
              {/* Number Badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-600">
                {index + 1}
              </div>
              
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 group-hover:from-emerald-500 group-hover:to-teal-600 transition-colors duration-300">
                <reason.icon className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors duration-300" />
              </div>
              
              <h3 className="font-semibold text-lg mb-2 group-hover:text-emerald-600 transition-colors">
                {reason.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* Trust Banner */}
        <div className="mt-16 p-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl text-white text-center">
          <h3 className="text-2xl font-bold mb-2">Join 1000+ Satisfied Families</h3>
          <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
            Parents across USA, UK, Australia, and Europe trust us with their children's Quran education.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            <div>
              <div className="text-3xl font-bold">4.9/5</div>
              <div className="text-sm text-emerald-100">Parent Rating</div>
            </div>
            <div className="w-px bg-emerald-400/30 hidden sm:block" />
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-emerald-100">Countries</div>
            </div>
            <div className="w-px bg-emerald-400/30 hidden sm:block" />
            <div>
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-emerald-100">Money-Back Guarantee</div>
            </div>
            <div className="w-px bg-emerald-400/30 hidden sm:block" />
            <div>
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-emerald-100">Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
