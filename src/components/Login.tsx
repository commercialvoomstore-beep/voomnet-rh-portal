'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PhoneCall, Lock, ArrowRight, Shield, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useApp();
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule) {
      setError('Veuillez saisir votre numéro de matricule (Poste 3CX) ou votre email.');
      return;
    }
    const success = login(matricule, password);
    if (!success) {
      setError('Identifiant ou mot de passe incorrect. Vérifiez vos identifiants.');
    } else {
      setError('');
    }
  };

  const handleQuickDemo = (demoMatricule: string) => {
    setMatricule(demoMatricule);
    setPassword('voomnet2026');
    login(demoMatricule);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-100 via-rose-100 via-sky-100 to-indigo-100 px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/80 rounded-3xl shadow-2xl shadow-purple-500/10 p-8 relative z-10 text-slate-800">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 mb-3 animate-bounce">
            <PhoneCall className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            VOOMNET TECH RH
          </h2>
          <p className="text-xs font-bold text-rose-600 mt-1">
            Portail Joyeux & Dynamique — Gestion des 3 Rôles
          </p>
        </div>

        {/* Notice badge */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 shadow-sm">
          <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-900">Connexion Matricule (Poste 3CX) ou Email</span>
            Entrez votre numéro de poste interne (ex: 9999, 1000, 1009, 1015) ou votre email.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-700 text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Matricule 3CX ou Adresse Email *
            </label>
            <div className="relative">
              <PhoneCall className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: 9999 ou m.kouassi@voomnet.com"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Mot de passe démo : <code className="text-rose-600 font-extrabold">voomnet2026</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-4 bg-gradient-to-r from-amber-400 via-rose-500 to-pink-600 hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
          >
            Se connecter au portail RH
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Account Shortcuts for 3 Roles */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-extrabold mb-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
            Accès rapide pour tester les 3 Rôles :
          </div>

          {/* SuperAdmin */}
          <button
            onClick={() => handleQuickDemo('9999')}
            className="w-full p-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-2xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-xs font-mono shadow-sm">
                9999
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-purple-700">
                  Alexandre VOHOU
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Superadministrateur • Accès Complet</div>
              </div>
            </div>
            <span className="text-[10px] bg-purple-200 text-purple-900 px-2.5 py-0.5 rounded-full font-extrabold border border-purple-300">
              SuperAdmin
            </span>
          </button>

          {/* Admin RH */}
          <button
            onClick={() => handleQuickDemo('1000')}
            className="w-full p-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-2xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-extrabold text-xs font-mono shadow-sm">
                1000
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-sky-700">
                  Marc KOUASSI
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Administrateur • Valider Congés & Absences</div>
              </div>
            </div>
            <span className="text-[10px] bg-sky-200 text-sky-900 px-2.5 py-0.5 rounded-full font-extrabold border border-sky-300">
              Admin
            </span>
          </button>

          {/* Employé CDI */}
          <button
            onClick={() => handleQuickDemo('1009')}
            className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-xs font-mono shadow-sm">
                1009
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700">
                  Sarah BAMBA
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Ingénieure Réseau • Employé CDI</div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-300">
              Employé CDI
            </span>
          </button>

          {/* Employé CDD */}
          <button
            onClick={() => handleQuickDemo('1015')}
            className="w-full p-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-2xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-xs font-mono shadow-sm">
                1015
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-teal-700">
                  Awa DIABATÉ
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Développeuse Frontend • Employé CDD</div>
              </div>
            </div>
            <span className="text-[10px] bg-teal-200 text-teal-900 px-2.5 py-0.5 rounded-full font-extrabold border border-teal-300">
              Employé CDD
            </span>
          </button>

          {/* Employé STAGIAIRE */}
          <button
            onClick={() => handleQuickDemo('1021')}
            className="w-full p-2.5 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-2xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-pink-600 text-white flex items-center justify-center font-extrabold text-xs font-mono shadow-sm">
                1021
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-pink-700">
                  Yves TRAORÉ
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Stagiaire Développeur</div>
              </div>
            </div>
            <span className="text-[10px] bg-pink-200 text-pink-900 px-2.5 py-0.5 rounded-full font-extrabold border border-pink-300">
              STAGIAIRE
            </span>
          </button>
        </div>

        <div className="mt-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          VOOMNET TECHNOLOGY © 2026 — Portail Joyeux & Dynamique
        </div>
      </div>
    </div>
  );
};
