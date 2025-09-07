
'use server';

import { ai } from '@/ai/genkit';
import { identifyEquipmentFunctions, type IdentifyEquipmentFunctionsOutput } from '@/ai/flows/identify-equipment-functions';
import { generateMaintenancePlan, type GenerateMaintenancePlanOutput } from '@/ai/flows/generate-maintenance-plan';
import { suggestMaintenanceTasks, type SuggestMaintenanceTasksOutput } from '@/ai/flows/suggest-maintenance-tasks';
import { z } from 'zod';

// Etapa 1: Identificar Funções do Equipamento
export async function getFunctionsAction(data: { equipmentTag: string; equipmentDescription: string }): Promise<IdentifyEquipmentFunctionsOutput> {
  return await identifyEquipmentFunctions(data);
}

// Etapa 2: Análise de Modos de Falha
const FailureModesSchema = z.object({
  failureModes: z.array(z.string()).describe("Uma lista de modos de falha prováveis com base nas funções do equipamento."),
});

const failureModePrompt = ai.definePrompt({
  name: 'failureModePrompt',
  input: { schema: z.object({ equipmentName: z.string(), functions: z.array(z.string()) }) },
  output: { schema: FailureModesSchema },
  prompt: `Você é um engenheiro de confiabilidade especialista. Para um equipamento chamado "{{equipmentName}}" que executa as seguintes funções, liste os modos de falha mais prováveis.

  Funções:
  {{#each functions}}
  - {{this}}
  {{/each}}
  
  Por favor, forneça apenas a lista de modos de falha.`,
});

export async function getFailureModesAction(data: { equipmentName: string; functions: string[] }): Promise<string[]> {
  const { output } = await failureModePrompt(data);
  return output?.failureModes || [];
}

// Etapa 3: Avaliação de Consequências
const ConsequenceAssessmentSchema = z.object({
  assessment: z.string().describe("Uma avaliação detalhada das consequências para os modos de falha apresentados, abrangendo segurança, impacto ambiental, produção e custos, formatada em markdown."),
});

const consequenceAssessmentPrompt = ai.definePrompt({
  name: 'consequenceAssessmentPrompt',
  input: { schema: z.object({ failureModes: z.array(z.string()) }) },
  output: { schema: ConsequenceAssessmentSchema },
  prompt: `Para os seguintes modos de falha, forneça uma avaliação detalhada de suas potenciais consequências. Considere segurança, impacto ambiental, perda de produção e custos de reparo. Estruture a saída como um texto legível em formato markdown, usando títulos e listas para organizar as informações de forma clara para cada modo de falha.

  Modos de Falha:
  {{#each failureModes}}
  - {{this}}
  {{/each}}
  `
});

export async function getConsequenceAssessmentAction(data: { failureModes:string[] }): Promise<string> {
    const { output } = await consequenceAssessmentPrompt(data);
    return output?.assessment || "Nenhuma avaliação gerada.";
}

// Etapa 4: Sugerir Tarefas de Manutenção
export async function getSuggestedTasksAction(data: { equipmentName: string; failureModes: string[] }): Promise<SuggestMaintenanceTasksOutput> {
    return await suggestMaintenanceTasks(data);
}


// Etapa 5: Gerar Plano Final
export async function generateFinalPlanAction(data: {
  equipmentTag: string;
  equipmentDescription: string;
  equipmentFunctions: string;
  failureModes: string;
  consequenceAssessment: string;
  manualContent?: string;
}): Promise<GenerateMaintenancePlanOutput> {
  return await generateMaintenancePlan(data);
}

    
