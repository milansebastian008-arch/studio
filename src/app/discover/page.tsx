'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { StrategyForm } from "@/components/discover/StrategyForm";
import { Sparkles } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';


export default function DiscoverPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const transactionsCollectionRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'transactions');
    }, [firestore, user]);

    const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsCollectionRef);

    const isLoading = isUserLoading || isTransactionsLoading;
    const hasPaid = transactions ? transactions.length > 0 : false;

    useEffect(() => {
        if (!isLoading && !hasPaid) {
            router.push('/account');
        }
    }, [isLoading, hasPaid, router]);

    if (isLoading || !hasPaid) {
        return (
             <div className="flex min-h-screen flex-col bg-background">
                <Header />
                <main className="flex-1 container py-10">
                <div className="space-y-4 max-w-3xl mx-auto">
                    <Skeleton className="h-12 w-1/2 mx-auto" />
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-64 w-full mt-16" />
                </div>
                </main>
                <Footer />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1">
                <section className="py-20 md:py-32">
                    <div className="container max-w-3xl mx-auto">
                        <div className="text-center">
                            <div className="inline-flex bg-primary/10 p-3 rounded-lg mb-4">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Your Personal AI Wealth Strategist</h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Get AI-generated strategies tailored to your unique financial situation and goals. Our tool analyzes your input against current market trends to provide actionable steps for wealth creation.
                            </p>
                        </div>
                        <div className="mt-16">
                           <StrategyForm />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
