'use client';

import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Splash: React.FC = () => {
  const { dismissSplash } = useApp();

  return (
    <div
      onClick={dismissSplash}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0D3A] via-[#1A0B40] to-[#3B0D4A] text-white cursor-pointer select-none overflow-hidden"
    >
      {/* Background Animated Glowing Ambient Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-8 py-10 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl max-w-lg mx-4 animate-fadeIn transform transition-transform duration-300 hover:scale-[1.01]">
        
        {/* Logo Container with Glow */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 opacity-60 blur-md group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative px-6 py-4 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <img
              src="/logo.png"
              alt="VOOMNET TECHNOLOGY"
              className="h-16 md:h-20 w-auto object-contain transition-transform duration-300"
            />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-mono font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin" />
          <span>PORTAIL RH ENTREPRISE 2026</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-2">
          VOOMNET TECHNOLOGY
        </h1>

        <p className="text-purple-200 text-xs md:text-sm font-medium max-w-sm mb-6 leading-relaxed">
          Système Intégré de Gestion des Ressources Humaines, Suivi des Absences & Primes Trimestrielles.
        </p>

        {/* Loading Progress Section */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-purple-200 px-1">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Initialisation des services...
            </span>
            <span className="text-emerald-300 font-bold">Prêt</span>
          </div>

          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/20">
            <div className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center gap-2 text-[11px] text-purple-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Cliquez n&apos;importe où pour ouvrir le portail</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 75%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
