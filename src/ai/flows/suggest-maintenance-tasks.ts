'use server';

/**
 * @fileOverview Este arquivo define um fluxo Genkit para sugerir tarefas de manutenção com base nos modos de falha identificados.
 *
 * Inclui:
 * - `suggestMaintenanceTasks`: Uma função para acionar o fluxo de sugestão de tarefas de manutenção.
 * - `SuggestMaintenanceTasksInput`: O tipo de entrada para a função suggestMaintenanceTasks.
 * - `SuggestMaintenanceTasksOutput`: O tipo de saída para a função suggestMaintenanceTasks.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMaintenanceTasksInputSchema = z.object({
  equipmentName: z.string().describe('O nome do equipamento a ser analisado.'),
  failureModes: z.array(z.string()).describe('Uma lista de modos de falha identificados para o equipamento.'),
});
export type SuggestMaintenanceTasksInput = z.infer<typeof SuggestMaintenanceTasksInputSchema>;

const SuggestMaintenanceTasksOutputSchema = z.object({
  maintenanceTasks: z.array(
    z.object({
      task: z.string().describe('Uma descrição da tarefa de manutenção.'),
      type: z.string().describe('O tipo de manutenção (preventiva, preditiva, corretiva).'),
      frequency: z.string().describe('A frequência recomendada para a tarefa de manutenção.'),
      explanation: z.string().describe('Explicação de como realizar a tarefa e por que ela é importante.'),
    })
  ).describe('Uma lista de tarefas de manutenção sugeridas.'),
});
export type SuggestMaintenanceTasksOutput = z.infer<typeof SuggestMaintenanceTasksOutputSchema>;

export async function suggestMaintenanceTasks(input: SuggestMaintenanceTasksInput): Promise<SuggestMaintenanceTasksOutput> {
  return suggestMaintenanceTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMaintenanceTasksPrompt',
  input: {schema: SuggestMaintenanceTasksInputSchema},
  output: {schema: SuggestMaintenanceTasksOutputSchema},
  prompt: `Você é um engenheiro de confiabilidade especialista. Com base nos modos de falha identificados para um equipamento, você sugerirá tarefas de manutenção apropriadas para prevenir ou detectar essas falhas.

Equipamento: {{{equipmentName}}}

Modos de Falha:
{{#each failureModes}}
- {{{this}}}
{{/each}}

Sugira tarefas de manutenção em português, incluindo a descrição da tarefa, tipo (preventiva, preditiva ou corretiva), frequência recomendada e uma breve explicação de como realizar a tarefa e por que ela é importante.

Sua saída deve ser um array JSON de tarefas de manutenção:
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
