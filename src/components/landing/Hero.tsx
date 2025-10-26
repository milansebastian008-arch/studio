import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full py-20 md:py-32 bg-card overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)] dark:bg-grid-slate-700/40"></div>
        <div className="container relative text-center">
            <div className="mx-auto max-w-3xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    DO YOU DREAM ABOUT MAKING MILLIONS? <span className='inline-block'>💸💭</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                    Discover the synergy of a powerful mindset and bold, strategic action. Our guide is the first step on your journey to unlocking unprecedented success and building lasting wealth.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild size="lg" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg transition-transform hover:scale-105">
                        <Link href="#pricing">Teach Me The Secret!</Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                        <Link href="#features">Learn More</Link>
                    </Button>
                </div>
            </div>
        </div>
    </section>
  );
}
