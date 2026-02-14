import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Pricing as PricingSection } from '@/components/landing/Pricing';

export default function Pricing() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-20">
                <PricingSection />
            </main>
            <Footer />
        </div>
    );
}
