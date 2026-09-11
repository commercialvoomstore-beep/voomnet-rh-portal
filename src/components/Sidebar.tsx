'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  LogOut,
  Cpu,
  MessageSquare,
  Briefcase,
  Award,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, logout, user, absenceRequests, chatMessages } = useApp();

  if (!user) return null;

  const isSuperAdmin = user.role === 'SuperAdmin';
  const isAdminRH = user.role === 'Admin' || (user.role as string) === 'Admin RH';
  const isEmploye = user.role === 'Employé';

  // Dynamic Badges
  const pendingAbsences = absenceRequests.filter((r) => r.statut === 'En attente').length;
  const myPendingRequests = absenceRequests.filter(
    (r) => r.matricule === user.matricule && r.statut === 'En attente'
  ).length;

  const unreadChatCount = chatMessages.filter(
    (m) => m.recipientMatricule === user.matricule && m.status !== 'lu'
  ).length;

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
        { id: 'primes', label: 'Ma Prime Trimestrielle', icon: Award },
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
          badge: unreadChatCount > 0 ? `${unreadChatCount}` : null,
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        },
        {
          id: 'conges',
          label: 'Validation Demandes',
          icon: CalendarCheck,
          badge: pendingAbsences > 0 ? pendingAbsences : null,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        },
        { id: 'primes', label: 'Attribution Primes', icon: Award },
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
        badge: unreadChatCount > 0 ? `${unreadChatCount}` : null,
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      },
      {
        id: 'conges',
        label: 'Toutes les Demandes',
        icon: CalendarCheck,
        badge: pendingAbsences > 0 ? pendingAbsences : null,
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      },
      { id: 'primes', label: 'Primes Trimestrielles', icon: Award },
      { id: 'parametres', label: 'Configuration Système', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-gradient-to-b from-indigo-900 via-purple-950 to-pink-950 border-r border-purple-800/40 flex flex-col h-screen shrink-0 select-none text-white shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-purple-800/40 flex items-center gap-3 bg-black/20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/40 shrink-0">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-extrabold text-sm text-white tracking-wide truncate">
            VOOMNET TECH
          </h1>
          <p className="text-[10px] font-bold text-amber-300 tracking-widest uppercase">
            PORTAIL RH JOYEUX
          </p>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="mx-3 mt-4 p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-3 shadow-md">
        <img
          src={user.avatar}
          alt={user.nom}
          className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400 shrink-0 shadow"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold text-white truncate">
            {user.prenom} {user.nom}
          </div>
          <div className="text-[10px] text-purple-200 truncate flex items-center gap-1">
            <span className="font-mono text-amber-300 font-bold">{user.matricule}</span>
            <span>•</span>
            <span className="font-bold text-pink-200">
              {user.role} ({user.statut})
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto mt-2">
        <div className="px-3 py-1 text-[10px] font-extrabold text-amber-300 tracking-wider uppercase flex items-center justify-between">
          <span>
            {isSuperAdmin
              ? 'Menu SuperAdmin'
              : isAdminRH
              ? 'Menu Administration'
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
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-amber-400 via-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/40 scale-[1.02]'
                  : 'text-purple-100 hover:text-white hover:bg-white/15'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-purple-300'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-sm ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-purple-800/40 bg-black/20">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold text-rose-300 hover:bg-rose-500/20 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
