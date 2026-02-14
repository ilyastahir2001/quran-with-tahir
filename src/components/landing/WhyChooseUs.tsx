import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, globe as Globe, Clock, CheckCircle2, Award, Zap, Heart } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "100% Vetted Scholars",
    description: "Every tutor undergoes a rigorous background check and Quranic proficiency exam before joining us."
  },
  {
    icon: UserCheck,
    title: "Personalized 1-on-1",
    description: "Focused individual attention ensures faster progress and better retention than group classes."
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Learn at your own pace, anytime, anywhere. Reschedule classes easily to fit your busy life."
  },
  {
    icon: Award,
    title: "Ijazah Certification",
    description: "Earn an official Ijazah upon completion, connecting your recitation back to the Prophet (PBUH)."
  },
  {
    icon: Zap,
    title: "Interactive Learning",
    description: "Modern digital whiteboard tools and screen sharing make online lessons engaging and effective."
  },
  {
    icon: Heart,
    title: "Safe Environment",
    description: "A secure, monitored platform designed specifically for women and children's peace of mind."
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-emerald-950 relative overflow-hidden" id="why-choose-us">
      {/* Abstract Background Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold-accent rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-20" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="outline" className="mb-4 border-gold-accent/30 text-gold-accent px-4 py-1.5 text-sm font-bold tracking-widest uppercase bg-gold-accent/5 backdrop-blur-sm">
            Why Choose Quran With Tahir?
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-6 tracking-tight">
            Experience the <span className="text-gold-accent">Difference</span>
          </h2>
          <p className="text-emerald-100/80 text-lg leading-relaxed font-medium">
            We don't just teach Quran; we build a lifelong connection with the Divine through
            <span className="text-white font-bold mx-1">expert mentorship</span>
            and a
            <span className="text-white font-bold mx-1">world-class curriculum</span>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-emerald-900/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/5 shadow-xl hover:shadow-2xl hover:border-gold-accent/30 transition-all duration-300 group"
            >
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-emerald-700/50 shadow-inner group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-gold-accent" />
              </div>
              <h3 className="text-xl font-black text-white mb-4 group-hover:text-gold-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-emerald-100/70 leading-relaxed text-sm font-semibold">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}