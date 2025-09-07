"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PlanDisplayProps {
  plan: string;
  equipmentTag: string;
}

export default function PlanDisplay({ plan, equipmentTag }: PlanDisplayProps) {

  const handleExport = () => {
    // Limpa os cabeçalhos para uma exportação mais limpa
    const cleanPlan = plan.replace(/^(##\s*)/gm, '');
    const blob = new Blob([cleanPlan], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plano-manutencao-${equipmentTag}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const planSections = useMemo(() => {
    if (!plan) return [];
    // Divide por cabeçalhos markdown H2 (##) e remove espaços em branco
    return plan.split(/(?=^##\s)/m).filter(s => s.trim()).map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace(/##\s*/, '').trim();
      const content = lines.slice(1).join('\n').trim();
      return { id: `section-${index}`, title, content };
    });
  }, [plan]);

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background border-primary/20">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
             </div>
            <div>
              <CardTitle className="text-3xl font-headline uppercase tracking-wider">Plano de Manutenção</CardTitle>
              <CardDescription>O plano de manutenção detalhado está pronto.</CardDescription>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Exportar Plano
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {planSections.length > 0 ? (
          <Accordion type="multiple" className="w-full" defaultValue={planSections.map(s => s.id)}>
            {planSections.map(section => (
              <AccordionItem value={section.id} key={section.id} className="border-border">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-slate-100 text-left">{section.title}</AccordionTrigger>
                <AccordionContent>
                  <div className="prose prose-sm prose-invert max-w-none text-slate-300">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
           <div className="prose prose-sm prose-invert max-w-none text-slate-300">
             <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan}</ReactMarkdown>
           </div>
        )}
      </CardContent>
    </Card>
  );
}
