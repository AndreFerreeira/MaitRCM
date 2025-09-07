import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle, CircleDashed } from "lucide-react";
import type { ReactNode } from 'react';

interface StepCardProps {
  icon: ReactNode;
  title: string;
  isCurrent: boolean;
  isCompleted: boolean;
  hasError: boolean;
  children: ReactNode;
}

export default function StepCard({
  icon,
  title,
  isCurrent,
  isCompleted,
  hasError,
  children,
}: StepCardProps) {
  const StatusIcon = () => {
    if (isCurrent) return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
    if (hasError) return <AlertCircle className="h-5 w-5 text-destructive" />;
    if (isCompleted) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    return <CircleDashed className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <Card className={`transition-all duration-500 ${isCompleted ? 'opacity-100' : hasError ? 'opacity-100' : isCurrent ? 'opacity-100' : 'opacity-60'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-headline">
            {icon}
            {title}
          </CardTitle>
          <StatusIcon />
        </div>
      </CardHeader>
      {(isCompleted || hasError) && (
          <CardContent>
            {hasError ? <p className="text-destructive-foreground bg-destructive/80 p-3 rounded-md">Analysis for this step failed.</p> : children}
          </CardContent>
      )}
    </Card>
  );
}
