'use client';

import React from 'react';
import { ShieldCheck, Cpu } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export const Splash: React.FC = () => {
  const { dismissSplash } = useApp();

  return (
    <div
      onClick={dismissSplash}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 text-slate-900 cursor-pointer select-none overflow-hidden"
    >
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-100" />

      {/* Main Logo Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 animate-fadeIn">
        <div className="relative mb-6">
          <div className="relative w-28 h-28 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center text-blue-600">
            <Cpu className="w-16 h-16" />
            <span className="absolute bottom-2 right-2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
          VOOMNET TECHNOLOGY
        </h1>

        <div className="mt-2 flex items-center gap-2 text-sm font-semibold tracking-widest text-blue-600 uppercase">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          VOOMNET TECH RH — Solution Gestion RH 2026
        </div>

        <p className="mt-4 text-slate-600 text-sm max-w-md">
          Gestion du personnel & suivi des présences 3CX.
        </p>

        {/* Loading Bar */}
        <div className="mt-8 w-64 h-1.5 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
          <div className="h-full bg-blue-600 animate-[loading_2s_ease-in-out_infinite]" />
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
