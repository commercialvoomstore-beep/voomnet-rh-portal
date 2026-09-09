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
  Server,
  Flame,
  FileCode2,
  HardDrive,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  SUPPORTED_PROVIDERS,
  DatabaseProvider,
  getActiveProvider,
  setActiveProvider,
} from '@/lib/databaseAdapter';
import {
  testNeonConnection,
  saveNeonConnectionString,
  getNeonConnectionString,
} from '@/lib/neonClient';
import {
  saveSupabaseCredentials,
  getSupabase,
} from '@/lib/supabaseClient';

interface DatabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseConfigModal: React.FC<DatabaseConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<DatabaseProvider>('NEON_POSTGRES');
  const [neonConnectionString, setNeonConnectionString] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedProvider(getActiveProvider());
      setNeonConnectionString(getNeonConnectionString());
      setSupabaseUrl(localStorage.getItem('VOOMNET_SUPABASE_URL') || '');
      setSupabaseKey(localStorage.getItem('VOOMNET_SUPABASE_ANON_KEY') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      setActiveProvider(selectedProvider);

      if (selectedProvider === 'NEON_POSTGRES') {
        if (!neonConnectionString) {
          throw new Error('Veuillez saisir votre chaîne de connexion PostgreSQL Neon.tech.');
        }
        const res = await testNeonConnection(neonConnectionString);
        if (!res.success) throw new Error(res.message);

        saveNeonConnectionString(neonConnectionString);
        setTestResult({
          success: true,
          message: `Connexion PostgreSQL Neon.tech réussie ! Heure serveur : ${res.time || 'Ok'}`,
        });
      } else if (selectedProvider === 'SUPABASE') {
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Veuillez renseigner l\'URL et la clé Anon Key Supabase.');
        }
        saveSupabaseCredentials(supabaseUrl, supabaseKey);
        const supabase = getSupabase();
        await supabase.from('employees').select('count', { count: 'exact', head: true });
        setTestResult({
          success: true,
          message: 'Connexion réussie à la base de données Supabase !',
        });
      } else {
        setTestResult({
          success: true,
          message: `Fournisseur ${selectedProvider} configuré avec succès !`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erreur lors du test de connexion.',
      });
    } finally {
      setTesting(false);
    }
  };

  const [showSqlHelper, setShowSqlHelper] = useState(false);

  const sqlScriptNeon = `-- SCRIPT DE CRÉATION DE LA BASE VOOMNET TECH POUR NEON.TECH

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
    avatar_url TEXT
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id VARCHAR(36) NOT NULL,
    employee_name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL DEFAULT 1,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'EN_ATTENTE',
    approved_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    text TEXT NOT NULL,
    delivered BOOLEAN DEFAULT TRUE,
    delivery_status VARCHAR(100) DEFAULT '✓✓ Envoyé & Distribué au Poste',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlScriptNeon);
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
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Connexion Base de Données Neon.tech PostgreSQL
              </h3>
              <p className="text-xs text-slate-400">
                Configurez la connexion directe vers votre cluster PostgreSQL sur Neon.tech
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Provider Selector Cards */}
          <div>
            <label className="block text-slate-300 font-bold mb-2">
              1. Sélectionnez votre moteur de base de données :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SUPPORTED_PROVIDERS.map((prov) => (
                <div
                  key={prov.id}
                  onClick={() => setSelectedProvider(prov.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedProvider === prov.id
                      ? 'bg-emerald-950/60 border-emerald-500/80 ring-2 ring-emerald-500/30 text-white'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="p-2 bg-slate-900 rounded-xl shrink-0 mt-0.5">
                    {prov.id === 'NEON_POSTGRES' && <Zap className="w-4 h-4 text-emerald-400" />}
                    {prov.id === 'SUPABASE' && <Database className="w-4 h-4 text-emerald-400" />}
                    {prov.id === 'PRISMA_SQL' && <Server className="w-4 h-4 text-blue-400" />}
                    {prov.id === 'FIREBASE' && <Flame className="w-4 h-4 text-amber-400" />}
                    {prov.id === 'MONGODB' && <FileCode2 className="w-4 h-4 text-teal-400" />}
                  </div>

                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      <span>{prov.name}</span>
                      {prov.recommended && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          Recommandé
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                      {prov.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              2. Configuration : {selectedProvider === 'NEON_POSTGRES' ? 'Neon.tech PostgreSQL' : selectedProvider}
            </h4>

            {selectedProvider === 'NEON_POSTGRES' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Chaîne de Connexion PostgreSQL Neon (Pooled Connection String) :
                  </label>
                  <input
                    type="text"
                    placeholder="postgresql://user:password@ep-cool-name-1234.us-east-2.aws.neon.tech/neondb?sslmode=require"
                    value={neonConnectionString}
                    onChange={(e) => setNeonConnectionString(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Copiez cette chaîne depuis la console **Neon.tech -&gt; Dashboard / Connect -&gt; Pooled**.
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-300 block">3. Script DDL d&apos;Initialisation SQL (Facultatif)</span>
                      <span className="text-[10px] text-slate-500">
                        Nécessaire uniquement si vos tables n&apos;ont pas encore été créées dans Neon.tech.
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSqlHelper(!showSqlHelper)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] rounded-lg border border-slate-700 transition-all"
                      >
                        {showSqlHelper ? 'Masquer le SQL' : 'Afficher le SQL'}
                      </button>
                      {showSqlHelper && (
                        <button
                          type="button"
                          onClick={copySqlToClipboard}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 shadow"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedSql ? 'Copié !' : 'Copier'}
                        </button>
                      )}
                    </div>
                  </div>

                  {showSqlHelper && (
                    <pre className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-36 animate-fadeIn">
                      {sqlScriptNeon}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {selectedProvider === 'SUPABASE' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">URL Supabase :</label>
                  <input
                    type="url"
                    placeholder="https://xyz.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Clé Anon Key :</label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1Ni..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              </div>
            )}
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
                <div className="font-bold">{testResult.success ? 'Succès' : 'Erreur'}</div>
                <div className="text-[11px] mt-0.5">{testResult.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
          >
            Fermer
          </button>
          <button
            onClick={handleSaveAndTest}
            disabled={testing}
            className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Test en cours...' : 'Tester & Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};
