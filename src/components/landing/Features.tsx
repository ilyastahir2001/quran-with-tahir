import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Languages, Moon, Mic, GraduationCap, Heart, Star, Clock } from 'lucide-react';

const courses = [
  {
    icon: BookOpen,
    title: 'Quran Reading (Nazra)',
    description: 'Learn to read the Holy Quran with proper Makharij and basic Tajweed rules. Perfect for beginners of all ages.',
    badge: 'Most Popular',
    color: 'emerald',
    features: ['Arabic Alphabet', 'Word Formation', 'Basic Reading'],
  },
  {
    icon: Mic,
    title: 'Tajweed Course',
    description: 'Master the art of Quran recitation with proper Tajweed rules, pronunciation, and melodious recitation.',
    badge: 'Advanced',
    color: 'blue',
    features: ['Pronunciation Rules', 'Makhaarij', 'Beautiful Recitation'],
  },
  {
    icon: Heart,
    title: 'Quran Memorization (Hifz)',
    description: 'Structured memorization program with revision techniques to help students become Hafiz-e-Quran.',
    badge: 'Specialized',
    color: 'purple',
    features: ['Daily Memorization', 'Revision System', 'Progress Tracking'],
  },
  {
    icon: Languages,
    title: 'Arabic Language',
    description: 'Understand the Quran in its original language. Learn Quranic Arabic vocabulary and grammar.',
    badge: 'Essential',
    color: 'amber',
    features: ['Vocabulary', 'Grammar', 'Translation'],
  },
  {
    icon: Moon,
    title: 'Islamic Studies',
    description: 'Comprehensive Islamic education including Fiqh, Hadith, Seerah, and daily Duas for children.',
    badge: 'Complete',
    color: 'teal',
    features: ['Fiqh Basics', 'Daily Duas', 'Islamic History'],
  },
  {
    icon: GraduationCap,
    title: 'Ijazah Program',
    description: 'Get certified in Quran recitation with an authentic chain of narration (Sanad) to the Prophet ﷺ.',
    badge: 'Certification',
    color: 'rose',
    features: ['Authentic Sanad', 'Full Quran Recitation', 'Official Certificate'],
  },
];

const colorClasses = {
  emerald: 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500',
  blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-500',
  purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-500',
  amber: 'bg-amber-100 text-amber-600 group-hover:bg-amber-500',
  teal: 'bg-teal-100 text-teal-600 group-hover:bg-teal-500',
  rose: 'bg-rose-100 text-rose-600 group-hover:bg-rose-500',
};

const badgeClasses = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  amber: 'bg-amber-100 text-amber-700',
  teal: 'bg-teal-100 text-teal-700',
  rose: 'bg-rose-100 text-rose-700',
};

export function Features() {
  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 mb-4">
            Our Programs
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Comprehensive Quran Education for{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Every Age
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From learning the Arabic alphabet to becoming a Hafiz, we offer structured courses 
            designed by scholars to make Quran learning effective and enjoyable.
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.title}
              className="group relative overflow-hidden border-2 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${colorClasses[course.color as keyof typeof colorClasses]} flex items-center justify-center transition-colors duration-300 group-hover:text-white`}
                  >
                    <course.icon className="w-7 h-7" />
                  </div>
                  <Badge className={badgeClasses[course.color as keyof typeof badgeClasses]}>
                    {course.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-emerald-600 transition-colors">
                  {course.title}
                </CardTitle>
                <CardDescription className="text-base">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-3 py-1 bg-muted rounded-full text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </CardContent>
              {/* Hover Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-6 h-6 text-emerald-600" />
              <span className="text-3xl font-bold">24/7</span>
            </div>
            <p className="text-muted-foreground">Class Availability</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span className="text-3xl font-bold">50+</span>
            </div>
            <p className="text-muted-foreground">Countries Served</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <GraduationCap className="w-6 h-6 text-emerald-600" />
              <span className="text-3xl font-bold">100+</span>
            </div>
            <p className="text-muted-foreground">Hafiz Graduated</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              <span className="text-3xl font-bold">98%</span>
            </div>
            <p className="text-muted-foreground">Parent Satisfaction</p>
          </div>
        </div>
      </div>
    </section>
  );
}
