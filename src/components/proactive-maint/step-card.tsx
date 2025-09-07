import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, CircleDashed } from "lucide-react";
import type { ReactNode } from 'react';

interface StepCardProps {
  icon: ReactNode;
  title: string;
  isCurrent: boolean;
  isCompleted: boolean;
  hasError: boolean;
  isLoading: boolean;
  children: ReactNode;
}

export default function StepCard({
  icon,
  title,
  isCurrent,
  isCompleted,
  hasError,
  isLoading,
  children,
}: StepCardProps) {
  const getStatusIcon = () => {
    if (isCurrent && isLoading) return <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />;
    if (hasError) return <AlertCircle className="h-5 w-5 text-red-500" />;
    if (isCompleted) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <CircleDashed className="h-5 w-5 text-slate-600" />;
  };

  const showContent = isCompleted || hasError;

  return (
    <Card className={`transition-all duration-500 bg-slate-900/50 border border-slate-800 ${isCompleted ? 'opacity-100' : hasError ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-60'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-lg font-headline uppercase tracking-wider text-slate-300">
            <span className="text-blue-400">{icon}</span>
            {title}
          </CardTitle>
          {getStatusIcon()}
        </div>
      </CardHeader>
      {showContent && (
          <CardContent className="pt-2">
            {hasError ? <p className="text-red-400 bg-red-900/30 p-3 rounded-md font-mono text-sm">A análise para esta etapa falhou.</p> : children}
          </CardContent>
      )}
    </Card>
  );
}

    