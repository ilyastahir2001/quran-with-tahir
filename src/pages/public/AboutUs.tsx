import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { About } from '@/components/landing/About';

export default function AboutUs() {
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
