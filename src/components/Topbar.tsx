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
  Palette,
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
    appTheme,
    setAppTheme,
  } = useApp();

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
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
    <header className="bg-white/90 backdrop-blur-md border-b border-indigo-100 px-6 py-4 flex flex-col gap-3 relative z-30 shadow-sm">
      {/* Animated Floating Toast Alert Banner */}
      {activeToast && (
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
        <div>
          <div className="flex items-center gap-2 text-[10px] font-extrabold text-purple-700 uppercase tracking-wider">
            <span>VOOMNET TECHNOLOGY</span>
            <span>•</span>
            <span className="text-pink-600 font-extrabold">Période : Trimestre 3 - 2026</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{getTitle()}</h2>
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

          {/* Palette / Theme Selector Button Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-rose-500 to-pink-500 text-white font-extrabold shadow-md shadow-rose-500/20 hover:opacity-95 transition-all flex items-center gap-1.5"
              title="Changer les couleurs"
            >
              <Palette className="w-4 h-4 text-white animate-bounce" />
              <span className="hidden sm:inline text-xs">
                Couleurs
              </span>
            </button>

            {showThemeDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-indigo-100 rounded-2xl shadow-2xl p-4 z-50 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                  <Palette className="w-4 h-4 text-rose-500" />
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Sélecteur de Thème
                  </h4>
                </div>

                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => {
                      setAppTheme('ocean');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                      appTheme === 'ocean'
                        ? 'bg-rose-50 border-rose-300 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 shadow-sm" />
                      Gai, Joyeux & Ensoleillé
                    </span>
                    {appTheme === 'ocean' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setAppTheme('emerald');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                      appTheme === 'emerald'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 shadow-sm" />
                      Émeraude & Vert Menthe
                    </span>
                    {appTheme === 'emerald' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      setAppTheme('violet');
                      setShowThemeDropdown(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between border transition-all ${
                      appTheme === 'violet'
                        ? 'bg-purple-50 border-purple-300 text-purple-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm" />
                      Améthyste & Violet Cyber
                    </span>
                    {appTheme === 'violet' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bell Notification Button Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all shadow-sm"
              title="Centre de Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-bounce shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Menu */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-indigo-100 rounded-2xl shadow-2xl p-4 z-50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-purple-600" />
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Centre d&apos;Alertes RH
                    </h4>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold"
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
                          ? 'bg-slate-50 border-slate-200 text-slate-500 opacity-60'
                          : 'bg-indigo-50/60 border-indigo-200 text-slate-900 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-xs text-slate-900">
                          {getNotifIcon(n.type)}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-snug">{n.message}</p>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium">
                      Aucune notification récente.
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
