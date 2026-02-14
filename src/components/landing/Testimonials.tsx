import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, MapPin } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Ahmed',
    location: 'California, USA',
    avatar: 'SA',
    rating: 5,
    text: "Alhamdulillah, my daughter has memorized 5 Juz in just 8 months! The teachers are incredibly patient and use engaging methods. I can monitor her progress through the parent dashboard which gives me complete peace of mind.",
    highlight: '5 Juz memorized in 8 months',
  },
  {
    name: 'Mohammed Khan',
    location: 'London, UK',
    avatar: 'MK',
    rating: 5,
    text: "Finding a qualified Quran teacher in the UK was challenging until we found Quran With Tahir. The flexible scheduling works perfectly with our busy lifestyle, and our son looks forward to every class!",
    highlight: 'Perfect for busy families',
  },
  {
    name: 'Fatima Hassan',
    location: 'Sydney, Australia',
    avatar: 'FH',
    rating: 5,
    text: "The female teachers are excellent mashAllah. My daughters feel comfortable and have developed a beautiful recitation. The academy truly understands the needs of Muslim families in the West.",
    highlight: 'Female teachers available',
  },
  {
    name: 'Ahmed Ali',
    location: 'Toronto, Canada',
    avatar: 'AA',
    rating: 5,
    text: "As a parent, the recorded sessions feature is invaluable. I can review my child's classes and see exactly how they're progressing. The Tajweed course has transformed my son's recitation.",
    highlight: 'Class recordings for parents',
  },
  {
    name: 'Aisha Malik',
    location: 'Berlin, Germany',
    avatar: 'AM',
    rating: 5,
    text: "We tried several online academies before, but Quran With Tahir stands out. The teachers actually care about our children's progress. My kids went from struggling to reading fluently in months!",
    highlight: 'From struggling to fluent',
  },
  {
    name: 'Yusuf Rahman',
    location: 'Dubai, UAE',
    avatar: 'YR',
    rating: 5,
    text: "The Ijazah program is exceptional. My son received his Ijazah with a complete Sanad. The quality of instruction matches the best traditional madrasas, but with the convenience of learning from home.",
    highlight: 'Authentic Ijazah certification',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Hear from{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Happy Parents
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of satisfied families who have transformed their children's 
            Quran learning journey with us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-2 hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-emerald-100 absolute top-4 right-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-muted-foreground mb-4 relative z-10">
                  "{testimonial.text}"
                </p>

                {/* Highlight Badge */}
                <div className="mb-4">
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
                    {testimonial.highlight}
                  </Badge>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Testimonial CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-4">
            Want to hear more? Watch video testimonials from our students and parents.
          </p>
          <div className="inline-flex items-center gap-2 text-emerald-600 font-medium">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <div className="w-0 h-0 border-l-[8px] border-l-emerald-600 border-y-[5px] border-y-transparent ml-0.5" />
            </div>
            <span>Watch Success Stories</span>
          </div>
        </div>
      </div>
    </section>
  );
}
