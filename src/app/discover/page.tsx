
'use client';

import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import AIMentorChat from '@/components/discover/AIMentorChat';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Disable SSR for this page to prevent hydration mismatches with dynamic chat components.
export const ssr = false;

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
                    <AIMentorChat />
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
