import { Badge } from '@/components/ui/badge';
import { Award, Users, Shield, Globe, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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

export function About() {
  return (
    <section id="about" className="py-24 bg-[hsl(35,30%,96%)] relative overflow-hidden">
      {/* Decorative Overlays */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute right-0 top-0 w-1/3 h-full opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-islamic-pattern" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left Content: The Story & Vision */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-10"
          >
            <div className="space-y-6">
              <Badge className="bg-emerald-100 text-emerald-800 border-none mb-2 px-6 py-2 uppercase tracking-widest text-[10px] font-black">
                Our Vision & Mission
              </Badge>
              <h2 className="text-4xl lg:text-6xl font-black text-emerald-950 tracking-tighter leading-tight">
                Empowering the <span className="text-emerald-600">Next Generation</span>
              </h2>
              <p className="text-xl text-stone-600 font-bold leading-relaxed">
                Quran With Tahir was founded to bridge the gap between traditional Islamic scholarship and the modern digital world.
              </p>
            </div>

            <div className="space-y-6 text-stone-600 font-medium leading-loose text-lg">
              <p>
                We understand the struggle of Muslim parents in the West: balancing a busy life while ensuring children receive an <span className="text-emerald-700 font-bold underline decoration-gold-accent/30 decoration-wavy underline-offset-4">authentic Quranic education</span>.
              </p>
              <p>
                Our mission is to provide an elite, secure, and spiritually nurturing environment where students from <span className="text-emerald-950 font-black border-b-2 border-gold-accent/20">USA, UK, Canada, and Australia</span> can master the Holy Quran with Tajweed, from the comfort of their homes.
              </p>
            </div>

            {/* Premium Promise Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-gold-accent/20 rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-700" />
              <div className="relative flex items-center gap-8 p-8 bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20">
                  <Heart className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-emerald-950 mb-2">Our Spiritual Commitment</h3>
                  <p className="text-stone-500 text-sm font-bold">
                    We don't just teach reading; we nurture a lifelong love for the Quran in every student's heart.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Content: Stats & Values Grid */}
          <div className="relative">
            {/* Arched Image Placeholder / Visual Branding */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative mb-12"
            >
              <div className="aspect-[4/5] bg-emerald-900 rounded-[4rem] islam-arched-full overflow-hidden shadow-2xl border-8 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1594953930438-fb1c8b3e8392?q=80&w=2000&auto=format&fit=crop"
                  alt="Islamic Architecture"
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000"
                />

                {/* Floating Achievement Badge */}
                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/90 backdrop-blur-xl rounded-3xl border border-white shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold-accent rounded-2xl flex items-center justify-center text-emerald-950">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-emerald-950">15,000+</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Hours of Lessons Delivered</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold-accent/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            </motion.div>

            {/* Values Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value, idx) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="p-8 bg-white rounded-3xl border border-emerald-50 hover:border-gold-accent/30 hover:shadow-xl transition-all group hover:-translate-y-1"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:rotate-[15deg]">
                    <value.icon className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-black text-emerald-950 mb-3 text-lg">{value.title}</h3>
                  <p className="text-xs text-stone-500 font-bold leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}