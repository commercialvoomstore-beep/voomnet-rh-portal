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

  const roleStr = String(user.role || '').toLowerCase();
  const isSuperAdmin = roleStr.includes('super');
  const isAdminRH = roleStr.includes('admin') && !isSuperAdmin;
  const isEmploye = !isSuperAdmin && !isAdminRH;

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
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
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
          badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        },
        {
          id: 'conges',
          label: 'Validation Demandes',
          icon: CalendarCheck,
          badge: pendingAbsences > 0 ? pendingAbsences : null,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
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
        badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      },
      {
        id: 'conges',
        label: 'Toutes les Demandes',
        icon: CalendarCheck,
        badge: pendingAbsences > 0 ? pendingAbsences : null,
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      },
      { id: 'primes', label: 'Primes Trimestrielles', icon: Award },
      { id: 'parametres', label: 'Configuration Système', icon: Settings },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none text-slate-800 shadow-sm">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <Cpu className="w-6 h-6" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-extrabold text-sm text-slate-900 tracking-wide truncate">
            VOOMNET TECH
          </h1>
          <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase">
            PORTAIL RH PRO
          </p>
        </div>
      </div>

      {/* User Info Bar */}
      <div className="mx-3 mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
        <img
          src={user.avatar}
          alt={user.nom}
          className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500 shrink-0 shadow"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold text-slate-900 truncate">
            {user.prenom} {user.nom}
          </div>
          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
            <span className="font-mono text-blue-700 font-bold">{user.matricule}</span>
            <span>•</span>
            <span className="font-bold text-slate-700">
              {user.role} ({user.statut})
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto mt-2">
        <div className="px-3 py-1 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase flex items-center justify-between">
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
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
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
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-transparent hover:border-rose-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
