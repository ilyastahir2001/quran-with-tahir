import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Star as StarIcon, Quote as QuoteIcon, MapPin as MapPinIcon, ShieldCheck } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Ahmed',
    location: 'California, USA',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    rating: 5,
    text: "Alhamdulillah, my daughter has memorized 5 Juz in just 8 months! The teachers are incredibly patient and use engaging methods. I can monitor her progress through the parent dashboard which gives me complete peace of mind.",
    highlight: '5 Juz memorized in 8 months',
  },
  {
    name: 'Mohammed Khan',
    location: 'London, UK',
    avatar: 'https://i.pravatar.cc/150?u=mohammed',
    rating: 5,
    text: "Finding a qualified Quran teacher in the UK was challenging until we found Quran With Tahir. The flexible scheduling works perfectly with our busy lifestyle, and our son looks forward to every class!",
    highlight: 'Perfect for busy families',
  },
  {
    name: 'Fatima Hassan',
    location: 'Sydney, Australia',
    avatar: 'https://i.pravatar.cc/150?u=fatima',
    rating: 5,
    text: "The female teachers are excellent mashAllah. My daughters feel comfortable and have developed a beautiful recitation. The academy truly understands the needs of Muslim families in the West.",
    highlight: 'Qualified female teachers',
  },
  {
    name: 'Ahmed Ali',
    location: 'Toronto, Canada',
    avatar: 'https://i.pravatar.cc/150?u=ahmed',
    rating: 5,
    text: "As a parent, the recorded sessions feature is invaluable. I can review my child's classes and see exactly how they're progressing. The Tajweed course has transformed my son's recitation.",
    highlight: '100% Transparent journey',
  },
  {
    name: 'Aisha Malik',
    location: 'Berlin, Germany',
    avatar: 'https://i.pravatar.cc/150?u=aisha',
    rating: 5,
    text: "We tried several online academies before, but Quran With Tahir stands out. The teachers actually care about our children's progress. My kids went from struggling to reading fluently in months!",
    highlight: 'Remarkable progress',
  },
  {
    name: 'Yusuf Rahman',
    location: 'Dubai, UAE',
    avatar: 'https://i.pravatar.cc/150?u=yusuf',
    rating: 5,
    text: "The Ijazah program is exceptional. My son received his Ijazah with a complete Sanad. The quality of instruction matches the best traditional madrasas, but with the convenience of home.",
    highlight: 'Authentic Sanad/Ijazah',
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-32 bg-white relative overflow-hidden">
      {/* Decorative Overlays */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#fcfaf7] to-transparent" />
      <div className="absolute inset-0 bg-islamic-pattern opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-emerald-50 text-emerald-700 border-none mb-6 px-6 py-2 font-black uppercase tracking-widest text-[10px]">
              Verified Parental Feedback
            </Badge>
            <h2 className="text-4xl lg:text-7xl font-black text-slate-800 mb-8 tracking-tighter">
              Stories of <span className="gradient-text-emerald">Transformation</span>
            </h2>
            <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto leading-relaxed">
              Join thousands of families worldwide who have entrusted their children's spiritual growth to our academy.
            </p>
          </motion.div>
        </div>

        {/* Testimonials Masonry-like Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex"
            >
              <Card className="relative overflow-hidden border-slate-100 bg-[#fcfaf7] hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 rounded-[2.5rem] group p-8 flex flex-col h-full">
                <div className="absolute top-8 right-8 text-emerald-100/40 group-hover:text-emerald-500/10 transition-colors">
                  <QuoteIcon className="w-16 h-16 transform group-hover:-rotate-12 transition-transform duration-700" />
                </div>

                <div className="flex gap-1 mb-6 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-gold-accent fill-gold-accent" />
                  ))}
                </div>

                <blockquote className="flex-grow text-slate-600 font-bold leading-relaxed mb-8 relative z-10 italic">
                  "{testimonial.text}"
                </blockquote>

                <div className="space-y-6 pt-6 border-t border-slate-100 relative z-10">
                  <Badge variant="outline" className="bg-white border-emerald-100/50 text-emerald-700 font-black py-1 px-4 text-[10px] uppercase tracking-wider">
                    {testimonial.highlight}
                  </Badge>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-4 border-white shadow-xl overflow-hidden ring-4 ring-emerald-50/50">
                      <img src={testimonial.avatar} alt={testimonial.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 flex items-center gap-1.5">
                        {testimonial.name}
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <MapPinIcon className="w-3 h-3" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Global Trust Banner for Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <div className="inline-flex flex-col items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-slate-200 overflow-hidden ring-2 ring-emerald-50/50 grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <img src={`https://i.pravatar.cc/100?u=${i + 50}`} alt="User" />
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-4 border-white bg-emerald-600 text-white flex items-center justify-center font-black text-xs ring-2 ring-emerald-50/50">
                +250
              </div>
            </div>
            <p className="text-slate-500 font-bold max-w-lg">
              Want to see real student progress? <span className="text-emerald-600 underline cursor-pointer hover:text-emerald-700">Watch our video testimonials</span> and hear authentic voices of transformation.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
