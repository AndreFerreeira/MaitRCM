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
import { getFunctionsAction, getFailureModesAction, getConsequenceAssessmentAction, getMaintenanceTasksAction, generateFinalPlanAction } from "@/app/actions";
import type { SuggestMaintenanceTasksOutput } from "@/ai/flows/suggest-maintenance-tasks";
import { Loader2, Settings, ListChecks, ShieldAlert, ClipboardList, Wrench, Zap } from "lucide-react";
import StepCard from "./step-card";
import PlanDisplay from "./plan-display";

const formSchema = z.object({
  equipmentTag: z.string().min(1, "Equipment tag is required."),
  equipmentDescription: z.string().min(10, "Please provide a more detailed description."),
});

type AnalysisStep = "functions" | "failureModes" | "assessment" | "tasks" | "plan";

interface Results {
  functions: string[] | null;
  failureModes: string[] | null;
  assessment: string | null;
  tasks: SuggestMaintenanceTasksOutput['maintenanceTasks'] | null;
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

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipmentTag: "",
      equipmentDescription: "",
    },
  });

  const runAnalysis = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setResults({ functions: null, failureModes: null, assessment: null, tasks: null, plan: null });
    setShowResults(true);

    try {
      setCurrentStep("functions");
      const funcs = await getFunctionsAction(values);
      setResults(prev => ({ ...prev, functions: funcs.functions }));

      setCurrentStep("failureModes");
      const fModes = await getFailureModesAction({ equipmentName: values.equipmentTag, functions: funcs.functions });
      setResults(prev => ({ ...prev, failureModes: fModes }));
      
      setCurrentStep("assessment");
      const assess = await getConsequenceAssessmentAction({ failureModes: fModes });
      setResults(prev => ({ ...prev, assessment: assess }));
      
      setCurrentStep("tasks");
      const suggestedTasks = await getMaintenanceTasksAction({ equipmentName: values.equipmentTag, failureModes: fModes });
      setResults(prev => ({ ...prev, tasks: suggestedTasks.maintenanceTasks }));

      setCurrentStep("plan");
      const finalPlan = await generateFinalPlanAction({
        ...values,
        equipmentFunctions: funcs.functions.join(', '),
        failureModes: fModes.join(', '),
        consequenceAssessment: assess,
      });
      setResults(prev => ({ ...prev, plan: finalPlan.maintenancePlan }));

      setCurrentStep(null);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="bg-card/50 border-white/10">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-accent" />
            <div>
              <CardTitle className="text-2xl font-headline tracking-tighter">AI Maintenance Planner</CardTitle>
              <CardDescription>Describe your equipment to generate a comprehensive maintenance plan.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(runAnalysis)} className="space-y-6">
              <FormField
                control={form.control}
                name="equipmentTag"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-accent">Equipment Tag/Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., PMP-001" {...field} />
                    </FormControl>
                    <FormDescription>A unique identifier for the equipment.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="equipmentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-accent">Equipment Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Centrifugal pump for coolant circulation" {...field} rows={3}/>
                    </FormControl>
                     <FormDescription>A short description of what the equipment is and does.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                  <Zap className="mr-2 h-4 w-4" />
                  Generate Maintenance Plan
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
                title="Equipment Functions"
                isCurrent={currentStep === 'functions' && isLoading}
                isCompleted={!!results.functions}
                hasError={!!error && !results.functions}
            >
                {results.functions && (
                    <ul className="list-disc pl-5 space-y-1 font-mono text-sm">
                        {results.functions.map((func, i) => <li key={i}>{func}</li>)}
                    </ul>
                )}
            </StepCard>
            <StepCard
                icon={<ShieldAlert />}
                title="Failure Mode Analysis"
                isCurrent={currentStep === 'failureModes' && isLoading}
                isCompleted={!!results.failureModes}
                hasError={!!error && !results.failureModes}
            >
                {results.failureModes && (
                     <ul className="list-disc pl-5 space-y-1 font-mono text-sm">
                        {results.failureModes.map((mode, i) => <li key={i}>{mode}</li>)}
                    </ul>
                )}
            </StepCard>
            <StepCard
                icon={<ClipboardList />}
                title="Consequence Assessment"
                isCurrent={currentStep === 'assessment' && isLoading}
                isCompleted={!!results.assessment}
                hasError={!!error && !results.assessment}
            >
                {results.assessment && <div className="prose prose-sm prose-invert max-w-none">{results.assessment}</div>}
            </StepCard>

            <StepCard
                icon={<Wrench />}
                title="Suggested Maintenance Tasks"
                isCurrent={currentStep === 'tasks' && isLoading}
                isCompleted={!!results.tasks}
                hasError={!!error && !results.tasks}
            >
                {results.tasks && (
                    <div className="space-y-4">
                        {results.tasks.map((task, i) => (
                            <div key={i} className="p-3 border border-white/10 bg-black/20 rounded-lg">
                                <h4 className="font-semibold text-accent">{task.task}</h4>
                                <p className="text-sm text-muted-foreground font-mono">{task.explanation}</p>
                                <div className="flex gap-4 mt-2 text-xs font-mono">
                                    <span><strong className="text-foreground/80">Type:</strong> {task.type}</span>
                                    <span><strong className="text-foreground/80">Frequency:</strong> {task.frequency}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </StepCard>

            {results.plan && <PlanDisplay plan={results.plan} equipmentTag={form.getValues("equipmentTag")} />}
        </div>
      )}
    </div>
  );
}
