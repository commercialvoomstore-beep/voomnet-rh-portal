'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PhoneCall, Lock, ArrowRight, Shield } from 'lucide-react';

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

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-lg p-8 relative z-10 text-slate-800">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3">
            <PhoneCall className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            VOOMNET TECH RH
          </h2>
          <p className="text-xs font-bold text-blue-600 mt-1">
            Portail RH Pro — Gestion des 3 Rôles
          </p>
        </div>

        {/* Notice badge */}
        <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start gap-2.5 shadow-sm">
          <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-mono font-bold"
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 font-bold"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Mot de passe démo : <code className="text-blue-600 font-extrabold">voomnet2026</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            Se connecter au portail RH
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-5">
          VOOMNET TECHNOLOGY © 2026 — Portail RH Pro Clean Design
        </div>
      </div>
    </div>
  );
};
