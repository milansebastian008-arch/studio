import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, BrainCircuit, HeartHandshake, NotebookText, Sparkles, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: 'Proven Wealth Strategies',
    description: 'Actionable, real-world strategies to grow your income and investments, tailored for the Indian market.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: 'The Law of Attraction',
    description: 'Learn how to manifest your financial goals by aligning your thoughts and energy with abundance.',
  },
  {
    icon: <NotebookText className="h-8 w-8 text-primary" />,
    title: 'Powerful Daily Habits',
    description: 'Incorporate simple yet effective habits that build momentum towards your long-term success.',
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: 'Millionaire Mindset Hacks',
    description: 'Rewire your brain for success. Overcome limiting beliefs and cultivate a mindset of growth and opportunity.',
  },
  {
    icon: <HeartHandshake className="h-8 w-8 text-primary" />,
    title: 'Real-Life Success Stories',
    description: 'Get inspired by stories of ordinary people from India who achieved extraordinary financial success.',
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: 'Weekly Reflection Tools',
    description: 'Stay accountable and track your progress with tools designed to promote continuous self-improvement.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything You Need to Succeed</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our guide is packed with invaluable knowledge and practical tools to fast-track your journey to wealth.
          </p>
        </div>
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="flex flex-col items-start p-6 text-left hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="bg-primary/10 p-3 rounded-lg">
                    {feature.icon}
                </div>
                <CardTitle className="mt-4 text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription className="mt-2 text-base">
                {feature.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
