
'use server';
/**
 * @fileoverview Server actions for payment handling.
 */
import { z } from 'zod';
import { updateDoc, doc, setDoc, getDoc, collection, serverTimestamp, runTransaction, query, where, getDocs, limit } from 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/firebase/admin';

// Initialize Firestore from the admin app
const db = getFirestore(adminApp);

const paymentFormSchema = z.object({
    userId: z.string(),
    paymentId: z.string(),
    amount: z.string(),
});

export async function handleSuccessfulPayment(prevState: any, formData: FormData) {
    const validatedFields = paymentFormSchema.safeParse({
        userId: formData.get('userId'),
        paymentId: formData.get('paymentId'),
        amount: formData.get('amount'),
    });

    if (!validatedFields.success) {
        return {
            error: "Invalid payment data received."
        };
    }

    const { userId, paymentId, amount } = validatedFields.data;
    
    const userRef = doc(db, 'users', userId);
    const transactionRef = doc(collection(userRef, 'transactions'), paymentId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw new Error("User does not exist.");
            }

            // 1. Create transaction record
            transaction.set(transactionRef, {
                id: paymentId,
                userId: userId,
                productId: 'Success_Pathway_Guide',
                transactionDate: serverTimestamp(),
                amount: parseFloat(amount),
                paymentGatewayTransactionId: paymentId
            });

            // 2. Check for referral and create referral record if applicable
            const userData = userDoc.data();
            if (userData.referredBy) {
                // Find the referrer by their referral code
                const usersCollection = collection(db, 'users');
                const referrerQuery = query(usersCollection, where('referralCode', '==', userData.referredBy), limit(1));
                const referrerSnapshot = await getDocs(referrerQuery);

                if (!referrerSnapshot.empty) {
                    const referrerDoc = referrerSnapshot.docs[0];
                    const referrerId = referrerDoc.id;

                    // Create the referral document
                    const newReferralRef = doc(collection(db, 'referrals'));
                    transaction.set(newReferralRef, {
                        id: newReferralRef.id,
                        referrerId: referrerId,
                        referredUserId: userId,
                        transactionId: paymentId,
                        referralDate: serverTimestamp(),
                        commissionAmount: 10, // 10 INR commission
                    });
                } else {
                    console.log(`Referrer with code ${userData.referredBy} not found.`);
                }
            }
        });
        
        return { error: null };

    } catch (e: any) {
        console.error("handleSuccessfulPayment Error:", e);
        return {
            error: e.message || "Failed to process payment on the backend."
        };
    }
}
