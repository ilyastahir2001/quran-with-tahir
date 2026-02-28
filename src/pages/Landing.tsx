import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';

import { Testimonials } from '@/components/landing/Testimonials';
import { Pricing } from '@/components/landing/Pricing';
import { Contact } from '@/components/landing/Contact';
import { Footer } from '@/components/landing/Footer';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';
import { CallToAction } from '@/components/landing/CallToAction';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Starting Landing Page Changes - Dev Branch */}
      <Navbar />
      <main>
        <Hero />
        <Features />

        <WhyChooseUs />
        <Testimonials />
        <Pricing />
        <CallToAction />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
