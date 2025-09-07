'use server';

import { ai } from '@/ai/genkit';
import { identifyEquipmentFunctions, type IdentifyEquipmentFunctionsOutput } from '@/ai/flows/identify-equipment-functions';
import { suggestMaintenanceTasks, type SuggestMaintenanceTasksOutput } from '@/ai/flows/suggest-maintenance-tasks';
import { generateMaintenancePlan, type GenerateMaintenancePlanOutput } from '@/ai/flows/generate-maintenance-plan';
import { z } from 'zod';

// Step 1: Identify Equipment Functions
export async function getFunctionsAction(data: { equipmentTag: string; equipmentDescription: string }): Promise<IdentifyEquipmentFunctionsOutput> {
  return await identifyEquipmentFunctions(data);
}

// Step 2: Failure Mode Analysis
const FailureModesSchema = z.object({
  failureModes: z.array(z.string()).describe("A list of probable failure modes based on the equipment's functions."),
});

const failureModePrompt = ai.definePrompt({
  name: 'failureModePrompt',
  input: { schema: z.object({ equipmentName: z.string(), functions: z.array(z.string()) }) },
  output: { schema: FailureModesSchema },
  prompt: `You are an expert reliability engineer. For a piece of equipment named "{{equipmentName}}" which performs the following functions, list the most probable failure modes.

  Functions:
  {{#each functions}}
  - {{this}}
  {{/each}}
  
  Please provide only the list of failure modes.`,
});

export async function getFailureModesAction(data: { equipmentName: string; functions: string[] }): Promise<string[]> {
  const { output } = await failureModePrompt(data);
  return output?.failureModes || [];
}

// Step 3: Consequence Assessment
const ConsequenceAssessmentSchema = z.object({
  assessment: z.string().describe("A detailed assessment of consequences for the given failure modes across safety, environmental impact, production, and cost, formatted in markdown."),
});

const consequenceAssessmentPrompt = ai.definePrompt({
  name: 'consequenceAssessmentPrompt',
  input: { schema: z.object({ failureModes: z.array(z.string()) }) },
  output: { schema: ConsequenceAssessmentSchema },
  prompt: `For the following failure modes, provide a detailed assessment of their potential consequences. Consider safety, environmental impact, production loss, and repair costs. Structure the output as a readable text in markdown format.

  Failure Modes:
  {{#each failureModes}}
  - {{this}}
  {{/each}}
  `
});

export async function getConsequenceAssessmentAction(data: { failureModes:string[] }): Promise<string> {
    const { output } = await consequenceAssessmentPrompt(data);
    return output?.assessment || "No assessment generated.";
}


// Step 4: Suggest Maintenance Tasks
export async function getMaintenanceTasksAction(data: { equipmentName: string; failureModes: string[] }): Promise<SuggestMaintenanceTasksOutput> {
  return await suggestMaintenanceTasks({ equipmentName: data.equipmentName, failureModes: data.failureModes });
}

// Step 5: Generate Final Plan
export async function generateFinalPlanAction(data: {
  equipmentTag: string;
  equipmentDescription: string;
  equipmentFunctions: string;
  failureModes: string;
  consequenceAssessment: string;
}): Promise<GenerateMaintenancePlanOutput> {
  return await generateMaintenancePlan(data);
}
