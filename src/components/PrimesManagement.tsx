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
  Eye,
  EyeOff,
  X,
} from 'lucide-react';

export const PrimesManagement: React.FC = () => {
  const {
    user,
    employees,
    primeConfig,
    updatePrimeConfig,
    primeAttributions,
    attributePrime,
    toggleMaskPrime,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('Tous');

  // SuperAdmin Config Form State
  const [montantRefInput, setMontantRefInput] = useState<number>(primeConfig.montantReference);
  const [periodeNomInput, setPeriodeNomInput] = useState<string>(primeConfig.periodeNom);

  // Custom Decision Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: 'Accordée' | 'En attente' | 'Refusée';
    employee: any | null;
    motif: string;
  }>({
    isOpen: false,
    action: 'Accordée',
    employee: null,
    motif: '',
  });

  if (!user) return null;

  const openDecisionModal = (emp: any, action: 'Accordée' | 'En attente' | 'Refusée') => {
    const existingPrime = getEmployeePrime(emp.matricule);
    const defaultMotif =
      existingPrime?.motif ||
      (action === 'Accordée'
        ? 'Prime trimestrielle accordée par l\'administration.'
        : action === 'En attente'
        ? 'Dossier de prime en cours d\'évaluation par la Direction RH.'
        : 'Prime non attribuée pour ce trimestre.');

    setModalState({
      isOpen: true,
      action,
      employee: emp,
      motif: defaultMotif,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalState.employee) return;
    attributePrime(modalState.employee.matricule, modalState.action, modalState.motif);
    closeModal();
  };

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
    const cleanMatricule = String(matricule || '').trim();
    return (primeAttributions || []).find(
      (p) => p && p.matricule && String(p.matricule).trim() === cleanMatricule
    );
  };

  // Regular Employee View
  if (isEmploye) {
    const myPrime = getEmployeePrime(user.matricule);
    const isGranted = myPrime?.statut === 'Accordée';
    const isRefused = myPrime?.statut === 'Refusée';
    const isMasked = !!myPrime?.masquee;

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

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right shrink-0">
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Montant de Référence
            </div>
            <div className="text-2xl font-extrabold text-amber-600 font-mono mt-0.5">
              {primeConfig.montantReference.toLocaleString('fr-FR')} FCFA
            </div>
          </div>
        </div>

        {/* Prime Status Card */}
        {isMasked ? (
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-700 border border-amber-200 shrink-0">
                <EyeOff className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Information de Prime Réservée par l&apos;Administration RH
                </h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  L&apos;affichage de votre prime pour la période <strong>{primeConfig.periodeNom}</strong> est temporairement masqué par la Direction RH en attente de la publication officielle.
                </p>
              </div>
            </div>
          </div>
        ) : (
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
        )}
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
                      <div className="flex flex-col gap-1">
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

                        {prime?.masquee && (
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold flex items-center gap-1 w-max">
                            <EyeOff className="w-3 h-3 text-amber-700" />
                            Masquée pour l&apos;employé
                          </span>
                        )}
                      </div>
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
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        <button
                          onClick={() => openDecisionModal(emp, 'Accordée')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all shrink-0"
                          title="Accorder la prime"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accorder</span>
                        </button>

                        <button
                          onClick={() => openDecisionModal(emp, 'En attente')}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all shrink-0"
                          title="Mettre la prime en attente"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>En attente</span>
                        </button>

                        <button
                          onClick={() => openDecisionModal(emp, 'Refusée')}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all shrink-0"
                          title="Refuser la prime"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Refuser</span>
                        </button>

                        <button
                          onClick={() => toggleMaskPrime(emp.matricule)}
                          className={`px-2.5 py-1.5 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1 transition-all shrink-0 ${
                            prime?.masquee
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                          }`}
                          title={prime?.masquee ? 'Démasquer / Publier la prime à l\'employé' : 'Masquer la prime à l\'employé'}
                        >
                          {prime?.masquee ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-amber-700" />
                              <span>Démasquer</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                              <span>Masquer</span>
                            </>
                          )}
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
      {/* Custom Prime Decision Modal */}
      {modalState.isOpen && modalState.employee && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all transform">
            {/* Modal Header according to Action */}
            <div
              className={`p-6 text-white flex items-center justify-between ${
                modalState.action === 'Accordée'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
                  : modalState.action === 'En attente'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-rose-600 to-red-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                  {modalState.action === 'Accordée' && <CheckCircle2 className="w-6 h-6 text-white" />}
                  {modalState.action === 'En attente' && <Clock className="w-6 h-6 text-white" />}
                  {modalState.action === 'Refusée' && <XCircle className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h4 className="text-lg font-extrabold tracking-tight">
                    {modalState.action === 'Accordée' && 'Accorder la Prime Trimestrielle'}
                    {modalState.action === 'En attente' && 'Mise en Attente de la Prime'}
                    {modalState.action === 'Refusée' && 'Refuser la Prime Trimestrielle'}
                  </h4>
                  <p className="text-xs text-white/80 font-medium">
                    {primeConfig.periodeNom}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmDecision} className="p-6 space-y-5">
              {/* Employee Summary Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3.5">
                <img
                  src={modalState.employee.avatar}
                  alt={modalState.employee.nom}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-slate-900 text-sm truncate">
                      {modalState.employee.prenom} {modalState.employee.nom}
                    </h5>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[10px] rounded border border-blue-200">
                      3CX #{modalState.employee.matricule}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">
                    {modalState.employee.poste} ({modalState.employee.statut})
                  </div>
                </div>
              </div>

              {/* Amount Display Card */}
              <div className="p-4 rounded-2xl border flex items-center justify-between bg-slate-50 border-slate-200">
                <span className="text-xs font-bold text-slate-600">
                  Montant concerné par la décision :
                </span>
                <span
                  className={`text-lg font-extrabold font-mono ${
                    modalState.action === 'Accordée'
                      ? 'text-emerald-600'
                      : modalState.action === 'En attente'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  {modalState.action === 'Accordée'
                    ? `${primeConfig.montantReference.toLocaleString('fr-FR')} FCFA`
                    : '0 FCFA'}
                </span>
              </div>

              {/* Motive / Remarks Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Motif & Remarque RH pour le collaborateur <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={modalState.motif}
                  onChange={(e) => setModalState((prev) => ({ ...prev, motif: e.target.value }))}
                  placeholder="Saisissez ici la justification ou les remarques RH..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500 transition-all"
                />
              </div>

              {/* Footer Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all ${
                    modalState.action === 'Accordée'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : modalState.action === 'En attente'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {modalState.action === 'Accordée' && (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirmer l&apos;Attribution
                    </>
                  )}
                  {modalState.action === 'En attente' && (
                    <>
                      <Clock className="w-4 h-4" />
                      Confirmer la Mise en Attente
                    </>
                  )}
                  {modalState.action === 'Refusée' && (
                    <>
                      <XCircle className="w-4 h-4" />
                      Confirmer le Refus
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
