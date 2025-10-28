import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader className="items-center">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/50">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold">
            Congratulations, Future Achiever! 🚀
          </CardTitle>
          <CardDescription className="pt-2 text-base">
            Your guide to wealth and motivation is ready for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You've taken the first step on an incredible journey. Click the button below to download your guide and start building your empire.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button asChild size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <a href="/Success_Pathway_Guide.pdf" download>
              Download Your Guide
            </a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/account">Go to My Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
