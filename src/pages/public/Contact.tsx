import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Contact as ContactSection } from '@/components/landing/Contact';

export default function Contact() {
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
