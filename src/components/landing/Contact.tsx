import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const contactInfo = [
  {
    icon: Phone,
    title: 'Phone / WhatsApp',
    value: '+92 311 026 7879',
    href: 'https://wa.me/923110267879',
    action: 'Chat on WhatsApp',
  },
  {
    icon: Mail,
    title: 'Email',
    value: 'ilyastahir2001@gmail.com',
    href: 'mailto:ilyastahir2001@gmail.com',
    action: 'Send Email',
  },
  {
    icon: Clock,
    title: 'Available Hours',
    value: '24/7 - All Time Zones',
    href: null,
    action: null,
  },
  {
    icon: MapPin,
    title: 'Serving',
    value: 'USA, UK, Australia, Europe & More',
    href: null,
    action: null,
  },
];

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('Thank you! We will contact you within 24 hours.');
  };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
            Get Started
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Book Your{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Free Trial Class
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Fill out the form below and our team will contact you within 24 hours 
            to schedule your child's free trial class.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="border-2">
            <CardContent className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                  <p className="text-muted-foreground mb-6">
                    We've received your request. Our team will contact you within 24 hours 
                    to schedule your free trial class.
                  </p>
                  <Button onClick={() => setSubmitted(false)} variant="outline">
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="parentName">Parent's Name *</Label>
                      <Input id="parentName" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentName">Student's Name *</Label>
                      <Input id="studentName" placeholder="Child's name" required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp Number *</Label>
                      <Input id="phone" type="tel" placeholder="+1 234 567 8900" required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usa">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="australia">Australia</SelectItem>
                          <SelectItem value="canada">Canada</SelectItem>
                          <SelectItem value="germany">Germany</SelectItem>
                          <SelectItem value="france">France</SelectItem>
                          <SelectItem value="uae">UAE</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course">Course Interest *</Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nazra">Quran Reading (Nazra)</SelectItem>
                          <SelectItem value="tajweed">Tajweed Course</SelectItem>
                          <SelectItem value="hifz">Hifz (Memorization)</SelectItem>
                          <SelectItem value="arabic">Arabic Language</SelectItem>
                          <SelectItem value="islamic">Islamic Studies</SelectItem>
                          <SelectItem value="ijazah">Ijazah Program</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentAge">Student's Age *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4-6">4-6 years</SelectItem>
                        <SelectItem value="7-10">7-10 years</SelectItem>
                        <SelectItem value="11-14">11-14 years</SelectItem>
                        <SelectItem value="15-18">15-18 years</SelectItem>
                        <SelectItem value="adult">Adult (18+)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Message (Optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your child's current Quran knowledge, preferred class times, or any special requirements..."
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white py-6 text-lg"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Request Free Trial Class
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <div
                  key={info.title}
                  className="flex items-start gap-4 p-4 bg-muted/50 rounded-xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{info.title}</h3>
                    <p className="text-muted-foreground">{info.value}</p>
                    {info.href && (
                      <a
                        href={info.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-1 inline-flex items-center gap-1"
                      >
                        {info.action} →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Prefer WhatsApp?</h3>
                  <p className="text-sm text-muted-foreground">Get instant response</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Chat with us directly on WhatsApp for quick inquiries and instant scheduling.
              </p>
              <a
                href="https://wa.me/923110267879?text=Assalamu%20Alaikum!%20I'm%20interested%20in%20Quran%20classes%20for%20my%20child."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>
            </div>

            {/* Trust Note */}
            <p className="text-sm text-muted-foreground text-center">
              🔒 Your information is secure and will never be shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
