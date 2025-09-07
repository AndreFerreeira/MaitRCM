'use server';

/**
 * @fileOverview Generates a maintenance plan for a given piece of equipment.
 *
 * - generateMaintenancePlan - A function that generates a maintenance plan.
 * - GenerateMaintenancePlanInput - The input type for the generateMaintenancePlan function.
 * - GenerateMaintenancePlanOutput - The return type for the generateMaintenancePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMaintenancePlanInputSchema = z.object({
  equipmentTag: z.string().describe('The tag of the equipment.'),
  equipmentDescription: z.string().describe('A short description of the equipment.'),
  equipmentFunctions: z.string().describe('A list of the critical functions of the equipment.'),
  failureModes: z.string().describe('A list of the most probable failure modes of the equipment, incorporating failure consequence.'),
  consequenceAssessment: z.string().describe('The potential consequences of each failure mode across safety, environmental impact, production, and cost dimensions.'),
});

export type GenerateMaintenancePlanInput = z.infer<typeof GenerateMaintenancePlanInputSchema>;

const GenerateMaintenancePlanOutputSchema = z.object({
  maintenancePlan: z.string().describe('A detailed maintenance plan specifying maintenance type, frequency, and a brief explanation of how to perform each task.'),
});

export type GenerateMaintenancePlanOutput = z.infer<typeof GenerateMaintenancePlanOutputSchema>;

export async function generateMaintenancePlan(input: GenerateMaintenancePlanInput): Promise<GenerateMaintenancePlanOutput> {
  return generateMaintenancePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMaintenancePlanPrompt',
  input: {schema: GenerateMaintenancePlanInputSchema},
  output: {schema: GenerateMaintenancePlanOutputSchema},
  prompt: `You are an expert maintenance engineer.

You will use the provided information to generate a detailed maintenance plan for the equipment.

Equipment Tag: {{{equipmentTag}}}
Equipment Description: {{{equipmentDescription}}}
Equipment Functions: {{{equipmentFunctions}}}
Failure Modes: {{{failureModes}}}
Consequence Assessment: {{{consequenceAssessment}}}

Generate a maintenance plan specifying maintenance type (preventive, corrective, etc.), frequency, and a brief explanation of how to perform each task.
`,
});

const generateMaintenancePlanFlow = ai.defineFlow(
  {
    name: 'generateMaintenancePlanFlow',
    inputSchema: GenerateMaintenancePlanInputSchema,
    outputSchema: GenerateMaintenancePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
