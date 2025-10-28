
'use server';
/**
 * @fileoverview Server actions for the AI Mentor and payment handling.
 */
import { z } from 'zod';
import { mentorFlow } from '@/ai/flows/mentor-flow';
import { updateDoc, doc, setDoc, getDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
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
                // In a real app, you'd query for the user with this referral code.
                // For now, we assume the referredBy code belongs to a valid user.
                // This is a simplified lookup for demonstration.
                const referralsRef = collection(db, 'referrals');
                const newReferralRef = doc(referralsRef);
                
                // We'd need a query to find the referrer's UID from their code.
                // This part is complex without a reverse lookup collection.
                // For now, we will log that a referral was made, but crediting is a TODO.
                console.log(`Referral detected for user ${userId} by code ${userData.referredBy}. Crediting logic needed.`);
                
                // Example of what creating the referral might look like if we had the referrer's ID
                /*
                transaction.set(newReferralRef, {
                    id: newReferralRef.id,
                    referrerId: "UID_OF_REFERRER", // This needs to be looked up
                    referredUserId: userId,
                    transactionId: paymentId,
                    referralDate: serverTimestamp(),
                    commissionAmount: 10, // 10 INR commission
                });
                */
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
