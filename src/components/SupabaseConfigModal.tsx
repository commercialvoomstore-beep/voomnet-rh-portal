'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  Key,
  Globe,
  Copy,
  RefreshCw,
  X,
  Sparkles,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import {
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured,
  getSupabase,
} from '@/lib/supabaseClient';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'sql'>('config');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('VOOMNET_SUPABASE_URL') || '';
      const savedKey = localStorage.getItem('VOOMNET_SUPABASE_ANON_KEY') || '';
      setUrl(savedUrl);
      setAnonKey(savedKey);
      setIsConnected(isSupabaseConfigured());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url || !anonKey) {
      setTestResult({
        success: false,
        message: 'Veuillez saisir l\'URL et la Clé Anon Key de votre projet Supabase.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      saveSupabaseCredentials(url, anonKey);
      const supabase = getSupabase();
      const { data, error } = await supabase.from('employees').select('count', { count: 'exact', head: true });

      if (error && !error.message.includes('relation "public.employees" does not exist')) {
        throw error;
      }

      setIsConnected(true);
      setTestResult({
        success: true,
        message: 'Connexion réussie à votre base de données Supabase !',
      });
    } catch (err: any) {
      console.error(err);
      setIsConnected(false);
      setTestResult({
        success: false,
        message: `Erreur de connexion : ${err.message || 'Clé ou URL invalide'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setIsConnected(false);
    setTestResult({
      success: false,
      message: 'Configuration Supabase réinitialisée. Retour au mode local.',
    });
  };

  const sqlScript = `-- 1. TABLE EMPLOYEES
CREATE TABLE public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matricule VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    position VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
    base_salary NUMERIC(12, 2) NOT NULL DEFAULT 350000,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE CHAT MESSAGES
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    text TEXT NOT NULL,
    delivered BOOLEAN DEFAULT TRUE,
    delivery_status VARCHAR(100) DEFAULT '✓✓ Envoyé & Distribué au Poste',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write Chat" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Connexion Supabase PostgreSQL
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {isConnected ? '🟢 CONNECTÉ' : '⚪ HORS LIGNE (Mode Démo)'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Liez le Portail RH VOOMNET à votre instance de base de données Supabase cloud
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'config'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            Identifiants & Connexion
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sql'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Script SQL des Tables
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {activeTab === 'config' ? (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    URL du Projet Supabase (Project URL) *
                  </label>
                  <input
                    type="url"
                    placeholder="Ex: https://abcdefghijklm.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Trouvable dans Supabase -&gt; Project Settings -&gt; API
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-teal-400" />
                    Clé Publique Anonyme (Anon Key) *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                    testResult.success
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/60 border-red-500/40 text-red-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{testResult.success ? 'Succès' : 'Avertissement'}</div>
                    <div className="text-[11px] mt-0.5">{testResult.message}</div>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Mode Hybride Résilient
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Si vous laissez les champs vides ou sans base Supabase active, le Portail RH fonctionne automatiquement en **mode démo local** avec persistance des données.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-slate-300 font-semibold">
                  Copiez ce script SQL dans l&apos;éditeur SQL de Supabase (`SQL Editor`) pour créer les tables :
                </p>
                <button
                  onClick={copySqlToClipboard}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedSql ? 'Copié !' : 'Copier le SQL'}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-[300px]">
                {sqlScript}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center gap-3">
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="px-3.5 py-2 bg-slate-800 hover:bg-red-950/60 text-red-300 text-xs font-semibold rounded-xl border border-slate-700"
            >
              Déconnecter Supabase
            </button>
          )}

          <div className="ml-auto flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
            >
              Fermer
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Test en cours...' : 'Tester & Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
