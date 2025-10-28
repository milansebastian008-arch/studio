
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Mentor() {
  const mentorImage = PlaceHolderImages.find(p => p.id === 'mentor-photo');

  return (
    <section id="mentor" className="py-20 md:py-32 bg-card">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Meet Your Personal AI Mentor</h2>
          <p className="mt-4 text-lg text-muted-foreground">
           Get personalized guidance on your journey to financial freedom, powered by cutting-edge AI.
          </p>
        </div>
        <Card className="mt-16 overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 md:p-12">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">Guidance, Anytime You Need It</h3>
                    <p className="mt-6 text-muted-foreground text-lg">
                       "Our AI Mentor, 'M', is trained on the core principles of the Millionaire Mindset. It's here to help you clarify your goals, overcome obstacles, and stay motivated. It's like having a personal coach in your pocket, available 24/7 to help you take the next step on your journey to a million."
                    </p>
                     <p className="mt-6 font-semibold text-primary"> - R. Sharma, Founder of Millionaire Mindset</p>
                     <Button asChild size="lg" className="mt-8">
                        <Link href="/discover">Chat with Mentor <ArrowRight className="ml-2 h-5 w-5"/></Link>
                     </Button>
                </div>
                <div className="h-64 md:h-full w-full">
                    {mentorImage && (
                        <Image
                            src={mentorImage.imageUrl}
                            alt={mentorImage.description}
                            data-ai-hint={mentorImage.imageHint}
                            width={400}
                            height={400}
                            className="object-cover w-full h-full"
                        />
                    )}
                </div>
            </div>
        </Card>
      </div>
    </section>
  );
}
