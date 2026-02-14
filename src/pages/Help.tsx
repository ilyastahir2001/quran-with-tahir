import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';

const faqs = [
  {
    question: 'How do I schedule a class?',
    answer: 'Once you connect with a teacher, they will set up your schedule based on your availability. You can view your schedule in the "My Schedule" section.',
  },
  {
    question: 'What do I need for video classes?',
    answer: 'You need a device with a camera and microphone (computer, tablet, or smartphone), a stable internet connection, and a quiet place to learn.',
  },
  {
    question: 'How do I connect with a teacher?',
    answer: 'Go to "Find Tutors" to browse available teachers. Click "Connect" on a teacher\'s profile to send a connection request. The teacher will review and respond to your request.',
  },
  {
    question: 'Can I reschedule a class?',
    answer: 'Yes, you can request to reschedule a class through the "Requests" section. Please provide at least 24 hours notice when possible.',
  },
  {
    question: 'How do I join a video class?',
    answer: 'When it\'s time for your class, you\'ll see a "Join" button on your dashboard. Click it to enter the virtual classroom where you\'ll meet your teacher.',
  },
  {
    question: 'What if I have technical issues during class?',
    answer: 'Try refreshing your browser first. If issues persist, check your internet connection and camera/microphone permissions. Contact support if you need further help.',
  },
];

export default function Help() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Help & Support</h1>
        <p className="text-muted-foreground">Get help with your learning journey</p>
      </div>

      {/* Contact Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6 text-center">
            <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">WhatsApp</h3>
            <p className="text-sm text-muted-foreground mb-3">+92 311 026 7879</p>
            <Button variant="outline" size="sm" asChild>
              <a href="https://wa.me/923110267879" target="_blank" rel="noopener noreferrer">
                Chat Now
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Email</h3>
            <p className="text-sm text-muted-foreground mb-3">ilyastahir2001@gmail.com</p>
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:ilyastahir2001@gmail.com">
                Send Email
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="font-medium">Live Chat</h3>
            <p className="text-sm text-muted-foreground mb-3">Chat with support</p>
            <Button variant="outline" size="sm">
              Start Chat
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Find answers to common questions</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
