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

    const basePrompt = `You are a friendly, motivational AI mentor. Your goal is to help users earn online using AI tools.
Your tone is encouraging, witty, and positive. Never give financial or legal advice.
Keep your responses concise and always end with a clear question or next step.
Current User: ${userProfile.name}
`;

    // Stage-specific logic
    switch (stage) {
      case 'GREETING': {
        const { output } = await ai.generate({
          prompt: `${basePrompt}
The user just said "${userMessage}". This is their first interaction.
Check if the user is ready to start. If they say "yes" or similar, move to ONBOARDING_INTEREST.
Otherwise, provide a friendly encouragement and ask if they're ready to begin their journey.`,
          output: {
            schema: z.object({
              response: z.string().describe("Your conversational response."),
              nextStage: MentorStageSchema
            })
          }
        });
        if (!output) throw new Error("AI did not generate a response.");
        
        let messages = [output.response];
        if(output.nextStage === 'ONBOARDING_INTEREST'){
            messages.push("First, what are you passionate about? Choose one or more from this list:\n- Writing\n- Design\n- Marketing\n- Teaching\n- Coding\n- Video\n- Other");
        }
        return { messages, nextStage: output.nextStage };
      }

      case 'ONBOARDING_INTEREST': {
        const { output } = await ai.generate({
          prompt: `${basePrompt}
The user is responding to the interest question. Their message is: "${userMessage}".
Extract their interest(s) from their message.
The available interests are: Writing, Design, Marketing, Teaching, Coding, Video, Other.`,
          output: {
            schema: z.object({
              interest: z.string().describe("The identified interest, comma-separated if multiple."),
              response: z.string().describe("Acknowledge their interest and ask about their goals.")
            })
          }
        });
        if (!output) throw new Error("AI did not generate a response.");

        return {
          messages: [output.response, "Next, what's your main goal? \n- Earn income quickly\n- Learn a new skill deeply\n- Build a side project for freedom"],
          nextStage: 'ONBOARDING_GOAL',
          updatedProfile: { interest: output.interest },
        };
      }

      case 'ONBOARDING_GOAL': {
        const { output } = await ai.generate({
            prompt: `${basePrompt}
User's Interest: ${userProfile.interest}.
The user is responding to the goal question. Their message is: "${userMessage}".
Extract their goal from the message.
The available goals are: Fast Income, Deep Learning, Freedom Building.`,
            output: {
              schema: z.object({
                goal: z.string().describe("The identified goal."),
                response: z.string().describe("Acknowledge their goal and suggest a path.")
              })
            }
        });
        if (!output) throw new Error("AI did not generate a response.");

        const incomePaths: Record<string, string> = {
            'Writing': 'Freelance writing using AI assistants.',
            'Design': 'Creating Print-on-Demand products with AI art.',
            'Marketing': 'Managing social media with AI-generated content.',
            'Teaching': 'Building an online course with AI-powered tools.',
            'Coding': 'Developing AI automations or simple web apps.',
            'Video': 'Creating viral YouTube Shorts with AI video tools.'
        };

        const primaryInterest = userProfile.interest.split(',')[0].trim();
        const recommendedPath = incomePaths[primaryInterest] || 'General content creation with AI tools.';
        
        return {
          messages: [output.response, `Based on your interest in ${primaryInterest}, I recommend this path: **${recommendedPath}**`, `Would you like to start with this path?`],
          nextStage: 'PATH_SELECTION',
          updatedProfile: { goal: output.goal },
        };
      }

      case 'PATH_SELECTION': {
         const { output } = await ai.generate({
            prompt: `${basePrompt}
User's Profile: ${JSON.stringify(userProfile)}
The user is confirming their chosen path. Their message is: "${userMessage}".
If they confirm, generate an encouraging message and tell them you're creating their 7-day plan.
If they decline, ask what they'd prefer to focus on instead.`,
            output: {
                schema: z.object({
                    confirmed: z.boolean(),
                    response: z.string().describe("Your conversational response."),
                })
            }
         });
         if (!output) throw new Error("AI did not generate a response.");

         if (output.confirmed) {
             // In a real scenario, we would generate a detailed plan here.
             const plan = `Here is your 7-day starter plan:
- Day 1: Watch a 10-min intro video on your chosen path.
- Day 2: Create an account on a relevant platform (e.g., Fiverr, YouTube).
- Day 3: Use an AI tool to generate your first piece of content.
- Day 4: Refine and improve your creation.
- Day 5: Create a simple portfolio or profile.
- Day 6: Share your work with one person.
- Day 7: Review your week and plan the next step.`;
             return {
                 messages: [output.response, plan, "Let's start with Day 1! Let me know when you've completed it."],
                 nextStage: 'PROGRESS_UPDATE',
                 updatedProfile: { chosen_path: userProfile.chosen_path || 'Confirmed', progress_score: 0 }
             }
         } else {
             return {
                 messages: [output.response],
                 nextStage: 'PATH_SELECTION',
             }
         }
      }

      default:
        return {
          messages: ["I'm not sure how to handle that stage yet. Let's start over. What are you interested in?"],
          nextStage: 'ONBOARDING_INTEREST',
        };
    }
  }
);
