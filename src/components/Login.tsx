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
      setError('Veuillez saisir votre numéro de matricule (Poste 3CX).');
      return;
    }
    const success = login(matricule);
    if (!success) {
      setError('Matricule introuvable. Choisissez un compte de démonstration ci-dessous.');
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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white shadow-lg mb-3">
            <PhoneCall className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            VOOMNET TECH RH
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestion des 3 Rôles : SuperAdmin, Admin RH & Employé (CDI, CDD, Stagiaire)
          </p>
        </div>

        {/* Notice badge */}
        <div className="mb-5 p-3 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-300 text-xs flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-white">Connexion Matricule (Poste 3CX)</span>
            Entrez votre numéro de poste interne (ex: 9999, 1000, 1009, 1015, 1021).
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Matricule (N° Poste 3CX)
            </label>
            <div className="relative">
              <PhoneCall className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Ex: 9999 ou 1000"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Mot de passe démo : <code className="text-blue-400 font-bold">voomnet2026</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all"
          >
            Se connecter au portail RH
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Account Shortcuts for 3 Roles */}
        <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Sélectionnez un rôle pour tester :
          </div>

          {/* SuperAdmin */}
          <button
            onClick={() => handleQuickDemo('9999')}
            className="w-full p-2.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 rounded-xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs font-mono">
                9999
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300">
                  Alexandre VOHOU
                </div>
                <div className="text-[10px] text-slate-400">CRUD Users, Attribuer Rôles & Config Primes</div>
              </div>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-500/30">
              SuperAdmin
            </span>
          </button>

          {/* Admin RH */}
          <button
            onClick={() => handleQuickDemo('1000')}
            className="w-full p-2.5 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 rounded-xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-xs font-mono">
                1000
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-300">
                  Marc KOUASSI
                </div>
                <div className="text-[10px] text-slate-400">Valider Congés, Suivi Primes & Notes RH</div>
              </div>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-bold border border-blue-500/30">
              Admin RH
            </span>
          </button>

          {/* Employé CDI */}
          <button
            onClick={() => handleQuickDemo('1009')}
            className="w-full p-2.5 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/50 rounded-xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-xs font-mono">
                1009
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300">
                  Sarah BAMBA
                </div>
                <div className="text-[10px] text-slate-400">Ingénieure Réseau • Vue uniquement son poste</div>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
              Employé CDI
            </span>
          </button>

          {/* Employé CDD */}
          <button
            onClick={() => handleQuickDemo('1015')}
            className="w-full p-2.5 bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/50 rounded-xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs font-mono">
                1015
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-cyan-300">
                  Awa DIABATÉ
                </div>
                <div className="text-[10px] text-slate-400">Développeuse Frontend</div>
              </div>
            </div>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-500/30">
              Employé CDD
            </span>
          </button>

          {/* Employé STAGIAIRE */}
          <button
            onClick={() => handleQuickDemo('1021')}
            className="w-full p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl flex items-center justify-between text-left group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs font-mono">
                1021
              </div>
              <div>
                <div className="text-xs font-bold text-white group-hover:text-purple-300">
                  Yves TRAORÉ
                </div>
                <div className="text-[10px] text-slate-400">Stagiaire Développeur</div>
              </div>
            </div>
            <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-bold border border-purple-500/30">
              STAGIAIRE
            </span>
          </button>
        </div>

        <div className="mt-5 text-center text-[10px] text-slate-500">
          VOOMNET TECHNOLOGY © 2026 — Rôles & Sécurité RH
        </div>
      </div>
    </div>
  );
};
