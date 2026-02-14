import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, ArrowRight, User, Mail, Users, Star, globe as Globe } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function Hero() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div className="relative min-h-[90vh] flex items-center pt-28 pb-20 overflow-hidden bg-background">
       {/* Background Image Layer (Subtle) */}
      <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1585036156171-384164a8c675?q=80&w=2000&auto=format&fit=crop" 
            alt="Quran Background" 
            className="w-full h-full object-cover opacity-[0.07] mix-blend-multiply"
          />
          {/* Gradient Mask to fade out image at edges */}
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      {/* Warm Radiant Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-200/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-200/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-gold-accent/10 blur-[80px]" />
      </div>

      <div className="container mx-auto px-4 z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Trust Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-sm font-bold shadow-sm backdrop-blur-sm"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>Trusted by 2500+ Active Students Globally</span>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.1]"
              >
                Master the <span className="text-emerald-600 inline-block relative">
                  Holy Quran
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-gold-accent opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5 L 100 8 Q 50 13 0 8 Z" fill="currentColor" />
                  </svg>
                </span>
                <br />
                <span className="text-emerald-900">With Expert Guidance.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg lg:text-xl text-muted-foreground font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Personalized <span className="text-emerald-700 font-bold border-b-2 border-gold-accent/40">One-on-One sessions</span> with certified scholars. 
                Experience the most secure and effective way to learn Quran online from the comfort of your home.
              </motion.p>
            </div>

            {/* Social Proof with Fixed Images */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center lg:justify-start gap-6 pt-4"
            >
              <div className="flex -space-x-4">
                {[
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
                ].map((src, i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden bg-emerald-100">
                     <img src={src} alt="Student" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-gold-accent">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-sm font-bold text-emerald-900">
                  4.9/5 Rating <span className="text-emerald-600 font-normal ml-1">from 5000+ Happy Learners</span>
                </p>
              </div>
            </motion.div>
          </div>
          
          {/* Right Column: Registration Form (Glassmorphism) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="relative lg:ml-auto w-full max-w-md"
          >
            {/* Decorative blobs behind form */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-[2rem] opacity-30 blur-2xl -z-10" />
            
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-xl overflow-hidden rounded-[2rem]">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-gold-accent to-emerald-500" />
              
              <CardContent className="p-8 space-y-6">
                <div className="text-center space-y-2">
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-1">
                    LIMITED SLOTS AVAILABLE
                  </Badge>
                  <h3 className="text-3xl font-black text-emerald-950">
                    Start Your <span className="text-emerald-600">Free</span><br/>Week Trial
                  </h3>
                  <p className="text-slate-500 text-sm">Experience personalized learning before you commit.</p>
                </div>

                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 ml-1">Student Name</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-3.5 w-5 h-5 text-emerald-300" />
                      <input 
                        type="text" 
                        placeholder="e.g. Yusuf Abdullah"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all font-semibold text-emerald-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 ml-1">WhatsApp</label>
                       <div className="relative">
                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-emerald-300" />
                        <input 
                          type="tel" 
                          placeholder="+92..."
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all font-semibold text-emerald-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                     <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 ml-1">Email</label>
                       <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-emerald-300" />
                        <input 
                          type="email" 
                          placeholder="hello@..."
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none transition-all font-semibold text-emerald-900 placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Simplified Button (Standard Green) */}
                  <Button size="lg" className="w-full h-14 text-lg font-black rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <p className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> No credit card required • Cancel anytime
                  </p>
                </form>
                
                {/* Direct Support Line */}
                <div className="pt-4 border-t border-slate-100 text-center">
                   <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-2">
                    <Phone className="w-3 h-3" /> Direct Support: +92 311 026 7879
                   </p>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
