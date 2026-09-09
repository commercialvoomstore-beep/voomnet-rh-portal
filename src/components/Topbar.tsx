'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  ShieldCheck,
  Database,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Info,
  Check,
  Trash2,
} from 'lucide-react';

import { DatabaseConfigModal } from '@/components/DatabaseConfigModal';
import { getActiveProvider } from '@/lib/databaseAdapter';

export const Topbar: React.FC = () => {
  const {
    activeTab,
    user,
    notifications,
    activeToast,
    dismissToast,
    markNotificationAsRead,
    clearAllNotifications,
  } = useApp();

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showDatabaseModal, setShowDatabaseModal] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeDbProvider = getActiveProvider();

  const currentDateStr = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedDate = currentDateStr.charAt(0).toUpperCase() + currentDateStr.slice(1);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Tableau de Bord RH';
      case 'monposte':
        return 'Mon Profil & Fiche de Poste';
      case 'personnel':
        return user?.role === 'SuperAdmin'
          ? 'Gestion des Utilisateurs (CRUD, Rôles & Contrats)'
          : 'Suivi des Employés & Fiches Administratives';
      case 'chat':
        return 'Chat RH Direct (SuperAdmin <--> Admin)';
      case 'conges':
        return user?.role === 'Employé'
          ? 'Mes Demandes de Permission & Congés'
          : 'Validation des Demandes de Permission & Congés';
      case 'primes':
        return user?.role === 'SuperAdmin'
          ? 'Matrice & Configuration des Primes (SuperAdmin)'
          : user?.role === 'Admin' || (user?.role as string) === 'Admin RH'
          ? 'Suivi & Contrôle des Primes Employés'
          : 'Ma Prime de Ponctualité T3 2026';
      case 'parametres':
        return 'Configuration du Compte & Photo de Profil';
      default:
        return 'VOOMNET TECH RH';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'WARNING':
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'CHAT':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col gap-3 relative z-30">
      {/* Animated Floating Toast Alert Banner */}
      {activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-slate-900 border-2 border-blue-500/80 text-white p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-slideDown">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
              {getNotifIcon(activeToast.type)}
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{activeToast.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">({activeToast.timestamp})</span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-snug">{activeToast.message}</p>
            </div>
          </div>

          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>VOOMNET TECHNOLOGY</span>
            <span>•</span>
            <span className="text-blue-400">Période : Trimestre 3 - 2026</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{getTitle()}</h2>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          {/* Status info pill */}
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>3CX Connecté</span>
            </div>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setShowDatabaseModal(true)}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white hover:underline cursor-pointer"
              title="Changer de Base de Données"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{activeDbProvider === 'MOCK_LOCAL' ? 'Base SQL / Multi-SGBD' : activeDbProvider}</span>
            </button>
          </div>

          {/* Date pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-medium text-slate-300 border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{formattedDate}</span>
          </div>

          {/* Bell Notification Button Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
              title="Centre de Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white font-bold text-[10px] flex items-center justify-center animate-bounce shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Centre d&apos;Alertes RH
                    </h4>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                    >
                      <Trash2 className="w-3 h-3" />
                      Tout effacer
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        n.read
                          ? 'bg-slate-950/50 border-slate-800/80 opacity-60'
                          : 'bg-slate-950 border-blue-500/40 text-white shadow'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-xs text-white">
                          {getNotifIcon(n.type)}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-snug">{n.message}</p>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      Aucune notification recente.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Role badge */}
          {user && (
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  user.role === 'SuperAdmin'
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : user.role === 'Admin' || (user.role as string) === 'Admin RH'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {user.role} ({user.matricule})
              </span>
            </div>
          )}
        </div>
      </div>
      <DatabaseConfigModal
        isOpen={showDatabaseModal}
        onClose={() => setShowDatabaseModal(false)}
      />
    </header>
  );
};
