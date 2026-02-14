import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Award, Users, Shield, Globe, Heart } from 'lucide-react';

const values = [
  {
    icon: Award,
    title: 'Certified Excellence',
    description: 'All our teachers hold Ijazah certification with authentic chains of narration (Sanad).',
  },
  {
    icon: Users,
    title: 'Personalized Learning',
    description: 'One-on-one attention ensures every student learns at their own pace.',
  },
  {
    icon: Shield,
    title: 'Safe Environment',
    description: 'Parent-monitored classes with recorded sessions for complete peace of mind.',
  },
  {
    icon: Globe,
    title: 'Global Accessibility',
    description: 'Available 24/7 to accommodate students from USA, UK, Australia, Europe & beyond.',
  },
];

const achievements = [
  'Ijazah-certified Quran teachers',
  'Background-verified instructors',
  'Child-safe learning platform',
  'Free trial class - no obligation',
  'Flexible scheduling options',
  'Progress reports for parents',
  'Male & female teachers available',
  'Native Arabic speakers',
];

export function About() {
  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
                About Us
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Where Faith Meets{' '}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Modern Education
                </span>
              </h2>
              <p className="text-lg text-muted-foreground">
                <strong>Quran With Tahir</strong> was founded with a simple yet profound mission: 
                to make authentic Quran education accessible to every Muslim family, regardless of location.
              </p>
            </div>

            <div className="space-y-4 text-muted-foreground">
              <p>
                We understand the challenges parents face in finding qualified Quran teachers, 
                especially in Western countries. That's why we've brought together a team of 
                <strong className="text-foreground"> Ijazah-certified scholars</strong> who combine 
                traditional Islamic knowledge with modern teaching methods.
              </p>
              <p>
                Our academy serves families across the <strong className="text-foreground">United States, 
                United Kingdom, Australia, Canada, and Europe</strong>, providing a safe, 
                convenient, and effective way to connect your children with their Islamic heritage.
              </p>
            </div>

            <div className="flex items-center gap-6 p-6 bg-background rounded-2xl border shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Our Promise to Parents</h3>
                <p className="text-muted-foreground">
                  We treat every student as our own child, nurturing their spiritual growth 
                  with patience, love, and dedication.
                </p>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="space-y-8">
            {/* Values Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="p-6 bg-background rounded-2xl border hover:border-emerald-200 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                    <value.icon className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>

            {/* Achievements List */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <h3 className="font-semibold text-lg mb-4 text-emerald-800">Why Parents Trust Us</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {achievements.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-emerald-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
