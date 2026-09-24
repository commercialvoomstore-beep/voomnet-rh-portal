'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  Database,
  Calendar,
  X,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Info,
  Trash2,
  Check,
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

  // Strict user-level notification filter: only show notifications addressed to THIS logged in user
  const userNotifications = notifications.filter((n) => {
    if (!user) return false;
    if (n.recipientMatricule) {
      return n.recipientMatricule === user.matricule;
    }
    return true;
  });

  const isToastForCurrentUser =
    activeToast &&
    user &&
    (!activeToast.recipientMatricule || activeToast.recipientMatricule === user.matricule);
  const unreadCount = userNotifications.filter((n) => !n.read).length;
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
      case 'conges':
        return user?.role === 'Employé'
          ? 'Mes Demandes de Permission & Congés'
          : 'Validation des Demandes de Permission & Congés';
      case 'primes':
        return user?.role === 'SuperAdmin'
          ? 'Configuration & Attribution Primes (SuperAdmin)'
          : user?.role === 'Admin' || (user?.role as string) === 'Admin RH'
          ? 'Attribution des Primes Trimestrielles'
          : 'Ma Prime Trimestrielle';
      case 'parametres':
        return 'Configuration du Compte & Photo de Profil';
      default:
        return 'VOOMNET TECH RH';
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'WARNING':
      case 'ALERT':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'CHAT':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col gap-3 relative z-30 shadow-sm">
      {/* Animated Floating Toast Alert Banner */}
      {isToastForCurrentUser && activeToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md bg-white border-2 border-rose-400 text-slate-800 p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-slideDown">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-xl bg-rose-50 border border-rose-200">
              {getNotifIcon(activeToast.type)}
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                <span>{activeToast.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">({activeToast.timestamp})</span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-snug">{activeToast.message}</p>
            </div>
          </div>

          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="VOOMNET TECHNOLOGY"
            className="h-8 object-contain max-w-[150px] hidden sm:block"
          />
          <div>
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-[#5E1675] uppercase tracking-wider">
              <span>VOOMNET TECHNOLOGY</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0E125E] tracking-tight">{getTitle()}</h2>
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-3">
          {/* Status info pill */}
          <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-indigo-50/80 border border-indigo-200 text-[11px] text-indigo-950 font-mono shadow-sm">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span>3CX Connecté</span>
            </div>
            <span className="text-indigo-200">|</span>
            <button
              onClick={() => setShowDatabaseModal(true)}
              className="flex items-center gap-1.5 text-indigo-900 hover:text-indigo-700 font-bold hover:underline cursor-pointer"
              title="Changer de Base de Données"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>{activeDbProvider === 'MOCK_LOCAL' ? 'Base SQL / Multi-SGBD' : activeDbProvider}</span>
            </button>
          </div>

          {/* Date pill */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 text-xs font-bold text-amber-900 border border-amber-200 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>{formattedDate}</span>
          </div>

          {/* Info-Bulles & Notification Bell Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 relative transition-all"
              title="Info-Bulles & Notifications RH"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white font-mono font-extrabold text-[10px] px-1.5 py-0.2 rounded-full ring-2 ring-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification & Info-Bulles Dropdown */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border-2 border-purple-500 rounded-2xl shadow-2xl z-50 p-4 animate-slideDown">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-600" />
                    <h3 className="text-xs font-extrabold text-slate-900">
                      Info-Bulles & Notifications RH
                    </h3>
                  </div>

                  {userNotifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Tout effacer
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {userNotifications.map((notif, idx) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                        notif.read ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-purple-50/60 border-purple-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 shrink-0">
                          Info-Bulle N°{idx + 1}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{notif.timestamp}</span>
                      </div>

                      <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        {getNotifIcon(notif.type)}
                        <span>{notif.title}</span>
                      </div>

                      <p className="text-[11px] text-slate-700 leading-relaxed">{notif.message}</p>

                      {!notif.read && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            className="text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-purple-200"
                          >
                            <Check className="w-3 h-3 text-emerald-600" />
                            Compris / Lu
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {userNotifications.length === 0 && (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      Aucune nouvelle info-bulle ou notification enregistrée.
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
                className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${
                  user.role === 'SuperAdmin'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : user.role === 'Admin' || (user.role as string) === 'Admin RH'
                    ? 'bg-sky-100 text-sky-800 border-sky-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
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
