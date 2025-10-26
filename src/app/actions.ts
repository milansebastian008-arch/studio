'use server';

import { personalizedWealthStrategies } from '@/ai/flows/personalized-wealth-strategies';
import { z } from 'zod';

const formSchema = z.object({
  userInfo: z.string().min(50, "Please provide at least 50 characters."),
  riskAppetite: z.enum(["low", "medium", "high"]),
});

export async function getWealthStrategies(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    userInfo: formData.get('userInfo'),
    riskAppetite: formData.get('riskAppetite'),
  });

  if (!validatedFields.success) {
    return {
      data: null,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const userResponses = `User Info: ${validatedFields.data.userInfo}\nRisk Appetite: ${validatedFields.data.riskAppetite}`;
  
  // Hardcode current affairs for this implementation
  const currentAffairs = "The Indian economy shows strong growth in tech and renewable energy. Inflation is a concern, leading to RBI interest rate adjustments. The stock market is volatile but holds long-term opportunities, especially in mid-cap segments. Real estate in Tier-2 cities is appreciating.";

  try {
    const result = await personalizedWealthStrategies({
      userResponses,
      currentAffairs,
    });
    return {
        data: result.wealthStrategies,
        error: null
    };
  } catch (e: any) {
    return { 
        data: null,
        error: e.message || "Failed to generate strategies. Please try again." 
    };
  }
}
