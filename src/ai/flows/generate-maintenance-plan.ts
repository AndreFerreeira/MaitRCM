'use server';

/**
 * @fileOverview Gera um plano de manutenção para um determinado equipamento.
 *
 * - generateMaintenancePlan - Uma função que gera um plano de manutenção.
 * - GenerateMaintenancePlanInput - O tipo de entrada para a função generateMaintenancePlan.
 * - GenerateMaintenancePlanOutput - O tipo de retorno para a função generateMaintenancePlan.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { maintenanceDocumentRetriever } from '../tools/maintenance-document-retriever';

const GenerateMaintenancePlanInputSchema = z.object({
  equipmentTag: z.string().describe('A tag do equipamento.'),
  equipmentDescription: z.string().describe('Uma breve descrição do equipamento.'),
  equipmentFunctions: z.string().describe('Uma lista das funções críticas do equipamento.'),
  failureModes: z.string().describe('Uma lista dos modos de falha mais prováveis do equipamento, incorporando a consequência da falha.'),
  consequenceAssessment: z.string().describe('As consequências potenciais de cada modo de falha nas dimensões de segurança, impacto ambiental, produção e custo.'),
  manualContent: z.string().optional().describe('Conteúdo de manuais ou informações fornecidas pelo usuário sobre o equipamento.'),
});

export type GenerateMaintenancePlanInput = z.infer<typeof GenerateMaintenancePlanInputSchema>;

const GenerateMaintenancePlanOutputSchema = z.object({
  maintenancePlan: z.string().describe('Um plano de manutenção detalhado especificando o tipo de manutenção, frequência e uma breve explicação de como realizar cada tarefa.'),
});

export type GenerateMaintenancePlanOutput = z.infer<typeof GenerateMaintenancePlanOutputSchema>;

export async function generateMaintenancePlan(input: GenerateMaintenancePlanInput): Promise<GenerateMaintenancePlanOutput> {
  return generateMaintenancePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMaintenancePlanPrompt',
  input: {schema: GenerateMaintenancePlanInputSchema},
  output: {schema: GenerateMaintenancePlanOutputSchema},
  tools: [maintenanceDocumentRetriever],
  prompt: `Você é um engenheiro de manutenção especialista.

Você usará as informações fornecidas para gerar um plano de manutenção detalhado para o equipamento.

{{#if manualContent}}
Use o conteúdo do manual fornecido pelo usuário como a principal fonte de verdade para criar o plano de manutenção. Extraia procedimentos, frequências e especificações diretamente dele.
Conteúdo do Manual:
---
{{{manualContent}}}
---
{{/if}}

Se nenhuma informação for fornecida no manual ou se as informações estiverem incompletas, utilize a ferramenta 'maintenanceDocumentRetriever' para buscar manuais e relatórios que possam fornecer valores, procedimentos e frequências específicas. Incorpore essas informações encontradas no plano final.

Se nenhuma fonte de dados (manual do usuário ou ferramenta de busca) fornecer informações suficientes, use seu conhecimento especializado para criar um plano de manutenção genérico, mas eficaz.

Dados do Equipamento:
- Tag: {{{equipmentTag}}}
- Descrição: {{{equipmentDescription}}}
- Funções: {{{equipmentFunctions}}}
- Modos de Falha: {{{failureModes}}}
- Avaliação de Consequências: {{{consequenceAssessment}}}

Gere um plano de manutenção detalhado em português, especificando o tipo de manutenção (preventiva, corretiva, etc.), frequência e uma breve explicação de como realizar cada tarefa.
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
