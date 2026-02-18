import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';

interface Props {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
