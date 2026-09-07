'use client';

import React from 'react';
import { ShieldCheck, Cpu, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Splash: React.FC = () => {
  const { dismissSplash } = useApp();

  return (
    <div
      onClick={dismissSplash}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white cursor-pointer select-none overflow-hidden"
    >
      {/* Background Animated Gradient & Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fadeIn">
        <div className="relative mb-6">
          {/* Outer glowing ring */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-500 opacity-75 blur-lg animate-pulse-glow" />
          
          <div className="relative w-28 h-28 rounded-2xl bg-slate-900 border border-blue-500/40 shadow-2xl flex items-center justify-center text-blue-400">
            <Cpu className="w-16 h-16 animate-pulse" />
            <span className="absolute bottom-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
          VOOMNET TECHNOLOGY
        </h1>

        <div className="mt-2 flex items-center gap-2 text-sm font-semibold tracking-widest text-blue-400 uppercase">
          <ShieldCheck className="w-4 h-[#0052CC]" />
          VOOMNET TECH RH — Solution Gestion RH 2026
        </div>

        <p className="mt-4 text-slate-400 text-sm max-w-md">
          Gestion du personnel, suivi des présences 3CX & Moteur automatisé de calcul des primes.
        </p>

        {/* Loading Bar */}
        <div className="mt-8 w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 animate-[loading_2s_ease-in-out_infinite]" />
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Cliquez pour continuer vers l&apos;application • V2.4 (React / Next.js)
        </p>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};
