
'use server';
/**
 * @fileoverview Server actions for the AI Mentor and payment handling.
 */
import { z } from 'zod';
import { mentorFlow } from '@/ai/flows/mentor-flow';
import { updateDoc, doc, setDoc, getDoc, collection, serverTimestamp, runTransaction, query, where, getDocs, limit } from 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/firebase/admin';

// Initialize Firestore from the admin app
const db = getFirestore(adminApp);

const mentorFormSchema = z.object({
  userId: z.string(),
  currentStage: z.enum([
    'GREETING',
    'ONBOARDING_INTEREST',
    'ONBOARDING_GOAL',
    'PATH_SELECTION',
    'ACTION_PLAN',
    'PROGRESS_UPDATE',
    'COMPLETE',
  ]),
  userMessage: z.string(),
  userProfile: z.any(),
});

export async function getMentorResponse(prevState: any, formData: FormData) {
  const validatedFields = mentorFormSchema.safeParse({
    userId: formData.get('userId'),
    currentStage: formData.get('currentStage'),
    userMessage: formData.get('userMessage'),
    userProfile: JSON.parse(formData.get('userProfile') as string),
  });

  if (!validatedFields.success) {
    return {
      messages: [],
      error: validatedFields.error.flatten().fieldErrors,
      currentStage: prevState.currentStage,
    };
  }

  const { userId, userMessage, userProfile, currentStage } = validatedFields.data;

  try {
    const result = await mentorFlow({
      stage: currentStage,
      userMessage: userMessage,
      userProfile: userProfile,
    });

    // Update user profile in Firestore if there's new data
    if (result.updatedProfile) {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, result.updatedProfile);
    }
    
    return {
      messages: result.messages,
      error: null,
      currentStage: result.nextStage,
    };

  } catch (e: any) {
    console.error("Error in getMentorResponse:", e);
    return {
      messages: [],
      error: e.message || 'Failed to get response from AI mentor. Please try again.',
      currentStage: currentStage,
    };
  }
}


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
