import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Star, Users, Award, Shield, Globe, CheckCircle2 } from 'lucide-react';

export function Hero() {
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-teal-50/30" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2310b981%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 px-4 py-1.5">
                <Globe className="w-3.5 h-3.5 mr-1.5" />
                Trusted by 1000+ Families Worldwide
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-foreground">Learn the </span>
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Holy Quran
              </span>
              <br />
              <span className="text-foreground">with Expert Teachers</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Give your children the gift of Quran education from the comfort of your home. 
              Our certified teachers provide <strong>personalized 1-on-1 lessons</strong> for all ages, 
              making Quran learning engaging, effective, and accessible worldwide.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Certified Teachers</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Flexible Scheduling</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Money-Back Guarantee</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={scrollToContact}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-lg px-8 py-6 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
              >
                Start Free Trial
              </Button>
              <Button
                onClick={scrollToFeatures}
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 border-2 hover:bg-emerald-50"
              >
                <Play className="w-5 h-5 mr-2" />
                Explore Courses
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
                  <span className="text-3xl font-bold text-emerald-600">1000+</span>
                </div>
                <p className="text-sm text-muted-foreground">Happy Students</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
                  <span className="text-3xl font-bold text-emerald-600">50+</span>
                </div>
                <p className="text-sm text-muted-foreground">Expert Teachers</p>
              </div>
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-1 mb-1">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <span className="text-3xl font-bold text-emerald-600">4.9</span>
                </div>
                <p className="text-sm text-muted-foreground">Parent Rating</p>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative hidden lg:block">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main Card */}
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <BookOpenIcon className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                      <Users className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">1-on-1 Live Classes</h3>
                      <p className="text-muted-foreground text-sm">Personalized attention for every student</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                      <Award className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Certified Teachers</h3>
                      <p className="text-muted-foreground text-sm">Ijazah-certified Quran instructors</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Safe & Secure</h3>
                      <p className="text-muted-foreground text-sm">Parent-monitored learning environment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold">Available 24/7</p>
                  <p className="text-xs text-muted-foreground">USA • UK • Australia • Europe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
