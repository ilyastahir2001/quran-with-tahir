import { useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Features } from '@/components/landing/Features';
import { WhyChooseUs } from '@/components/landing/WhyChooseUs';

export default function Programs() {
    useEffect(() => {
        document.title = "Online Quran Programs & Courses - Quran With Tahir";
        const metaDescription = document.querySelector('meta[name="description"]');
        const originalDescription = metaDescription?.getAttribute('content');
        if (metaDescription) {
            metaDescription.setAttribute('content', "Explore our comprehensive online Quran programs, including Tajweed mastery, Quran memorization (Hifz), and Arabic language courses for students of all ages.");
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
                <Features />
                <WhyChooseUs />
            </main>
            <Footer />
        </div>
    );
}
