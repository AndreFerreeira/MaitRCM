'use server';

/**
 * @fileOverview Identifies the key functions of a piece of equipment based on its tag and description.
 *
 * - identifyEquipmentFunctions - A function that takes equipment tag and description and returns the identified functions.
 * - IdentifyEquipmentFunctionsInput - The input type for the identifyEquipmentFunctions function.
 * - IdentifyEquipmentFunctionsOutput - The return type for the identifyEquipmentFunctions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyEquipmentFunctionsInputSchema = z.object({
  equipmentTag: z.string().describe('The tag or identifier of the equipment.'),
  equipmentDescription: z.string().describe('A short descriptive text of the equipment.'),
});
export type IdentifyEquipmentFunctionsInput = z.infer<typeof IdentifyEquipmentFunctionsInputSchema>;

const IdentifyEquipmentFunctionsOutputSchema = z.object({
  functions: z.array(z.string()).describe('A list of key functions performed by the equipment.'),
});
export type IdentifyEquipmentFunctionsOutput = z.infer<typeof IdentifyEquipmentFunctionsOutputSchema>;

export async function identifyEquipmentFunctions(
  input: IdentifyEquipmentFunctionsInput
): Promise<IdentifyEquipmentFunctionsOutput> {
  return identifyEquipmentFunctionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyEquipmentFunctionsPrompt',
  input: {schema: IdentifyEquipmentFunctionsInputSchema},
  output: {schema: IdentifyEquipmentFunctionsOutputSchema},
  prompt: `You are an expert maintenance technician tasked with identifying the functions of a piece of equipment.

  Based on the equipment tag and description provided, list the key functions that the equipment performs.

  Equipment Tag: {{{equipmentTag}}}
  Equipment Description: {{{equipmentDescription}}}

  Functions:`,
});

const identifyEquipmentFunctionsFlow = ai.defineFlow(
  {
    name: 'identifyEquipmentFunctionsFlow',
    inputSchema: IdentifyEquipmentFunctionsInputSchema,
    outputSchema: IdentifyEquipmentFunctionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
