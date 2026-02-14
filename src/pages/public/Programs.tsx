import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Features } from '@/components/landing/Features';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';

export default function Programs() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-20">
                <Features />
                <WhyChooseUs />
            </main>
            <Footer />
        </div>
    );
}
