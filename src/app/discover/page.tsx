
import { Suspense } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import AIMentorChat from '@/components/discover/AIMentorChat';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Disable SSR for this page to prevent hydration mismatches with dynamic chat components.
export const ssr = false;

function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-4 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="flex items-start justify-end gap-3">
          <div className="flex-1 space-y-2 text-right">
            <Skeleton className="h-4 w-3/4 ml-auto" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="p-4 border-t">
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 container py-10">
        <div className="max-w-3xl mx-auto">
           <Card className="h-[70vh] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-2xl">Your Personal AI Mentor</CardTitle>
                    <CardDescription>Chat with 'M' to get guidance on your financial and personal growth goals.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                    <Suspense fallback={<ChatSkeleton />}>
                        <AIMentorChat />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
