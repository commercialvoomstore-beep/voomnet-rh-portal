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
} from 'lucide-react';
import {
  SUPPORTED_PROVIDERS,
  DatabaseProvider,
  getActiveProvider,
  setActiveProvider,
} from '@/lib/databaseAdapter';
import {
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured,
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
  const [selectedProvider, setSelectedProvider] = useState<DatabaseProvider>('SUPABASE');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [prismaConnectionUrl, setPrismaConnectionUrl] = useState('');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSelectedProvider(getActiveProvider());
      setSupabaseUrl(localStorage.getItem('VOOMNET_SUPABASE_URL') || '');
      setSupabaseKey(localStorage.getItem('VOOMNET_SUPABASE_ANON_KEY') || '');
      setPrismaConnectionUrl(localStorage.getItem('VOOMNET_PRISMA_URL') || '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      setActiveProvider(selectedProvider);

      if (selectedProvider === 'SUPABASE') {
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
      } else if (selectedProvider === 'PRISMA_SQL') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('VOOMNET_PRISMA_URL', prismaConnectionUrl);
        }
        setTestResult({
          success: true,
          message: 'Chaine de connexion SQL enregistrée pour le serveur Prisma / PostgreSQL.',
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

  const sqlScript = `-- SCRIPT DE CRÉATION DE BASE DE DONNÉES UNIVERSEL (PostgreSQL / MySQL / MariaDB)

CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    matricule VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    position VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
    base_salary DECIMAL(12, 2) NOT NULL DEFAULT 350000,
    hire_date DATE NOT NULL,
    avatar_url TEXT
);

CREATE TABLE chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    text TEXT NOT NULL,
    delivered BOOLEAN DEFAULT TRUE,
    delivery_status VARCHAR(100) DEFAULT '✓✓ Envoyé & Distribué au Poste',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

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
                Connecteur Multi-Base de Données VOOMNET
              </h3>
              <p className="text-xs text-slate-400">
                Choisissez et configurez le type de base de données (SQL, NoSQL, ORM ou Fichier local)
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
                    {prov.id === 'SUPABASE' && <Database className="w-4 h-4 text-emerald-400" />}
                    {prov.id === 'PRISMA_SQL' && <Server className="w-4 h-4 text-blue-400" />}
                    {prov.id === 'FIREBASE' && <Flame className="w-4 h-4 text-amber-400" />}
                    {prov.id === 'MONGODB' && <FileCode2 className="w-4 h-4 text-teal-400" />}
                    {prov.id === 'SQLITE_LOCAL' && <HardDrive className="w-4 h-4 text-purple-400" />}
                  </div>

                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      <span>{prov.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {prov.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                      {prov.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Configuration Form based on selected provider */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
            <h4 className="font-bold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" />
              2. Paramètres de connexion : {selectedProvider}
            </h4>

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

            {selectedProvider === 'PRISMA_SQL' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-400 mb-1">Chaîne de Connexion PostgreSQL / MySQL / OVH :</label>
                  <input
                    type="text"
                    placeholder="postgresql://user:password@localhost:5432/voomnet_db"
                    value={prismaConnectionUrl}
                    onChange={(e) => setPrismaConnectionUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Prisma permet de connecter n&apos;importe quel serveur PostgreSQL, MySQL, MariaDB ou MS SQL hébergé chez OVH, LWS, AWS, Render ou sur votre propre serveur Linux VPS.
                </p>
              </div>
            )}

            {selectedProvider === 'FIREBASE' && (
              <div className="text-[11px] text-slate-400 leading-relaxed space-y-2">
                <p>
                  Pour utiliser Google Firebase, collez l&apos;objet de configuration Firebase (`firebaseConfig`) de votre console Google Cloud dans le fichier `.env.local`.
                </p>
                <code className="block p-2.5 bg-slate-900 rounded-xl text-amber-300 font-mono">
                  NEXT_PUBLIC_FIREBASE_API_KEY=&quot;AIzaSy...&quot;<br />
                  NEXT_PUBLIC_FIREBASE_PROJECT_ID=&quot;voomnet-rh&quot;
                </code>
              </div>
            )}

            {selectedProvider === 'MONGODB' && (
              <div className="text-[11px] text-slate-400 leading-relaxed space-y-2">
                <p>
                  Saisissez l&apos;URI de connexion MongoDB Atlas dans votre fichier d&apos;environnement :
                </p>
                <code className="block p-2.5 bg-slate-900 rounded-xl text-teal-300 font-mono">
                  MONGODB_URI=&quot;mongodb+srv://user:pass@cluster.mongodb.net/voomnet_rh&quot;
                </code>
              </div>
            )}

            {selectedProvider === 'SQLITE_LOCAL' && (
              <div className="text-[11px] text-slate-400 leading-relaxed">
                SQLite enregistre l&apos;intégralité des données dans un fichier local `.sqlite3` léger sur le serveur web sans aucun abonnement cloud.
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
            {testing ? 'Test...' : 'Activer & Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};
