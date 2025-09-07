import { config } from 'dotenv';
config();

import '@/ai/flows/identify-equipment-functions.ts';
import '@/ai/flows/suggest-maintenance-tasks.ts';
import '@/ai/flows/generate-maintenance-plan.ts';
import '@/ai/tools/maintenance-document-retriever.ts';
