
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

const GenerateMaintenancePlanInputSchema = z.object({
  equipmentTag: z.string().describe('A tag do equipamento.'),
  equipmentDescription: z.string().describe('Uma breve descrição do equipamento.'),
  equipmentFunctions: z.string().describe('Uma lista das funções críticas do equipamento.'),
  failureModes: z.string().describe('Uma lista dos modos de falha mais prováveis do equipamento, incorporando a consequência da falha.'),
  consequenceAssessment: z.string().describe('As consequências potenciais de cada modo de falha nas dimensões de segurança, impacto ambiental, produção e custo.'),
  manualContent: z.string().optional().describe("Conteúdo opcional fornecido pelo usuário, como uma imagem em formato data URI, sobre o equipamento."),
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
  prompt: `Você é um engenheiro de manutenção e confiabilidade sênior, especialista em criar planos de manutenção RCM (Reliability Centered Maintenance) otimizados e detalhados.

Sua missão é gerar um plano de manutenção excepcionalmente detalhado e profissional.

Utilize as seguintes informações para embasar sua análise:

**Dados do Equipamento:**
- **Tag:** {{{equipmentTag}}}
- **Descrição:** {{{equipmentDescription}}}
- **Funções Críticas:** {{{equipmentFunctions}}}
- **Modos de Falha Identificados:** {{{failureModes}}}
- **Avaliação de Consequências:** {{{consequenceAssessment}}}

{{#if manualContent}}
**Informações Adicionais Fornecidas (Referência Primária):**
- **Imagem ou Manual (data URI):** {{media url=manualContent}}
{{/if}}

Com base em todos esses dados, gere um plano de manutenção detalhado e bem estruturado em português. O plano deve ser formatado em markdown e incluir as seguintes seções, com o máximo de detalhes possível:

1.  **Tarefas de Manutenção Preventiva:** Descreva inspeções, lubrificações, limpezas, e substituições programadas.
2.  **Tarefas de Manutenção Preditiva:** Detalhe as técnicas como análise de vibração, termografia, análise de óleo, ultrassom, etc.
3.  **Procedimentos Recomendados:** Para cada tarefa, especifique:
    *   **Frequência:** (ex: Semanal, Mensal, 2000 horas de operação).
    *   **Tipo de Manutenção:** (Preventiva, Preditiva).
    *   **Procedimento Detalhado:** Forneça uma explicação clara e passo a passo de como executar a tarefa. Se aplicável, mencione ferramentas e materiais necessários.
    *   **Justificativa Técnica:** Explique por que a tarefa é importante e qual modo de falha ela visa mitigar.

Se o conteúdo fornecido pelo usuário (imagem) não for claro ou ausente, utilize seu profundo conhecimento técnico e os dados textuais do equipamento para elaborar o plano mais completo possível.
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
