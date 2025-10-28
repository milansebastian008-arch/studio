'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { AIMentorChat } from "@/components/discover/AIMentorChat";
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
    
    // Derived hasPaid from transactions data
    const hasPaid = !isLoading && transactions ? transactions.length > 0 : false;

    useEffect(() => {
        // If loading is finished and user has not paid, redirect.
        if (!isLoading && !hasPaid) {
            if (user) {
                // If user is logged in but hasn't paid, go to account page.
                router.push('/account');
            } else {
                // If no user, go to login.
                router.push('/login');
            }
        }
    }, [isLoading, hasPaid, user, router]);

    if (isLoading || !hasPaid) {
        return (
             <div className="flex min-h-screen flex-col bg-background">
                <Header />
                <main className="flex-1 container py-10">
                    <div className="space-y-4 max-w-3xl mx-auto">
                        <Skeleton className="h-12 w-1/2 mx-auto" />
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-96 w-full mt-16" />
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
                <section className="py-12 md:py-20">
                    <div className="container max-w-3xl mx-auto">
                        <AIMentorChat />
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
