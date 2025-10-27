
import { Suspense } from 'react';
import SignupForm from './SignupForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function SignupSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 font-bold text-2xl mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>Millionaire Mindset</span>
          </Link>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Join our community and start your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<SignupSkeleton />}>
            <SignupForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
