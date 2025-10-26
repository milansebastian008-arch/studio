import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 'testimonial-1',
    name: 'Aarav P.',
    location: 'Bangalore',
    quote: 'This guide completely changed my perspective on money. The mindset hacks are pure gold. I recovered the cost in the first week with a new side hustle idea!',
  },
  {
    id: 'testimonial-2',
    name: 'Priya K.',
    location: 'Mumbai',
    quote: 'I was skeptical at first, but for ₹50, I gave it a shot. Best decision ever. The daily habits have made me more productive and focused than I\'ve been in years.',
  },
  {
    id: 'testimonial-3',
    name: 'Rohan S.',
    location: 'Delhi',
    quote: 'Simple, practical, and straight to the point. No fluff. The section on wealth strategies for the Indian market is something you won\'t find anywhere else.',
  },
];

export default function Testimonials() {
  const testimonialImages = PlaceHolderImages.filter(p => p.id.startsWith('testimonial-'));

  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Loved by Ambitious Achievers</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Don't just take our word for it. Here's what our users have to say about their journey with Success Pathway.
          </p>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full max-w-4xl mx-auto mt-16"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => {
                const image = testimonialImages.find(img => img.id === testimonial.id);
                return (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                            <Card className="flex flex-col justify-between h-full shadow-sm">
                                <CardContent className="p-6 flex flex-col items-start gap-4">
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-accent text-accent" />)}
                                    </div>
                                    <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                                    <div className="flex items-center gap-4 pt-4">
                                        {image && (
                                            <Image
                                                src={image.imageUrl}
                                                alt={image.description}
                                                data-ai-hint={image.imageHint}
                                                width={48}
                                                height={48}
                                                className="rounded-full"
                                            />
                                        )}
                                        <div>
                                            <p className="font-semibold">{testimonial.name}</p>
                                            <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                )
            })}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
