'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized wealth strategies.
 *
 * It takes user responses and current affairs as input, and provides AI-generated
 * strategies for actionable wealth building steps.
 *
 * - personalizedWealthStrategies - The main function to generate personalized wealth strategies.
 * - PersonalizedWealthStrategiesInput - The input type for the personalizedWealthStrategies function.
 * - PersonalizedWealthStrategiesOutput - The output type for the personalizedWealthStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedWealthStrategiesInputSchema = z.object({
  userResponses: z.string().describe('User responses to a questionnaire about their financial situation and goals.'),
  currentAffairs: z.string().describe('A summary of current affairs and market trends.'),
});
export type PersonalizedWealthStrategiesInput = z.infer<typeof PersonalizedWealthStrategiesInputSchema>;

const PersonalizedWealthStrategiesOutputSchema = z.object({
  wealthStrategies: z.string().describe('AI-generated wealth strategies tailored to the user and current market conditions.'),
});
export type PersonalizedWealthStrategiesOutput = z.infer<typeof PersonalizedWealthStrategiesOutputSchema>;

export async function personalizedWealthStrategies(input: PersonalizedWealthStrategiesInput): Promise<PersonalizedWealthStrategiesOutput> {
  return personalizedWealthStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedWealthStrategiesPrompt',
  input: {schema: PersonalizedWealthStrategiesInputSchema},
  output: {schema: PersonalizedWealthStrategiesOutputSchema},
  prompt: `You are an AI assistant designed to provide personalized wealth strategies to users based on their individual circumstances and current market conditions.

  Consider the following information provided by the user:
  User Responses: {{{userResponses}}}

  Also, take into account these current affairs and market trends:
  Current Affairs: {{{currentAffairs}}}

  Based on this information, generate actionable wealth strategies that the user can implement to build wealth. Provide specific and practical advice.
  Wealth Strategies: `,
});

const personalizedWealthStrategiesFlow = ai.defineFlow(
  {
    name: 'personalizedWealthStrategiesFlow',
    inputSchema: PersonalizedWealthStrategiesInputSchema,
    outputSchema: PersonalizedWealthStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
