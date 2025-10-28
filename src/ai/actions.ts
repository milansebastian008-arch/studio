
'use server';

/**
 * @fileoverview This file contains the server-side action for the AI mentor chat.
 * It is marked with 'use server' and exports an async function to be called from client components.
 */

import { mentorFlow, type MentorFlowInput, type MentorFlowOutput } from './flows/mentor-flow';

/**
 * A server action that processes the user's message and current conversation stage
 * to generate the next response from the AI mentor.
 */
export async function getMentorResponse(
  input: MentorFlowInput
): Promise<MentorFlowOutput> {
  // Directly call the Genkit flow
  return mentorFlow(input);
}
