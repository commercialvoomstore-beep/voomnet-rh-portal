'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Zap,
  Settings,
  LogOut,
  Cpu,
  MessageSquare,
  Briefcase,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, logout, user, absenceRequests, primes, chatMessages } = useApp();

  if (!user) return null;

  const isSuperAdmin = user.role === 'SuperAdmin';
  const isAdminRH = user.role === 'Admin RH';
  const isEmploye = user.role === 'Employé';

  // Badges
  const pendingAbsences = absenceRequests.filter((r) => r.statut === 'En attente').length;
  const canceledPrimes = primes.filter((p) => !p.eligible).length;
  const myPendingRequests = absenceRequests.filter(
    (r) => r.matricule === user.matricule && r.statut === 'En attente'
  ).length;

  const totalChatMessages = chatMessages.length;

  const getNavItems = () => {
    if (isEmploye) {
      return [
        { id: 'monposte', label: 'Mon Poste & Profil', icon: Briefcase },
        {
          id: 'conges',
          label: 'Mes Permissions',
          icon: CalendarCheck,
          badge: myPendingRequests > 0 ? myPendingRequests : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        { id: 'primes', label: 'Ma Prime T3 2026', icon: Zap },
        { id: 'parametres', label: 'Mon Compte & Photo', icon: Settings },
      ];
    }

    if (isAdminRH) {
      return [
        { id: 'dashboard', label: 'Tableau de bord RH', icon: LayoutDashboard },
        { id: 'personnel', label: 'Suivi des Employés', icon: Users },
        {
          id: 'chat',
          label: 'Chat RH Direct',
          icon: MessageSquare,
          badge: totalChatMessages > 0 ? `${totalChatMessages}` : null,
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        },
        {
          id: 'conges',
          label: 'Validation Demandes',
          icon: CalendarCheck,
          badge: pendingAbsences > 0 ? pendingAbsences : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        {
          id: 'primes',
          label: 'Suivi des Primes',
          icon: Zap,
          badge: canceledPrimes > 0 ? `${canceledPrimes} Annulée${canceledPrimes > 1 ? 's' : ''}` : null,
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
        },
        { id: 'parametres', label: 'Paramètres & Photo', icon: Settings },
      ];
    }

    // SuperAdmin
    return [
      { id: 'dashboard', label: 'Tableau de bord Master', icon: LayoutDashboard },
      { id: 'personnel', label: 'Gestion Utilisateurs', icon: Users },
      {
        id: 'chat',
        label: 'Chat RH Direct',
        icon: MessageSquare,
        badge: totalChatMessages > 0 ? `${totalChatMessages}` : null,
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      },
      {
        id: 'conges',
        label: 'Toutes les Demandes',
        icon: CalendarCheck,
        badge: pendingAbsences > 0 ? pendingAbsences : null,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      },
      {
        id: 'primes',
        label: 'Config & Matrice Primes',
        icon: Zap,
        badge: canceledPrimes > 0 ? `${canceledPrimes} Annulée${canceledPrimes > 1 ? 's' : ''}` : null,
        badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
      },
      { id: 'parametres', label: 'Configuration Système', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-extrabold text-sm text-white tracking-wide truncate">
            VOOMNET TECH
          </h1>
          <p className="text-[10px] font-semibold text-blue-400 tracking-widest uppercase">
            RH PORTAL 2026
          </p>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="mx-3 mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center gap-3">
        <img
          src={user.avatar}
          alt={user.nom}
          className="w-9 h-9 rounded-lg object-cover ring-2 ring-blue-500/40 shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-white truncate">
            {user.prenom} {user.nom}
          </div>
          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            <span className="font-mono text-blue-400 font-bold">{user.matricule}</span>
            <span>•</span>
            <span
              className={`font-semibold ${
                isSuperAdmin
                  ? 'text-purple-400'
                  : isAdminRH
                  ? 'text-cyan-400'
                  : 'text-emerald-400'
              }`}
            >
              {user.role} ({user.statut})
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto mt-2">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 tracking-wider uppercase flex items-center justify-between">
          <span>
            {isSuperAdmin
              ? 'Menu SuperAdmin'
              : isAdminRH
              ? 'Menu Admin RH'
              : 'Espace Employé'}
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
