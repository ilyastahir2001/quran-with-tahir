import { useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Pricing as PricingSection } from '@/components/landing/Pricing';

export default function Pricing() {
    useEffect(() => {
        document.title = "Affordable Quran Classes Pricing - Quran With Tahir";
        const metaDescription = document.querySelector('meta[name="description"]');
        const originalDescription = metaDescription?.getAttribute('content');
        if (metaDescription) {
            metaDescription.setAttribute('content', "View our affordable and flexible pricing plans for online Quran classes. We offer various packages for kids and adults, with free trial classes available.");
        }
        return () => {
            document.title = "Quran With Tahir";
            if (metaDescription && originalDescription) {
                metaDescription.setAttribute('content', originalDescription);
            }
        };
    }, []);

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
