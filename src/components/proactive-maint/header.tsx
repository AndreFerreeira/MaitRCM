import { Wrench } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Wrench className="h-8 w-8 text-primary" />
          <h1 className="ml-3 text-2xl font-bold text-foreground font-headline">
            ProactiveMaint
          </h1>
        </div>
      </div>
    </header>
  );
}
