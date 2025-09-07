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
    link.download = `maintenance-plan-${equipmentTag}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const planSections = useMemo(() => {
    if (!plan) return [];
    // Split by markdown H2 headers (##)
    return plan.split(/(?=^##\s)/m).filter(Boolean).map((section, index) => {
      const lines = section.trim().split('\n');
      const title = lines[0].replace('## ', '').trim();
      const content = lines.slice(1).join('\n').trim();
      return { id: `section-${index}`, title, content };
    });
  }, [plan]);

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/30">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
             <FileText className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl font-headline">Your Maintenance Plan</CardTitle>
              <CardDescription>The detailed maintenance plan for your equipment is ready.</CardDescription>
            </div>
          </div>
          <Button onClick={handleExport} variant="outline" className="shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Export Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {planSections.length > 0 ? (
          <Accordion type="multiple" className="w-full" defaultValue={[planSections[0].id]}>
            {planSections.map(section => (
              <AccordionItem value={section.id} key={section.id}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">{section.title}</AccordionTrigger>
                <AccordionContent>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed prose prose-sm max-w-none">
                    {section.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="whitespace-pre-wrap text-sm leading-relaxed prose prose-sm max-w-none">
            {plan}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
