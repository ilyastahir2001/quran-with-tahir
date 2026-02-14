import { Button } from '@/components/ui/button';
import { ArrowRight, Phone, BookOpen } from 'lucide-react';

export function CallToAction() {
  const scrollToContact = () => {
    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-10 h-10" />
          </div>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Give Your Child the Gift of<br />
            <span className="text-emerald-200">Quran Education</span>
          </h2>

          {/* Description */}
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            The Prophet ﷺ said: "The best of you are those who learn the Quran and teach it."
            Start your child's journey today with a free trial class.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={scrollToContact}
              size="lg"
              className="bg-white text-emerald-700 hover:bg-emerald-50 text-lg px-8 py-6 shadow-xl"
            >
              Book Free Trial Class
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <a href="tel:+923110267879">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call: +92 311 026 7879
              </Button>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-emerald-100">
            <span>✓ No payment required</span>
            <span>✓ No obligation to continue</span>
            <span>✓ Experience the quality first</span>
          </div>
        </div>
      </div>
    </section>
  );
}
