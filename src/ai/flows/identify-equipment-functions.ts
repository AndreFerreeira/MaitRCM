'use server';

/**
 * @fileOverview Identifica as funções chave de um equipamento com base em sua tag e descrição.
 *
 * - identifyEquipmentFunctions - Uma função que recebe a tag e a descrição do equipamento e retorna as funções identificadas.
 * - IdentifyEquipmentFunctionsInput - O tipo de entrada para a função identifyEquipmentFunctions.
 * - IdentifyEquipmentFunctionsOutput - O tipo de retorno para a função identifyEquipmentFunctions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyEquipmentFunctionsInputSchema = z.object({
  equipmentTag: z.string().describe('A tag ou identificador do equipamento.'),
  equipmentDescription: z.string().describe('Um breve texto descritivo do equipamento.'),
});
export type IdentifyEquipmentFunctionsInput = z.infer<typeof IdentifyEquipmentFunctionsInputSchema>;

const IdentifyEquipmentFunctionsOutputSchema = z.object({
  functions: z.array(z.string()).describe('Uma lista de funções chave executadas pelo equipamento.'),
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
  prompt: `Você é um engenheiro de manutenção sênior encarregado de detalhar as funções de um equipamento.

  Com base na tag e na descrição fornecidas, descreva em português cada uma das funções primárias e secundárias do equipamento. Para cada função, explique brevemente seu propósito e importância no processo geral.

  **Tag do Equipamento:** {{{equipmentTag}}}
  **Descrição do Equipamento:** {{{equipmentDescription}}}

  Seja detalhista e técnico na sua resposta.

  **Funções Detalhadas:**`,
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
