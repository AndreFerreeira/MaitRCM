"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getFunctionsAction, getFailureModesAction, getConsequenceAssessmentAction, generateFinalPlanAction, getSuggestedTasksAction } from "@/app/actions";
import { Loader2, Settings, ListChecks, ShieldAlert, ClipboardList, Wrench, Zap, FileImage, X, AlertTriangle } from "lucide-react";
import StepCard from "./step-card";
import PlanDisplay from "./plan-display";
import { type SuggestMaintenanceTasksOutput } from "@/ai/flows/suggest-maintenance-tasks";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

const formSchema = z.object({
  equipmentTag: z.string().min(1, "A tag do equipamento é obrigatória."),
  equipmentDescription: z.string().min(10, "Forneça uma descrição mais detalhada."),
  manualContent: z.string().optional(),
});

type AnalysisStep = "functions" | "failureModes" | "assessment" | "tasks" | "plan";

interface Results {
  functions: string[] | null;
  failureModes: string[] | null;
  assessment: string | null;
  tasks: SuggestMaintenanceTasksOutput | null;
  plan: string | null;
}

export default function MaintenanceWizard() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<AnalysisStep | null>(null);
  const [results, setResults] = useState<Results>({
    functions: null,
    failureModes: null,
    assessment: null,
    tasks: null,
    plan: null,
  });
  const [showResults, setShowResults] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{name: string, dataUrl: string} | null>(null);


  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentTag: "",
      equipmentDescription: "",
      manualContent: "",
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setSelectedFile({ name: file.name, dataUrl });
            form.setValue("manualContent", dataUrl);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
            variant: "destructive",
            title: "Tipo de arquivo inválido",
            description: "Por favor, selecione um arquivo de imagem (PNG, JPG, etc).",
        });
      }
    }
  };
  
  const removeFile = () => {
    setSelectedFile(null);
    form.setValue("manualContent", "");
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = "";
  }


  const runAnalysis = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setResults({ functions: null, failureModes: null, assessment: null, tasks: null, plan: null });
    setShowResults(true);

    try {
      setCurrentStep("functions");
      const funcs = await getFunctionsAction(values);
      if (!funcs.functions || funcs.functions.length === 0) throw new Error("Não foi possível identificar as funções do equipamento.");
      setResults(prev => ({ ...prev, functions: funcs.functions }));

      setCurrentStep("failureModes");
      const fModes = await getFailureModesAction({ equipmentName: values.equipmentTag, functions: funcs.functions });
      if (!fModes || fModes.length === 0) throw new Error("Não foi possível identificar os modos de falha.");
      setResults(prev => ({ ...prev, failureModes: fModes }));
      
      setCurrentStep("assessment");
      const assess = await getConsequenceAssessmentAction({ failureModes: fModes });
      if (!assess) throw new Error("Não foi possível gerar a avaliação de consequências.");
      setResults(prev => ({ ...prev, assessment: assess }));

      setCurrentStep("tasks");
      const suggestedTasks = await getSuggestedTasksAction({ equipmentName: values.equipmentTag, failureModes: fModes });
      if (!suggestedTasks?.maintenanceTasks || suggestedTasks.maintenanceTasks.length === 0) throw new Error("Não foi possível sugerir as tarefas de manutenção.");
      setResults(prev => ({ ...prev, tasks: suggestedTasks }));

      setCurrentStep("plan");
      const finalPlan = await generateFinalPlanAction({
        ...values,
        equipmentFunctions: funcs.functions.join(', '),
        failureModes: fModes.join(', '),
        consequenceAssessment: assess,
      });
      if (!finalPlan.maintenancePlan) throw new Error("Não foi possível gerar o plano de manutenção final.");
      setResults(prev => ({ ...prev, plan: finalPlan.maintenancePlan }));

      setCurrentStep(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Falha na Análise",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="border-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black shadow-2xl shadow-blue-500/10">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600/10 flex items-center justify-center border border-blue-500/30">
              <Wrench className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-3xl font-headline tracking-wider text-gray-50">Planejador de Manutenção Preditiva</CardTitle>
              <CardDescription className="text-gray-400">Gere um plano de manutenção RCM completo usando IA.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(runAnalysis)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="equipmentTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-400">Tag/Nome do Equipamento</FormLabel>
                      <FormControl>
                        <Input placeholder="ex: PMP-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="equipmentDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-400">Descrição do Equipamento</FormLabel>
                      <FormControl>
                        <Textarea rows={4} placeholder="ex: Bomba centrífuga para circulação de água de resfriamento, motor de 50CV, localizada no setor 3." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="manualContent"
                render={() => (
                  <FormItem>
                     <FormLabel className="text-gray-400 flex items-center gap-2">
                      <FileImage className="w-4 h-4"/>
                      Anexar Imagem (Opcional)
                    </FormLabel>
                    <FormControl>
                       <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                            Escolher Arquivo
                        </Button>
                        <Input 
                            id="file-upload"
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange} 
                        />
                        {selectedFile && (
                            <div className="flex items-center gap-2 p-2 rounded-md bg-gray-800/50 text-sm">
                                <span>{selectedFile.name}</span>
                                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={removeFile}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                       </div>
                    </FormControl>
                     <FormDescription className="text-gray-500">
                      Anexe uma imagem do equipamento, placa de especificações ou manual.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto bg-blue-600 text-white hover:bg-blue-500 transition-all duration-300 transform hover:scale-105">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                  <Zap className="mr-2 h-4 w-4" />
                  Gerar Plano
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {showResults && (
        <div className="space-y-8">
            <StepCard
                icon={<ListChecks />}
                title="Funções do Equipamento"
                isCurrent={currentStep === 'functions'}
                isCompleted={!!results.functions}
                hasError={!!error && !results.functions}
                isLoading={isLoading}
            >
                {results.functions && (
                    <ul className="list-disc pl-5 space-y-1 font-mono text-sm text-gray-300">
                        {results.functions.map((func, i) => <li key={i}>{func}</li>)}
                    </ul>
                )}
            </StepCard>
            <StepCard
                icon={<ShieldAlert />}
                title="Análise de Modo de Falha"
                isCurrent={currentStep === 'failureModes'}
                isCompleted={!!results.failureModes}
                hasError={!!error && currentStep === 'failureModes'}
                isLoading={isLoading}
            >
                {results.failureModes && (
                     <ul className="list-disc pl-5 space-y-1 font-mono text-sm text-gray-300">
                        {results.failureModes.map((mode, i) => <li key={i}>{mode}</li>)}
                    </ul>
                )}
            </StepCard>
            <StepCard
                icon={<ClipboardList />}
                title="Avaliação de Consequências"
                isCurrent={currentStep === 'assessment'}
                isCompleted={!!results.assessment}
                hasError={!!error && currentStep === 'assessment'}
                isLoading={isLoading}
            >
                {results.assessment && <div className="prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: results.assessment.replace(/\n/g, '<br />') }} />}
            </StepCard>
            <StepCard
                icon={<AlertTriangle />}
                title="Tarefas de Manutenção Sugeridas"
                isCurrent={currentStep === 'tasks'}
                isCompleted={!!results.tasks}
                hasError={!!error && currentStep === 'tasks'}
                isLoading={isLoading}
            >
               {results.tasks && (
                    <Accordion type="multiple" className="w-full">
                        {results.tasks.maintenanceTasks.map((task, i) => (
                           <AccordionItem value={`item-${i}`} key={i} className="border-slate-700">
                             <AccordionTrigger className="font-mono text-sm text-blue-400 hover:no-underline text-left">
                               {task.task}
                             </AccordionTrigger>
                             <AccordionContent>
                               <div className="font-mono text-sm text-gray-300 space-y-2 pt-2">
                                 <p><strong className="text-gray-500 font-semibold">Tipo:</strong> {task.type}</p>
                                 <p><strong className="text-gray-500 font-semibold">Frequência:</strong> {task.frequency}</p>
                                 <p className="pt-2 mt-2 border-t border-slate-700/50"><strong className="text-gray-500 font-semibold">Detalhes:</strong> {task.explanation}</p>
                               </div>
                             </AccordionContent>
                           </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </StepCard>
            <StepCard
                icon={<Wrench />}
                title="Plano de Manutenção"
                isCurrent={currentStep === 'plan'}
                isCompleted={!!results.plan}
                hasError={!!error && currentStep === 'plan'}
                isLoading={isLoading}
            >
               {results.plan && <PlanDisplay plan={results.plan} equipmentTag={form.getValues("equipmentTag")} />}
            </StepCard>
        </div>
      )}
    </div>
  );
}
