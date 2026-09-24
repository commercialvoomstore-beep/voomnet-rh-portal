'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Settings,
  LogOut,
  Briefcase,
  Award,
  Info,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number | null;
  badgeColor?: string;
  infoBulleCount?: number;
  infoBulleNumber?: number;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    logout,
    user,
    absenceRequests,
    primeAttributions,
  } = useApp();

  const [activeInfoBulleTab, setActiveInfoBulleTab] = useState<string | null>(null);

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

  const myApprovedOrRefused = absenceRequests.filter(
    (r) => r.matricule === user.matricule && (r.statut === 'Approuvé' || r.statut === 'Refusé')
  );

  const myPrime = (primeAttributions || []).find(
    (p) => String(p.matricule).trim() === String(user.matricule).trim()
  );

  const getNavItems = (): NavItem[] => {
    if (isEmploye) {
      return [
        { id: 'monposte', label: 'Mon Poste & Profil', icon: Briefcase },
        {
          id: 'conges',
          label: 'Mes Permissions',
          icon: CalendarCheck,
          badge: myApprovedOrRefused.length > 0 ? myApprovedOrRefused.length : myPendingRequests > 0 ? myPendingRequests : null,
          badgeColor:
            myApprovedOrRefused.length > 0
              ? 'bg-emerald-600 text-white font-mono font-extrabold shadow-sm animate-pulse'
              : 'bg-amber-100 text-amber-800 border-amber-200',
          infoBulleCount: myApprovedOrRefused.length,
          infoBulleNumber: 1,
        },
        {
          id: 'primes',
          label: 'Ma Prime Trimestrielle',
          icon: Award,
          badge: myPrime && myPrime.statut ? 1 : null,
          badgeColor:
            myPrime?.statut === 'Accordée'
              ? 'bg-emerald-600 text-white font-mono font-extrabold shadow-sm animate-pulse'
              : myPrime?.statut === 'Refusée'
              ? 'bg-rose-600 text-white font-mono font-extrabold shadow-sm animate-pulse'
              : 'bg-amber-500 text-white font-mono font-extrabold shadow-sm animate-pulse',
          infoBulleCount: myPrime && myPrime.statut ? 1 : 0,
          infoBulleNumber: 2,
        },
        { id: 'parametres', label: 'Mon Compte & Photo', icon: Settings },
      ];
    }

    if (isAdminRH) {
      return [
        { id: 'dashboard', label: 'Tableau de bord RH', icon: LayoutDashboard },
        { id: 'personnel', label: 'Suivi des Employés', icon: Users },
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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 select-none text-slate-800 shadow-sm relative">
      {/* Brand Header with official logo */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-center bg-white">
        <img
          src="/logo.png"
          alt="VOOMNET TECHNOLOGY Logo"
          className="h-10 object-contain max-w-[200px]"
        />
      </div>

      {/* User Info Bar */}
      <div className="mx-3 mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
        <img
          src={user.avatar}
          alt={user.nom}
          className="w-10 h-10 rounded-xl object-cover ring-2 ring-purple-500 shrink-0 shadow"
        />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-extrabold text-[#0E125E] truncate">
            {user.prenom} {user.nom}
          </div>
          <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
            <span className="font-mono text-[#5E1675] font-bold">{user.matricule}</span>
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
          const isInfoBulleActive = activeInfoBulleTab === item.id;

          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => {
                  setActiveTab(item.id);
                  if (item.infoBulleCount && item.infoBulleCount > 0) {
                    setActiveInfoBulleTab(isInfoBulleActive ? null : item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0E125E] to-[#5E1675] text-white shadow-md shadow-purple-900/10'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <div className="flex items-center gap-1">
                    {item.infoBulleNumber && (
                      <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded-full">
                        N°{item.infoBulleNumber}
                      </span>
                    )}
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border shadow-sm ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  </div>
                )}
              </button>

              {/* Numbered Info-Bulle Tooltip Popup */}
              {isInfoBulleActive && item.id === 'conges' && myApprovedOrRefused.length > 0 && (
                <div className="absolute left-full top-0 ml-3 z-50 w-72 bg-white border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 text-slate-900 animate-slideDown">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      💡 Info-Bulle N°1 (Décision Permission)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveInfoBulleTab(null);
                      }}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {myApprovedOrRefused.map((r) => (
                      <div key={r.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-blue-700">{r.codeSuivi}</span>
                          {r.statut === 'Approuvé' ? (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              VALIDÉE
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              REFUSÉE
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug">
                          Motif RH: <strong className="text-slate-900">{r.cadreAdminNotes || 'Aucune remarque.'}</strong>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isInfoBulleActive && item.id === 'primes' && myPrime && myPrime.statut && (
                <div className="absolute left-full top-0 ml-3 z-50 w-72 bg-white border-2 border-amber-500 rounded-2xl shadow-2xl p-4 text-slate-900 animate-slideDown">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                    <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      💡 Info-Bulle N°2 (Décision Prime)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveInfoBulleTab(null);
                      }}
                      className="text-slate-400 hover:text-slate-700 text-xs font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{myPrime.periodeNom}</span>
                      {myPrime.statut === 'Accordée' ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ACCORDÉE
                        </span>
                      ) : myPrime.statut === 'Refusée' ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          NON ATTRIBUÉE
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          EN ATTENTE
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono font-extrabold text-slate-900">
                      Montant : {myPrime.statut === 'Accordée' ? `${myPrime.montant?.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Remarque RH: <strong className="text-slate-900">{myPrime.motif || 'En cours d\'évaluation RH.'}</strong>
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all border border-transparent hover:border-rose-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
