'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Splash } from '@/components/Splash';
import { Login } from '@/components/Login';
import { Sidebar } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { Dashboard } from '@/components/Dashboard';
import { Personnel } from '@/components/Personnel';
import { Conges } from '@/components/Conges';
import { PrimesManagement } from '@/components/PrimesManagement';
import { Parametres } from '@/components/Parametres';
import { MonPoste } from '@/components/MonPoste';
import { ChatRH } from '@/components/ChatRH';

export default function Home() {
  const { splashVisible, user, activeTab, appTheme } = useApp();

  if (splashVisible) {
    return <Splash />;
  }

  if (!user) {
    return <Login />;
  }

  const getThemeClass = () => {
    switch (appTheme) {
      case 'emerald':
        return 'theme-emerald bg-zinc-950 text-zinc-100';
      case 'violet':
        return 'theme-violet bg-neutral-950 text-neutral-100';
      case 'light':
        return 'theme-light bg-slate-100 text-slate-900';
      case 'ocean':
      default:
        return 'theme-ocean bg-slate-950 text-slate-100';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'monposte':
        return <MonPoste />;
      case 'personnel':
        return <Personnel />;
      case 'chat':
        return <ChatRH />;
      case 'conges':
        return <Conges />;
      case 'primes':
        return <PrimesManagement />;
      case 'parametres':
        return <Parametres />;
      default:
        return user.role === 'Employé' ? <MonPoste /> : <Dashboard />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${getThemeClass()}`}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{renderTabContent()}</div>
        </main>
      </div>
    </div>
  );
}
