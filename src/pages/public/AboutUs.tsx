import { useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { About } from '@/components/landing/About';

export default function AboutUs() {
    useEffect(() => {
        document.title = "About Quran With Tahir - Our Vision & Mission";
        const metaDescription = document.querySelector('meta[name="description"]');
        const originalDescription = metaDescription?.getAttribute('content');
        if (metaDescription) {
            metaDescription.setAttribute('content', "Learn about Quran with Tahir, our mission to provide affordable and premium Quranic education, and the vision of Tahir in spreading Islamic knowledge globally.");
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
                <About />
            </main>
            <Footer />
        </div>
    );
}
