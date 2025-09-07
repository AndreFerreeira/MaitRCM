import Header from '@/components/proactive-maint/header';
import MaintenanceWizard from '@/components/proactive-maint/maintenance-wizard';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <MaintenanceWizard />
      </main>
    </div>
  );
}
