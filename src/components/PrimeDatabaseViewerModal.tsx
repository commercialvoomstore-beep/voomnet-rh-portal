'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  X,
  Copy,
  CheckCircle2,
  Table,
  Zap,
  ShieldCheck,
  Search,
  Code2,
} from 'lucide-react';
import { fetchNeonPrimeAttributions, fetchNeonPrimeConfig } from '@/lib/neonDbService';

interface PrimeDatabaseViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrimeDatabaseViewerModal: React.FC<PrimeDatabaseViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [dbRows, setDbRows] = useState<any[]>([]);
  const [dbConfig, setDbConfig] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const attributions = await fetchNeonPrimeAttributions();
      if (attributions) {
        setDbRows(attributions);
      }
      const config = await fetchNeonPrimeConfig();
      if (config) {
        setDbConfig(config);
      }
    } catch (err) {
      console.error('Error fetching Neon DB prime records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sqlQueryText = `SELECT id, matricule, nom_prenom, periode_nom, statut, montant, motif, approved_by, created_at 
FROM prime_attributions 
ORDER BY created_at DESC;`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlQueryText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const filteredRows = dbRows.filter((r) => {
    const s = searchTerm.toLowerCase();
    return (
      (r.matricule && r.matricule.toLowerCase().includes(s)) ||
      (r.nomPrenom && r.nomPrenom.toLowerCase().includes(s)) ||
      (r.statut && r.statut.toLowerCase().includes(s)) ||
      (r.motif && r.motif.toLowerCase().includes(s))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] text-slate-900 animate-fadeIn">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-600">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Explorateur de Données Neon.tech — Table <code className="text-blue-600 font-mono">prime_attributions</code>
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  SQL Direct Neon.tech
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualisation en temps réel des enregistrements de primes stockés dans la base de données PostgreSQL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrer par matricule, nom, statut..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={copySqlToClipboard}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              {copiedSql ? 'Requête Copiée !' : 'Copier SQL'}
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Rechargement SQL...' : 'Rafraîchir depuis Neon'}
            </button>
          </div>
        </div>

        {/* Query Summary & Neon Info */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-700">
            <Table className="w-4 h-4 text-blue-600" />
            <span>Enregistrements Neon DB : <strong className="text-slate-900 font-extrabold">{filteredRows.length}</strong> ligne(s)</span>
          </div>

          {dbConfig && (
            <div className="text-slate-500 text-[11px]">
              Montant de référence global : <strong className="text-amber-700 font-extrabold">{dbConfig.montantReference?.toLocaleString('fr-FR')} FCFA</strong> ({dbConfig.periodeNom})
            </div>
          )}
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider font-mono">
                    <th className="py-3 px-3">ID SQL (UUID)</th>
                    <th className="py-3 px-3">Matricule</th>
                    <th className="py-3 px-3">Nom & Prénom</th>
                    <th className="py-3 px-3">Période</th>
                    <th className="py-3 px-3">Statut SQL</th>
                    <th className="py-3 px-3">Montant FCFA</th>
                    <th className="py-3 px-3">Motif / Remarque</th>
                    <th className="py-3 px-3">Auteur RH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono">
                  {filteredRows.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-[10px] text-slate-400 truncate max-w-[120px]">
                        {r.id}
                      </td>

                      <td className="py-3 px-3 font-bold text-blue-600">
                        <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                          {r.matricule}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-sans font-bold text-slate-900">
                        {r.nomPrenom || 'Collaborateur'}
                      </td>

                      <td className="py-3 px-3 text-[11px] text-slate-600">
                        {r.periodeNom}
                      </td>

                      <td className="py-3 px-3 font-sans font-bold">
                        {r.statut === 'Accordée' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            Accordée
                          </span>
                        ) : r.statut === 'Refusée' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            Refusée
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                            En attente
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900">
                        {r.montant ? `${Number(r.montant).toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
                      </td>

                      <td className="py-3 px-3 font-sans text-slate-600 max-w-xs truncate">
                        {r.motif || 'Aucune remarque'}
                      </td>

                      <td className="py-3 px-3 font-sans text-[11px] text-slate-500">
                        {r.approvedBy || 'Administration RH'}
                      </td>
                    </tr>
                  ))}

                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-sans text-xs">
                        {loading
                          ? 'Chargement des enregistrements SQL en cours...'
                          : 'Aucune donnée trouvée dans la table prime_attributions.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SQL Snippet Drawer */}
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-600" />
                Requête SQL DDL / DML exécutée sur Neon PostgreSQL :
              </span>
              <button
                onClick={copySqlToClipboard}
                className="text-[10px] text-blue-600 font-bold hover:underline"
              >
                Copier le code SQL
              </button>
            </div>
            <pre className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-mono text-slate-700 overflow-x-auto shadow-inner">
              {sqlQueryText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Serveur Neon PostgreSQL : SSL / TLS Sécurisé</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            Fermer l&apos;Explorateur
          </button>
        </div>
      </div>
    </div>
  );
};
