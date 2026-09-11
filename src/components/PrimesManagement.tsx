'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Settings,
  Save,
  Award,
  Users,
  Search,
  DollarSign,
  Gift,
  Building2,
  Database,
} from 'lucide-react';
import { PrimeDatabaseViewerModal } from '@/components/PrimeDatabaseViewerModal';

export const PrimesManagement: React.FC = () => {
  const {
    user,
    employees,
    primeConfig,
    updatePrimeConfig,
    primeAttributions,
    attributePrime,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('Tous');
  const [showDbModal, setShowDbModal] = useState(false);

  // SuperAdmin Config Form State
  const [montantRefInput, setMontantRefInput] = useState<number>(primeConfig.montantReference);
  const [periodeNomInput, setPeriodeNomInput] = useState<string>(primeConfig.periodeNom);

  if (!user) return null;

  const isSuperAdmin = user.role === 'SuperAdmin';
  const isAdminRH = user.role === 'Admin' || (user.role as string) === 'Admin RH';
  const isEmploye = user.role === 'Employé';

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrimeConfig({
      montantReference: Number(montantRefInput),
      periodeNom: periodeNomInput,
    });
  };

  // Find prime attribution for an employee for the current period
  const getEmployeePrime = (matricule: string) => {
    return (primeAttributions || []).find(
      (p) =>
        p &&
        p.matricule === matricule &&
        (p.periodeNom === primeConfig.periodeNom || !p.periodeNom)
    );
  };

  // Regular Employee View
  if (isEmploye) {
    const myPrime = getEmployeePrime(user.matricule);
    const isGranted = myPrime?.statut === 'Accordée';
    const isRefused = myPrime?.statut === 'Refusée';

    return (
      <div className="space-y-6 max-w-4xl">
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2 border border-amber-200">
              <Gift className="w-3.5 h-3.5 text-amber-600" />
              Espace Collaborateur VOOMNET — Suivi Prime
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Ma Prime Trimestrielle
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Période active : <strong className="text-amber-700">{primeConfig.periodeNom}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDbModal(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
              title="Inspecter la table PostgreSQL prime_attributions dans Neon DB"
            >
              <Database className="w-4 h-4 text-blue-600" />
              <span>Voir Base Neon SQL</span>
            </button>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right shrink-0">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Montant de Référence
              </div>
              <div className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">
                {primeConfig.montantReference.toLocaleString('fr-FR')} FCFA
              </div>
            </div>
          </div>
        </div>

        {/* Prime Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Décision RH pour le {primeConfig.periodeNom}
                </h4>
                <p className="text-xs text-slate-500">
                  Collaborateur : {user.prenom} {user.nom} ({user.statut})
                </p>
              </div>
            </div>

            {isGranted && (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                ACCORDÉE
              </span>
            )}
            {isRefused && (
              <span className="px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-extrabold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                NON ATTRIBUÉE
              </span>
            )}
            {!isGranted && !isRefused && (
              <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                EN ATTENTE D&apos;ATTRIBUTION
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Montant attribué
              </span>
              <span className="text-2xl font-mono font-extrabold text-slate-900 block">
                {isGranted ? `${myPrime?.montant?.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Remarque & Motif RH
              </span>
              <span className="text-xs font-semibold text-slate-800 block leading-relaxed">
                {myPrime?.motif || 'Décision en cours d\'étude par la Direction des Ressources Humaines.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin RH & SuperAdmin View
  const filteredEmployees = (employees || []).filter((emp) => {
    if (!emp) return false;
    const search = searchTerm.toLowerCase();
    const matchSearch =
      emp.nom.toLowerCase().includes(search) ||
      emp.prenom.toLowerCase().includes(search) ||
      emp.matricule.toLowerCase().includes(search) ||
      emp.poste.toLowerCase().includes(search);

    const prime = getEmployeePrime(emp.matricule);
    const matchStatut =
      filterStatut === 'Tous'
        ? true
        : filterStatut === 'Accordée'
        ? prime?.statut === 'Accordée'
        : filterStatut === 'Refusée'
        ? prime?.statut === 'Refusée'
        : !prime || prime?.statut === 'En attente';

    return matchSearch && matchStatut;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold mb-2 border border-amber-200">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            Espace {isSuperAdmin ? 'Superadministrateur' : 'Administrateur RH'}
          </div>
          <h3 className="text-2xl font-bold text-slate-900">
            Attribution des Primes Trimestrielles
          </h3>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Attribution manuelle au cas par cas pour tous les collaborateurs (CDI, CDD, Stagiaires) pour la période <strong className="text-amber-700">{primeConfig.periodeNom}</strong>.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right shrink-0">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Montant de Référence
          </div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">
            {primeConfig.montantReference.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
      </div>

      {/* SuperAdmin Configuration Panel */}
      {isSuperAdmin && (
        <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
            <Settings className="w-5 h-5 text-purple-600" />
            <span>Configuration du Montant de Référence & Période (SuperAdmin)</span>
          </div>

          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nom de la Période Trimestrielle
              </label>
              <input
                type="text"
                required
                value={periodeNomInput}
                onChange={(e) => setPeriodeNomInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Montant de Référence (FCFA)
              </label>
              <input
                type="number"
                required
                min={0}
                step={5000}
                value={montantRefInput}
                onChange={(e) => setMontantRefInput(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-amber-400 rounded-xl text-amber-800 font-mono font-bold text-xs"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Enregistrer la Configuration
            </button>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un employé par nom, matricule..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
          <span className="px-2 text-[10px] uppercase font-bold text-slate-400">Statut Prime :</span>
          {['Tous', 'En attente', 'Accordée', 'Refusée'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatut(st)}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatut === st ? 'bg-amber-500 text-white font-bold' : 'hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Attribution Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Collaborateur</th>
                <th className="py-3.5 px-4">Matricule 3CX</th>
                <th className="py-3.5 px-4">Contrat & Service</th>
                <th className="py-3.5 px-4">Statut Décision RH</th>
                <th className="py-3.5 px-4">Montant Alloué</th>
                <th className="py-3.5 px-4">Motif / Remarque RH</th>
                <th className="py-3.5 px-4 text-right">Action Attribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.map((emp) => {
                const prime = getEmployeePrime(emp.matricule);
                const isGranted = prime?.statut === 'Accordée';
                const isRefused = prime?.statut === 'Refusée';

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.nom}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {emp.prenom} {emp.nom}
                          </div>
                          <div className="text-[10px] text-slate-500">{emp.poste}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      <span className="px-2.5 py-1 bg-slate-50 rounded border border-slate-200">
                        {emp.matricule}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          emp.statut === 'CDI'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : emp.statut === 'CDD'
                            ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                            : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {emp.statut}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-0.5">{emp.departement}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {isGranted && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accordée
                        </span>
                      )}
                      {isRefused && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 w-max">
                          <XCircle className="w-3.5 h-3.5" />
                          Refusée
                        </span>
                      )}
                      {!isGranted && !isRefused && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1 w-max">
                          <Clock className="w-3.5 h-3.5" />
                          En attente
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      {isGranted ? (
                        <span className="text-emerald-600">
                          {prime?.montant?.toLocaleString('fr-FR')} FCFA
                        </span>
                      ) : (
                        <span className="text-slate-400">0 FCFA</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-600 text-[11px] truncate">
                        {prime?.motif || 'Aucune remarque saisie.'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            const motif = prompt(
                              `Accorder la prime de ${primeConfig.montantReference.toLocaleString('fr-FR')} FCFA à ${emp.prenom} ${emp.nom} ?\nRemarque / Motif d'attribution :`,
                              prime?.motif || 'Prime trimestrielle accordée par l\'administration.'
                            );
                            if (motif !== null) {
                              attributePrime(emp.matricule, 'Accordée', motif);
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accorder
                        </button>

                        <button
                          onClick={() => {
                            const motif = prompt(
                              `Refuser la prime trimestrielle pour ${emp.prenom} ${emp.nom} ?\nMotif du refus :`,
                              prime?.motif || 'Prime non attribuée pour ce trimestre.'
                            );
                            if (motif !== null) {
                              attributePrime(emp.matricule, 'Refusée', motif);
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <PrimeDatabaseViewerModal
        isOpen={showDbModal}
        onClose={() => setShowDbModal(false)}
      />
    </div>
  );
};
