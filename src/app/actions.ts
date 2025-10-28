'use server';
/**
 * @fileoverview Server actions for the AI Mentor feature.
 */
import { z } from 'zod';
import { mentorFlow } from '@/ai/flows/mentor-flow';
import { updateDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { adminApp } from '@/firebase/admin';

// Initialize Firestore from the admin app
const db = getFirestore(adminApp);

const formSchema = z.object({
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
  const validatedFields = formSchema.safeParse({
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
    return {
      messages: [],
      error: e.message || 'Failed to get response from AI mentor. Please try again.',
      currentStage: currentStage,
    };
  }
}
