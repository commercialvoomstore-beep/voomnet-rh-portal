'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { PhoneCall, Lock, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, employees } = useApp();
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('voomnet2026');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricule.trim()) {
      setError('Veuillez saisir votre numéro de matricule (Poste 3CX) ou votre email.');
      return;
    }
    if (!password.trim()) {
      setError('Veuillez saisir votre mot de passe pour vous connecter.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await login(matricule.trim(), password.trim());
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Identifiant ou mot de passe incorrect. Vérifiez vos identifiants.');
    }
  };

  const handleQuickLogin = async (targetMatricule: string) => {
    setMatricule(targetMatricule);
    const emp = employees.find((e) => e.matricule === targetMatricule);
    const pwd = emp?.motDePasse || 'voomnet2026';
    setPassword(pwd);
    setLoading(true);
    setError('');
    const res = await login(targetMatricule, pwd);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Connexion échouée.');
    }
  };

  const defaultQuickAccounts = [
    { label: '👑 SuperAdmin (9999)', matricule: '9999', role: 'SuperAdmin' },
    { label: '🛡️ Admin RH (1012)', matricule: '1012', role: 'Admin' },
    { label: '👤 Employé (1015)', matricule: '1015', role: 'Employé' },
    { label: '👤 Employé (1001)', matricule: '1001', role: 'Admin' },
  ];

  // Combine default accounts with any live employees in state
  const quickAccounts = defaultQuickAccounts;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-8 relative overflow-hidden">
      {/* Soft background ambient glows in logo colors */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-gradient-to-tr from-purple-200/40 via-indigo-100/50 to-blue-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 relative z-10 text-slate-800">
        {/* Logo VOOMNET TECHNOLOGY */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-100 shadow-sm mb-3">
            <img
              src="/logo.png"
              alt="VOOMNET TECHNOLOGY Logo"
              className="h-16 object-contain max-w-[260px]"
            />
          </div>
          <h2 className="text-xl font-extrabold text-[#0E125E] tracking-tight">
            Espace de Connexion
          </h2>
        </div>

        {/* Notice badge */}
        <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 text-xs flex items-start gap-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#5E1675] shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block text-[#0E125E]">Connexion Matricule (Poste 3CX) ou Email</span>
            Saisissez votre poste 3CX ou email. Mot de passe par défaut : <code className="bg-purple-100 text-purple-900 px-1.5 py-0.5 rounded font-mono font-bold">voomnet2026</code>
          </div>
        </div>

        {/* Quick Account Switcher Chips */}
        <div className="mb-5 p-3.5 bg-gradient-to-br from-slate-50 to-purple-50/50 border border-purple-100 rounded-2xl">
          <div className="text-[11px] font-extrabold text-[#0E125E] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#5E1675]" />
            Connexion Rapide 1-Clic par Poste
          </div>
          <div className="grid grid-cols-2 gap-2">
            {quickAccounts.map((acc) => (
              <button
                key={acc.matricule}
                type="button"
                onClick={() => handleQuickLogin(acc.matricule)}
                className="px-2.5 py-2 bg-white hover:bg-purple-600 hover:text-white border border-slate-200 hover:border-purple-600 rounded-xl text-left transition-all shadow-xs group"
              >
                <div className="text-xs font-bold truncate group-hover:text-white">
                  {acc.label}
                </div>
                <div className="text-[10px] text-slate-400 font-mono group-hover:text-purple-100">
                  Matricule: {acc.matricule}
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-300 rounded-2xl text-rose-700 text-xs font-bold shadow-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-[#0E125E] mb-1.5">
              Matricule 3CX ou Adresse Email *
            </label>
            <div className="relative">
              <PhoneCall className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Ex: 9999, 1012, 1015 ou email@voomnet.com"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-[#5E1675] focus:ring-2 focus:ring-purple-100 font-mono font-bold transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-[#0E125E] mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="voomnet2026"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 text-sm focus:outline-none focus:border-[#5E1675] focus:ring-2 focus:ring-purple-100 font-bold transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-4 bg-gradient-to-r from-[#0E125E] to-[#5E1675] hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-purple-900/10 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter au portail RH'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-5">
          VOOMNET TECHNOLOGY © 2026
        </div>
      </div>
    </div>
  );
};
