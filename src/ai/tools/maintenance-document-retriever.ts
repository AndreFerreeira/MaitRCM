'use server';
/**
 * @fileOverview Ferramenta para buscar documentos de manutenção.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Dados simulados de uma base de conhecimento de manutenção
const maintenanceKnowledgeBase = {
  'PMP-001': {
    manual: 'Manual da Bomba Centrífuga KSB-001.pdf',
    content: `
      ### Seção 5.2: Manutenção Preventiva
      - **Inspeção de Vibração:** Realizar a cada 500 horas de operação. Níveis de vibração não devem exceder 4.5 mm/s (RMS). Custo estimado do sensor: $150.
      - **Lubrificação dos Rolamentos:** Utilizar graxa tipo "Polyrex EM" a cada 2000 horas. Custo: $30 por aplicação.
      - **Verificação do Selo Mecânico:** Inspecionar visualmente por vazamentos a cada 1000 horas. Substituir se houver gotejamento contínuo. Custo de substituição: $450.
      - **Análise de Óleo:** Coletar amostra a cada 4000 horas para análise espectrométrica. Custo da análise: $100.
    `,
  },
  'MOTOR-ELET-01': {
    manual: 'Manual do Motor Elétrico WEG W22.pdf',
    content: `
      ### Capítulo 8: Procedimentos de Manutenção
      - **Medição de Isolação:** Realizar teste de megômetro anualmente. A resistência deve ser superior a 1 Gigaohm. Custo do teste: $250.
      - **Limpeza da Carcaça:** Manter a carcaça livre de poeira e detritos para garantir a dissipação de calor. Realizar semanalmente. Custo: Mão de obra.
      - **Verificação dos Terminais Elétricos:** Apertar as conexões elétricas a cada 6 meses para evitar mau contato e superaquecimento. Custo: Mão de obra.
    `,
  },
};

export const maintenanceDocumentRetriever = ai.defineTool(
    {
      name: 'maintenanceDocumentRetriever',
      description: 'Busca em uma base de conhecimento por manuais de manutenção, relatórios e valores para um equipamento específico.',
      inputSchema: z.object({
        equipmentName: z.string().describe('A tag ou nome do equipamento a ser pesquisado. Ex: "PMP-001"'),
      }),
      outputSchema: z.object({
        found: z.boolean().describe('Indica se algum documento foi encontrado.'),
        documentName: z.string().optional().describe('O nome do manual ou relatório encontrado.'),
        relevantExcerpts: z.string().optional().describe('Trechos relevantes do documento, incluindo procedimentos, valores e frequências.'),
      }),
    },
    async (input) => {
        const equipmentKey = Object.keys(maintenanceKnowledgeBase).find(key => input.equipmentName.includes(key));
        
        if (equipmentKey && maintenanceKnowledgeBase[equipmentKey as keyof typeof maintenanceKnowledgeBase]) {
            const data = maintenanceKnowledgeBase[equipmentKey as keyof typeof maintenanceKnowledgeBase];
            return {
                found: true,
                documentName: data.manual,
                relevantExcerpts: data.content,
            };
        }

        return {
            found: false,
        };
    }
);
