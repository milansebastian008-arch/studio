'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { useDoc, useCollection } from '@/firebase';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Lock, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

function ReferralCard({ referralCode }: { referralCode: string }) {
  const { toast } = useToast();
  
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    // This ensures window.location.origin is only accessed on the client-side
    setReferralLink(`${window.location.origin}/signup?ref=${referralCode}`);
  }, [referralCode]);

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share & Earn</CardTitle>
        <CardDescription>Share your unique referral link to earn commissions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Input value={referralLink || 'Generating link...'} readOnly />
          <Button variant="outline" size="icon" onClick={handleCopy} disabled={!referralLink}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AIAssistantCard({ hasPaid }: { hasPaid: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Wealth Assistant</CardTitle>
        <CardDescription>Your personal guide to financial freedom.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          {hasPaid
            ? 'Get personalized advice and strategies to kickstart your journey.'
            : 'Purchase the guide to unlock your personal AI assistant.'}
        </p>
        <Button asChild disabled={!hasPaid} className={!hasPaid ? 'cursor-not-allowed' : ''}>
          <Link href={hasPaid ? '/discover' : '#'} aria-disabled={!hasPaid} tabIndex={hasPaid ? undefined : -1}>
            { !hasPaid && <Lock className="mr-2 h-4 w-4" /> }
            Launch Assistant
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function WithdrawalDialog({ onWithdraw, totalCommission }: { onWithdraw: (details: string, amount: number) => void, totalCommission: number }) {
    const [paymentDetails, setPaymentDetails] = useState('');
    const [amount, setAmount] = useState(0);
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
  
    const handleWithdrawClick = () => {
        if (amount < 100) {
            toast({
              variant: 'destructive',
              title: "Withdrawal Failed",
              description: "Minimum withdrawal amount is ₹100.",
            });
            return;
        }
        if (amount > totalCommission) {
            toast({
              variant: 'destructive',
              title: "Withdrawal Failed",
              description: "Requested amount exceeds your available balance.",
            });
            return;
        }
        if (!paymentDetails) {
            toast({
                variant: 'destructive',
                title: "Withdrawal Failed",
                description: "Please provide your UPI ID.",
            });
            return;
        }
        onWithdraw(paymentDetails, amount);
        setOpen(false); // Close the dialog
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button disabled={totalCommission < 100}>
            <IndianRupee className="mr-2 h-4 w-4" /> Withdraw Earnings
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Withdrawal</DialogTitle>
            <DialogDescription>
              Enter your UPI ID and the amount to withdraw. Minimum withdrawal is ₹100.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="upi-id" className="text-right">
                UPI ID
              </Label>
              <Input
                id="upi-id"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="col-span-3"
                placeholder="yourname@bank"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="col-span-3"
                placeholder="100"
                max={totalCommission}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleWithdrawClick}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

function ReferralDashboard({ referrals, onWithdraw }: { referrals: any[], onWithdraw: (details: string, amount: number) => void }) {
  const totalCommission = referrals.reduce((acc, referral) => acc + (referral.commissionAmount || 0), 0);
  const totalReferrals = referrals.length;

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle>Referral Dashboard</CardTitle>
        <CardDescription>Track your referral success and earnings.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <Card className='text-center'>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">₹{totalCommission.toFixed(2)}</CardTitle>
                <CardDescription>Total Earnings</CardDescription>
            </CardHeader>
        </Card>
        <Card className='text-center'>
             <CardHeader>
                <CardTitle className="text-2xl font-bold">{totalReferrals}</CardTitle>
                <CardDescription>Successful Referrals</CardDescription>
            </CardHeader>
        </Card>
         <Card className='text-center bg-transparent border-0 shadow-none md:border md:shadow-sm'>
             <CardHeader>
                <WithdrawalDialog onWithdraw={onWithdraw} totalCommission={totalCommission} />
                <CardDescription className='pt-2'>Minimum withdrawal: ₹100</CardDescription>
             </CardHeader>
        </Card>
      </CardContent>
      <CardContent>
        <h4 className="font-semibold mb-4">Referral History</h4>
        <div className="relative h-64 overflow-auto">
        <Table>
          <TableHeader className='sticky top-0 bg-card'>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Referred User ID</TableHead>
              <TableHead className="text-right">Commission</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <TableRow key={referral.id}>
                  <TableCell>{referral.referralDate ? format(referral.referralDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                  <TableCell className='truncate max-w-xs'>{referral.referredUserId}</TableCell>
                  <TableCell className="text-right">₹{referral.commissionAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">No referrals yet. Share your link to start!</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}


export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const transactionsCollectionRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'transactions');
  }, [firestore, user]);

  const referralsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'referrals'), where('referrerId', '==', user.uid));
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);
  const { data: transactions, isLoading: isTransactionsLoading } = useCollection(transactionsCollectionRef);
  const { data: referrals, isLoading: isReferralsLoading } = useCollection(referralsQuery);

  const isLoading = isUserLoading || isUserDataLoading || isTransactionsLoading || isReferralsLoading;
  
  const hasPaid = transactions ? transactions.length > 0 : false;

  const handleWithdraw = async (paymentDetails: string, amount: number) => {
    if (!user || !firestore) return;
    
    try {
      const withdrawalRequestsRef = collection(firestore, 'withdrawalRequests');
      await addDoc(withdrawalRequestsRef, {
        userId: user.uid,
        amount,
        status: 'pending',
        requestDate: serverTimestamp(),
        paymentDetails,
      });
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your request has been submitted and will be processed soon.",
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: "Request Failed",
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="flex-1 container py-10">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid gap-8 pt-6 md:grid-cols-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-96 w-full md:col-span-2" />
            </div>
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
        <div className="container py-10">
          <h1 className="text-3xl font-bold">Welcome, {userData?.name || user.displayName || 'User'}!</h1>
          <p className="text-muted-foreground">This is your account dashboard.</p>
          
          <div className="grid gap-8 pt-6 md:grid-cols-2">
            <AIAssistantCard hasPaid={hasPaid} />
            {userData?.referralCode && <ReferralCard referralCode={userData.referralCode} />}
            {referrals && <ReferralDashboard referrals={referrals} onWithdraw={handleWithdraw} />}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
