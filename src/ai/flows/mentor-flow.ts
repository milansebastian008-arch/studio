
'use server';
/**
 * @fileOverview This file defines the Genkit flow for the AI Mentor.
 * It orchestrates the multi-stage conversation with the user, guiding them
 * from interest discovery to monetization.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';


// Define the stages of the conversation
const MentorStageSchema = z.enum([
  'GREETING',
  'ONBOARDING_INTEREST',
  'ONBOARDING_GOAL',
  'PATH_SELECTION',
  'ACTION_PLAN',
  'PROGRESS_UPDATE',
  'COMPLETE',
]);

const MentorFlowInputSchema = z.object({
  stage: MentorStageSchema,
  userMessage: z.string().describe('The latest message from the user.'),
  userProfile: z.any().describe('The user\'s profile data from Firestore, including name, interests, goals, etc.'),
});

const MentorFlowOutputSchema = z.object({
  messages: z.array(z.string()).describe('A list of messages for the AI to send to the user.'),
  nextStage: MentorStageSchema.describe('The next stage in the conversation.'),
  updatedProfile: z.record(z.any()).optional().describe('An object with user profile fields to update in Firestore.'),
});

export async function mentorFlow(input: z.infer<typeof MentorFlowInputSchema>): Promise<z.infer<typeof MentorFlowOutputSchema>> {
  return mentorAIFlow(input);
}

const mentorAIFlow = ai.defineFlow(
  {
    name: 'mentorAIFlow',
    inputSchema: MentorFlowInputSchema,
    outputSchema: MentorFlowOutputSchema,
  },
  async (input) => {
    const { stage, userMessage, userProfile } = input;

    const basePrompt = `You are a friendly, motivational AI mentor named 'Mindy'. Your goal is to help users earn online using AI tools.
Your tone is encouraging, witty, and positive. Never give financial or legal advice.
Keep your responses concise and always end with a clear question or next step.
Current User: ${userProfile.name}
User's Profile Data: ${JSON.stringify(userProfile)}
`;

    // Stage-specific logic
    switch (stage) {
      case 'GREETING': {
        return { 
          messages: [
            "🚀 Welcome to Millionaire Mindset! Let’s unlock your path to success — tell me about yourself or your idea so we can build your first earning plan.",
            "To start, what are you passionate about? You can pick one or more.\n- Writing\n- Design\n- Marketing\n- Teaching\n- Coding\n- Video\n- Other"
          ], 
          nextStage: 'ONBOARDING_INTEREST' 
        };
      }

      case 'ONBOARDING_INTEREST': {
        // First, extract the interest
        const { output: interestOutput } = await ai.generate({
            model: 'googleai/gemini-pro',
            prompt: `From the user's message, extract the category of their interest. The categories are: Writing, Design, Marketing, Teaching, Coding, Video, Other. Return ONLY the category name(s), comma-separated if multiple. User message: "${userMessage}"`,
            output: {
                schema: z.string().describe("The identified interest, comma-separated if multiple."),
            }
        });
        if (!interestOutput) throw new Error("AI could not identify the interest.");
        
        return {
          messages: ["Awesome choice! That's a field with a ton of potential.", "Got it! Now, what's your main goal with this?\n- Earn income quickly\n- Learn a new skill deeply\n- Build a side project for freedom"],
          nextStage: 'ONBOARDING_GOAL',
          updatedProfile: { interest: interestOutput },
        };
      }

      case 'ONBOARDING_GOAL': {
        // First, extract the goal
        const { output: goalOutput } = await ai.generate({
            model: 'googleai/gemini-pro',
            prompt: `From the user's message, extract which of these goals they chose: 'Earn income quickly', 'Learn a new skill deeply', or 'Build a side project for freedom'. Return a short summary like 'Fast Income', 'Deep Learning', or 'Freedom Building'. User message: "${userMessage}"`,
            output: {
              schema: z.string().describe("The identified goal (e.g., 'Fast Income', 'Deep Learning', 'Freedom Building')."),
            }
        });
        if (!goalOutput) throw new Error("AI could not identify the goal.");
        
        const incomePaths: Record<string, string> = {
            'Writing': 'Freelance writing using AI assistants.',
            'Design': 'Creating Print-on-Demand products with AI art.',
            'Marketing': 'Managing social media with AI-generated content.',
            'Teaching': 'Building an online course with AI-powered tools.',
            'Coding': 'Developing AI automations or simple web apps.',
            'Video': 'Creating viral YouTube Shorts with AI video tools.',
            'Other': 'General content creation with AI tools.'
        };

        const primaryInterest = (userProfile.interest || 'Writing').split(',')[0].trim();
        const recommendedPath = incomePaths[primaryInterest] || incomePaths['Other'];
        
        return {
          messages: [`Great goal! Based on your interest in ${primaryInterest}, I've found a path for you.`, `I recommend this to start: **${recommendedPath}**`, `This is a great starting point. Would you like me to create a 7-day action plan for this path?`],
          nextStage: 'PATH_SELECTION',
          updatedProfile: { goal: goalOutput, recommended_path: recommendedPath },
        };
      }

      case 'PATH_SELECTION': {
         const { output } = await ai.generate({
            model: 'googleai/gemini-pro',
            prompt: `${basePrompt}
The user is confirming their chosen path. Their message is: "${userMessage}".
Analyze if their message is a confirmation (e.g., "yes", "sounds good", "ok", "let's do it").
If they confirm, respond with an enthusiastic "Alright, let's do this! Generating your 7-day plan now...".
If they decline or suggest something else, respond with "No problem! What would you prefer to focus on instead?".`,
            output: {
                schema: z.object({
                    confirmed: z.boolean(),
                    response: z.string().describe("Your conversational response."),
                })
            }
         });
         if (!output) throw new Error("AI did not generate a response.");

         if (output.confirmed) {
             const plan = `Here is your 7-day starter plan for **${userProfile.recommended_path}**:
- **Day 1:** Watch a 10-min intro video on your chosen path & pick one AI tool.
- **Day 2:** Create an account on a relevant platform (e.g., Fiverr, Redbubble, YouTube).
- **Day 3:** Use an AI tool to generate your first piece of content (an article, a design, a video script).
- **Day 4:** Refine and improve your creation. Get feedback if you can!
- **Day 5:** Create a simple one-page portfolio or profile to showcase your work.
- **Day 6:** Share your work with one person or on one social media platform.
- **Day 7:** Review your week, note what you learned, and plan one small next step.`;
             return {
                 messages: [output.response, plan, "Let's start with Day 1! I'll be here to track your progress. Let me know when you've completed a task."],
                 nextStage: 'PROGRESS_UPDATE',
                 updatedProfile: { chosen_path: userProfile.recommended_path, progress_score: 0 }
             }
         } else {
             return {
                 messages: [output.response],
                 nextStage: 'PATH_SELECTION', // Let them choose again
             }
         }
      }
      
      case 'PROGRESS_UPDATE': {
        const { output } = await ai.generate({
          model: 'googleai/gemini-pro',
          prompt: `${basePrompt}
The user is providing an update on their 7-day plan. Their message is: "${userMessage}".
Analyze their message to determine if they completed a task.
If they completed a task, provide an encouraging response like "Awesome job! Keep that momentum going!".
If they are stuck, offer help or a motivational tip like "No worries, every expert was once a beginner. What's the specific part you're stuck on?".`,
          output: {
            schema: z.object({
              completedTask: z.boolean().describe("True if the user indicates they completed a task."),
              response: z.string().describe("Your motivational response to their update."),
            }),
          },
        });
        if (!output) throw new Error("AI did not generate a response.");

        const progressIncrement = 14;
        const newProgress = (userProfile.progress_score || 0) + (output.completedTask ? progressIncrement : 0);

        let messages = [output.response];
        if (newProgress >= 98) { // Allow for slight variation, check if they are basically done
            messages.push("You've completed the 7-day plan! That's incredible! You've built some real momentum. Ready to talk about how to monetize this?");
            return {
                messages,
                nextStage: 'COMPLETE',
                updatedProfile: { progress_score: 100 }
            }
        }

        return {
          messages,
          nextStage: 'PROGRESS_UPDATE',
          updatedProfile: { progress_score: Math.min(newProgress, 99) }, // Cap at 99 until monetization
        };
      }

      case 'COMPLETE': {
         const { output } = await ai.generate({
            model: 'googleai/gemini-pro',
            prompt: `${basePrompt}
The user has completed their initial 7-day plan and is ready to monetize.
Their chosen path is '${userProfile.chosen_path}'.
Give them a simple, actionable first step to start earning. For 'Freelance writing', suggest creating a Fiverr gig. For 'Print-on-Demand', suggest an Etsy store listing. For 'YouTube Shorts', suggest setting up their channel profile.
End by asking if they're ready for that step.`,
          });
          if (!output) throw new Error("AI did not generate a response.");

        return {
          messages: [output],
          nextStage: 'COMPLETE', // Stays in this stage for further monetization guidance
          updatedProfile: { monetization_status: true }
        };
      }

      default:
        return {
          messages: ["I seem to be a bit lost. Let's get back on track. What were you passionate about again?"],
          nextStage: 'ONBOARDING_INTEREST',
        };
    }
  }
);
