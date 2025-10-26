import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';

export default function Mentor() {
  const mentorImage = PlaceHolderImages.find(p => p.id === 'mentor-photo');

  return (
    <section id="mentor" className="py-20 md:py-32 bg-card">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Meet Your Mentor</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Learn from someone who has walked the path and achieved the success you dream of.
          </p>
        </div>
        <Card className="mt-16 overflow-hidden">
            <div className="grid md:grid-cols-2 items-center">
                <div className="p-8 md:p-12">
                    <h3 className="text-2xl font-bold tracking-tight sm:text-3xl">A Message from Our Founder</h3>
                    <p className="mt-6 text-muted-foreground text-lg">
                        "I was once exactly where you are now—full of ambition but unsure of the next step. I made the mistakes so you don't have to. This guide isn't just theory; it's the culmination of years of trial, error, and eventual triumph. My mission is to give you the shortcut to the life you deserve. Your journey to a million starts not with a leap, but with a single, guided step. Let's take it together."
                    </p>
                    <p className="mt-6 font-semibold text-primary"> - R. Sharma, Founder of Millionaire Mindset</p>
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
