import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Testimonials as TestimonialsSection } from '@/components/landing/Testimonials';

export default function Testimonials() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-20">
                <TestimonialsSection />
            </main>
            <Footer />
        </div>
    );
}
