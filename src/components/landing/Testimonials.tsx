import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Star as StarIcon, Quote as QuoteIcon, MapPin as MapPinIcon, ShieldCheck } from 'lucide-react';

const testimonials = [
  {
    name: "Ayesha Khan",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
    text: "The dedication of the tutors is unmatched. My son Yusuf has improved his Tajweed significantly in just 3 months. The online platform is so easy to use.",
    role: "Parent of Yusuf (Age 9)",
    rating: 5
  },
  {
    name: "Mohammed Ali",
    location: "New York, USA",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces",
    text: "I was hesitant about online Quran classes, but Quran With Tahir changed my perspective. The flexibility and quality of instruction are world-class.",
    role: "Adult Learner",
    rating: 5
  },
  {
    name: "Fatima Ahmed",
    location: "Toronto, Canada",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces",
    text: "Highly recommended for female students looking for a safe and professional environment. My daughter loves her teacher.",
    role: "Mother of Sarah",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 bg-[hsl(40,30%,98%)] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-100 rounded-full blur-[100px] opacity-60" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gold-accent/20 rounded-full blur-[100px] opacity-60" />
      <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <Badge className="bg-emerald-100 text-emerald-800 border-none mb-4 px-6 py-2 font-black uppercase tracking-widest text-[10px]">
            Success Stories
          </Badge>
          <h2 className="text-4xl lg:text-6xl font-black text-emerald-950 mb-6 tracking-tight">
            Loved By Families <span className="text-emerald-600">Worldwide</span>
          </h2>
          <p className="text-xl text-stone-600 font-bold max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied students who have transformed their relationship with the Quran.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
            >
              <Card className="h-full border-0 shadow-lg bg-white relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <CardContent className="p-8 pt-10 flex flex-col h-full relative">
                  <QuoteIcon className="absolute top-6 right-6 w-10 h-10 text-emerald-50 pointer-events-none group-hover:text-emerald-100 transition-colors" />

                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-full border-2 border-emerald-100 p-1 flex-shrink-0">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <div className="font-black text-slate-800">{testimonial.name}</div>
                      <div className="flex items-center gap-1 text-xs font-bold text-stone-400">
                        <MapPinIcon className="w-3 h-3" /> {testimonial.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex mb-4 text-gold-accent">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-stone-600 font-medium leading-relaxed italic mb-6 flex-grow">
                    "{testimonial.text}"
                  </p>

                  <div className="pt-6 border-t border-slate-50">
                    <div className="text-xs font-black uppercase tracking-wider text-emerald-600">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Banner using Glassmorphism */}
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl p-8 border border-emerald-100 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="text-xl font-black text-emerald-950 mb-1">Still not sure?</div>
            <p className="text-stone-500 text-sm font-bold">Read verified reviews on our social platforms.</p>
          </div>

          <div className="flex items-center gap-4 bg-emerald-50 px-6 py-3 rounded-xl border border-emerald-100">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Top Rated On</span>
              <span className="text-lg font-black text-emerald-900 leading-none">TrustPilot</span>
            </div>
            <div className="flex items-center gap-0.5 ml-2 text-gold-accent">
              <StarIcon className="w-4 h-4 fill-current" />
              <StarIcon className="w-4 h-4 fill-current" />
              <StarIcon className="w-4 h-4 fill-current" />
              <StarIcon className="w-4 h-4 fill-current" />
              <StarIcon className="w-4 h-4 fill-current" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}