import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Star, CheckCircle2, Phone, Globe } from 'lucide-react';

export function Hero() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic would go here
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-[hsl(var(--islamic-blue-dark))]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-islamic-pattern opacity-10" />

      {/* Decorative Orbs */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-gold-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-islamic-blue-main/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Content */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8 animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2">
              <Badge className="bg-gold-primary/20 text-gold-accent border-gold-primary/30 px-4 py-1.5 hover:bg-gold-primary/30">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Trusted by 1000+ Families Worldwide
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white mb-6">
              Learn the <span className="text-[hsl(var(--gold-accent))]">Holy Quran</span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl opacity-90">Online From Professional Tutors</span>
            </h1>

            <p className="text-lg sm:text-xl text-blue-100/80 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              We warmly welcome all students to come and understand the Holy Quran under our expertise.
              Get <span className="text-white font-semibold underline decoration-gold-primary">personalized 1-on-1 lessons</span> from certified instructors.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 py-8 border-y border-white/10 max-w-xl">
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-[hsl(var(--gold-accent))]">1000+</div>
                <p className="text-xs text-blue-100/60 uppercase tracking-wider">Students</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-3xl font-bold text-[hsl(var(--gold-accent))]">50+</div>
                <p className="text-xs text-blue-100/60 uppercase tracking-wider">Expert Teachers</p>
              </div>
              <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-gold-accent fill-gold-accent" />
                  <span className="text-3xl font-bold text-[hsl(var(--gold-accent))]">4.9</span>
                </div>
                <p className="text-xs text-blue-100/60 uppercase tracking-wider">Rating</p>
              </div>
            </div>

            {/* Quick Trust List */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {['Certified Teachers', 'Flexible 24/7 Schedule', 'Money-Back Guarantee'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-blue-100/70 text-sm bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  <CheckCircle2 className="w-4 h-4 text-gold-accent" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Trial Form */}
          <div className="lg:col-span-5 relative animate-in zoom-in duration-1000">
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border-t-4 border-gold-primary islamic-arched overflow-hidden">
              {/* Form Decorative Background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/5 rounded-full -mr-16 -mt-16" />

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-block px-4 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                    Start Your Journey
                  </div>
                  <h2 className="text-3xl font-black text-slate-800">07 Days Trial Now!</h2>
                  <p className="text-slate-500 text-sm mt-2">No credit card required. Cancel anytime.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Student Name"
                    className="h-12 border-slate-200 focus:border-gold-primary focus:ring-gold-primary"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Phone Number"
                      className="h-12 border-slate-200 focus:border-gold-primary"
                      required
                    />
                    <Input
                      placeholder="Email Address"
                      type="email"
                      className="h-12 border-slate-200 focus:border-gold-primary"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <select className="flex h-12 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-gold-primary disabled:cursor-not-allowed disabled:opacity-50 text-slate-500">
                      <option value="">Select Level</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced (Hifz/Tajweed)</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-black text-white shadow-xl transform transition hover:-translate-y-1 active:translate-y-0"
                  >
                    Register Your Free Trial
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Phone className="w-4 h-4" />
                    <span>WhatsApp: +92 311 026 7879</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] opacity-50">Secure SSL</Badge>
                </div>
              </div>
            </div>

            {/* Floating Achievement */}
            <div className="absolute -bottom-6 -left-6 bg-[hsl(var(--gold-accent))] text-white p-4 rounded-2xl shadow-xl border-4 border-white flex items-center gap-3 animate-bounce">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="w-6 h-6 fill-white" />
              </div>
              <div>
                <p className="font-bold text-lg leading-none">4.9/5</p>
                <p className="text-[10px] opacity-90">Parent Rating</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
