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
  prompt: `Você é um técnico de manutenção especialista encarregado de identificar as funções de um equipamento.

  Com base na tag e na descrição do equipamento fornecidas, liste em português as principais funções que o equipamento desempenha.

  Tag do Equipamento: {{{equipmentTag}}}
  Descrição do Equipamento: {{{equipmentDescription}}}

  Funções:`,
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
