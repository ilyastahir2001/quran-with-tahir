import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, CheckCircle2, Phone, Globe, ShieldCheck } from 'lucide-react';

export function Hero() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 overflow-hidden bg-[#fcfaf7]">
      {/* Premium Faded Background Image */}
      <div
        className="absolute inset-0 z-0 opacity-20 bg-no-repeat bg-right-top bg-contain lg:bg-auto"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1591604129939-f1efa4d8f7ec?auto=format&fit=crop&q=80&w=2070')`,
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 80%)'
        }}
      />

      {/* Decorative Mosaic Pattern */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-[0.03] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">

          {/* Left Column: Content */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left duration-1000">
            <div className="space-y-4">
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 px-4 py-1.5 hover:bg-emerald-100 flex w-fit items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                Trusted by 1000+ Families Globally
              </Badge>

              <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] text-slate-800 tracking-tight">
                Learn the <span className="text-emerald-600">Holy Quran</span>
                <br />
                <span className="text-slate-700 font-extrabold text-4xl lg:text-5xl">Online From Professional Tutors</span>
              </h1>
            </div>

            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed font-medium">
              We warmly welcome all students to understand the Quran with expertise.
              Get <span className="text-emerald-700 font-bold decoration-gold-primary/30 underline decoration-4 underline-offset-4">1-on-1 personalized lessons</span> from certified scholars.
            </p>

            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="Student" />
                    </div>
                  ))}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star className="w-3 h-3 text-gold-accent fill-gold-accent" />
                    4.9/5 Rating
                  </div>
                  <div className="text-slate-400">by 500+ Happy Parents</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  No Obligations
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Cancel Anytime
                </div>
              </div>
            </div>

            {/* Simple Trust Icons */}
            <div className="flex flex-wrap gap-8 pt-4">
              {['Certified Teachers', '24/7 Classes', 'Male/Female Tutors'].map((item) => (
                <div key={item} className="flex items-center gap-2.5 group">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Trial Form */}
          <div className="lg:col-span-5 relative animate-in fade-in zoom-in duration-1000">
            <div className="relative bg-white rounded-[2.5rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden">
              {/* Form Decorative Element */}
              <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-gold-primary to-emerald-500" />

              <div className="relative z-10">
                <div className="text-center mb-10">
                  <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                    Register Yours Today
                  </div>
                  <h2 className="text-4xl font-black text-slate-800 leading-tight">07 Days Trial <span className="text-emerald-600">Free</span></h2>
                  <p className="text-slate-400 text-sm font-medium mt-3 italic">Experience our quality before you pay.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Student Name</label>
                    <Input
                      placeholder="e.g. Abdullah Tahir"
                      className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white focus:border-emerald-500 transition-all rounded-2xl"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp/Phone</label>
                      <Input
                        placeholder="+92..."
                        className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white rounded-2xl"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</label>
                      <Input
                        placeholder="your@email.com"
                        type="email"
                        className="h-14 bg-slate-50/50 border-slate-100 focus:bg-white rounded-2xl"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Learning Level</label>
                    <select className="flex h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-1 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-600 font-medium">
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner (Qaida)</option>
                      <option value="nazra">Reading (Nazra)</option>
                      <option value="hifz">Memorization (Hifz)</option>
                      <option value="tajweed">Advanced Tajweed</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-16 text-lg font-black bg-emerald-600 hover:bg-slate-900 text-white shadow-xl shadow-emerald-500/20 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 mt-4"
                  >
                    Start My Free Trial
                  </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-50 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-tighter">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>Quick Inquiry: +92 311 026 7879</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
