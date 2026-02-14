import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ShieldCheck, UserCheck, Globe, Clock, CheckCircle2, Award, Zap, Heart } from "lucide-react";

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
    <section className="py-24 bg-slate-50 relative overflow-hidden" id="why-choose-us">
      {/* Abstract Background Patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-accent rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-islamic-pattern" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="outline" className="mb-4 border-emerald-200 text-emerald-700 px-4 py-1.5 text-sm font-bold tracking-widest uppercase bg-emerald-50">
            Why Choose Quran With Tahir?
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Experience the <span className="text-emerald-600">Difference</span>
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed font-medium">
            We don't just teach Quran; we build a lifelong connection with the Divine through
            <span className="text-emerald-700 font-bold mx-1">expert mentorship</span>
            and a
            <span className="text-emerald-700 font-bold mx-1">world-class curriculum</span>.
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
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group"
            >
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-emerald-50 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm font-semibold">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}