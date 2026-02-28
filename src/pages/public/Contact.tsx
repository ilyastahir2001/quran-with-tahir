import { useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Contact as ContactSection } from '@/components/landing/Contact';

export default function Contact() {
    useEffect(() => {
        document.title = "Contact Us - Quran With Tahir | Online Quran Academy";
        const metaDescription = document.querySelector('meta[name="description"]');
        const originalDescription = metaDescription?.getAttribute('content');
        if (metaDescription) {
            metaDescription.setAttribute('content', "Get in touch with Quran with Tahir for inquiries about our online Quran classes, registration, or support. We are here to help you on your spiritual journey.");
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
                <ContactSection />
            </main>
            <Footer />
        </div>
    );
}
