"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";
import { useMemo } from "react";

interface PlanDisplayProps {
  plan: string;
  equipmentTag: string;
}

export default function PlanDisplay({ plan, equipmentTag }: PlanDisplayProps) {

  const handleExport = () => {
    const blob = new Blob([plan], { type: 'text/markdown;charset=utf-8' });
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
    // Divide por cabeçalhos markdown H2 (##)
    return plan.split(/(?=^##\s)/m).filter(Boolean).map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace('## ', '').trim();
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
                <AccordionTrigger className="text-lg font-semibold hover:no-underline text-primary">{section.title}</AccordionTrigger>
                <AccordionContent>
                  <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
                    {section.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed prose prose-sm prose-invert max-w-none">
            {plan}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
