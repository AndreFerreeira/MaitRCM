// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting maintenance tasks based on identified failure modes.
 *
 * It includes:
 * - `suggestMaintenanceTasks`: A function to trigger the maintenance task suggestion flow.
 * - `SuggestMaintenanceTasksInput`: The input type for the suggestMaintenanceTasks function.
 * - `SuggestMaintenanceTasksOutput`: The output type for the suggestMaintenanceTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMaintenanceTasksInputSchema = z.object({
  equipmentName: z.string().describe('The name of the equipment to analyze.'),
  failureModes: z.array(z.string()).describe('A list of identified failure modes for the equipment.'),
});
export type SuggestMaintenanceTasksInput = z.infer<typeof SuggestMaintenanceTasksInputSchema>;

const SuggestMaintenanceTasksOutputSchema = z.object({
  maintenanceTasks: z.array(
    z.object({
      task: z.string().describe('A description of the maintenance task.'),
      type: z.string().describe('The type of maintenance (preventive, predictive, corrective).'),
      frequency: z.string().describe('The recommended frequency for the maintenance task.'),
      explanation: z.string().describe('Explanation of how to perform the task and why it is important.'),
    })
  ).describe('A list of suggested maintenance tasks.'),
});
export type SuggestMaintenanceTasksOutput = z.infer<typeof SuggestMaintenanceTasksOutputSchema>;

export async function suggestMaintenanceTasks(input: SuggestMaintenanceTasksInput): Promise<SuggestMaintenanceTasksOutput> {
  return suggestMaintenanceTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMaintenanceTasksPrompt',
  input: {schema: SuggestMaintenanceTasksInputSchema},
  output: {schema: SuggestMaintenanceTasksOutputSchema},
  prompt: `You are an expert reliability engineer. Based on the identified failure modes for a piece of equipment, you will suggest appropriate maintenance tasks to prevent or detect these failures.

Equipment: {{{equipmentName}}}

Failure Modes:
{{#each failureModes}}
- {{{this}}}
{{/each}}

Suggest maintenance tasks, including the task description, type (preventive, predictive, or corrective), recommended frequency, and a brief explanation of how to perform the task and why it is important.

Your output should be a JSON array of maintenance tasks:
`,
});

const suggestMaintenanceTasksFlow = ai.defineFlow(
  {
    name: 'suggestMaintenanceTasksFlow',
    inputSchema: SuggestMaintenanceTasksInputSchema,
    outputSchema: SuggestMaintenanceTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
