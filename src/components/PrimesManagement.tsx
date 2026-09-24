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
  X,
  Info,
} from 'lucide-react';

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

  // SuperAdmin Config Form State
  const [montantRefInput, setMontantRefInput] = useState<number>(primeConfig.montantReference);
  const [periodeNomInput, setPeriodeNomInput] = useState<string>(primeConfig.periodeNom);

  // Custom Decision Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    action: 'Accordée' | 'En attente' | 'Refusée';
    employee: any | null;
    motif: string;
    montant: number;
  }>({
    isOpen: false,
    action: 'Accordée',
    employee: null,
    motif: '',
    montant: 0,
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

    const initialMontant =
      existingPrime?.montant !== undefined && existingPrime?.montant !== null && existingPrime?.montant > 0
        ? existingPrime.montant
        : action === 'Accordée' || action === 'En attente'
        ? primeConfig.montantReference
        : 0;

    setModalState({
      isOpen: true,
      action,
      employee: emp,
      motif: defaultMotif,
      montant: initialMontant,
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalState.employee) return;
    attributePrime(
      modalState.employee.matricule,
      modalState.action,
      modalState.motif,
      modalState.montant
    );
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
    const hasDecision = isGranted || isRefused;

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

        {/* Info-Bulle Highlight Card if decision rendered */}
        {hasDecision && (
          <div className="p-4 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl text-white shadow-md border border-purple-500/30 flex items-start gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-400/30 shrink-0">
              <Info className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 bg-purple-500 text-white font-mono font-extrabold text-[10px] rounded uppercase shadow">
                  Info-Bulle N°1
                </span>
                <span className="text-xs font-bold text-purple-200">
                  Notification de Décision RH
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {isGranted
                  ? `Votre prime trimestrielle de ${myPrime?.montant?.toLocaleString('fr-FR')} FCFA a été accordée.`
                  : 'Votre dossier de prime trimestrielle n\'a pas été accordé pour ce trimestre.'}
              </p>
            </div>
          </div>
        )}

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

    if (!matchSearch) return false;

    const prime = getEmployeePrime(emp.matricule);
    const status = prime?.statut || 'En attente';

    if (filterStatut === 'Tous') return true;
    if (filterStatut === 'Accordée') return status === 'Accordée';
    if (filterStatut === 'En attente') return status === 'En attente';
    if (filterStatut === 'Refusée') return status === 'Refusée';

    return true;
  });

  return (
    <div className="space-y-6">
      {/* SuperAdmin Global Configuration Box */}
      {isSuperAdmin && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-extrabold tracking-wider uppercase text-purple-200">
                Configuration Générale des Primes (Privilège SuperAdmin)
              </h3>
            </div>
            <span className="text-[10px] bg-purple-500/20 border border-purple-400/30 text-purple-300 font-mono font-extrabold px-2.5 py-1 rounded-full">
              Paramètres Globaux RH
            </span>
          </div>

          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Montant de Référence (FCFA)
              </label>
              <input
                type="number"
                min="0"
                step="5000"
                value={montantRefInput}
                onChange={(e) => setMontantRefInput(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Libellé du Trimestre / Période
              </label>
              <input
                type="text"
                value={periodeNomInput}
                onChange={(e) => setPeriodeNomInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-semibold"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              Enregistrer la Configuration
            </button>
          </form>
        </div>
      )}

      {/* Main Admin RH Table Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1 border border-indigo-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            Gestion Administrative VOOMNET
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Attribution des Primes Trimestrielles — {primeConfig.periodeNom}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Attribuez ou refusez la prime trimestrielle des employés. Montant de référence :{' '}
            <strong className="text-amber-700">{primeConfig.montantReference.toLocaleString('fr-FR')} FCFA</strong>
          </p>
        </div>

        {/* Search & Filter tools */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher nom, matricule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Liste des Collaborateurs ({filteredEmployees.length})
            </h4>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-semibold text-slate-600">
            <span className="px-1.5 text-[10px] uppercase font-bold text-slate-400">Filtrer par :</span>
            {['Tous', 'Accordée', 'En attente', 'Refusée'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatut(st)}
                className={`px-2 py-0.5 rounded-lg transition-all ${
                  filterStatut === st
                    ? 'bg-purple-600 text-white'
                    : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Matricule & Employé</th>
                <th className="py-3.5 px-4">Poste & Contrat</th>
                <th className="py-3.5 px-4">Montant Attribué</th>
                <th className="py-3.5 px-4">Statut Décision</th>
                <th className="py-3.5 px-4">Remarque / Motif RH</th>
                <th className="py-3.5 px-4 text-right">Actions Décision RH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredEmployees.map((emp) => {
                const prime = getEmployeePrime(emp.matricule);
                const status = prime?.statut || 'En attente';

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.avatar}
                          alt={emp.nom}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">
                            {emp.prenom} {emp.nom}
                          </div>
                          <div className="text-[10px] font-mono text-purple-700 font-bold">
                            Matricule: {emp.matricule}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{emp.poste}</div>
                      <div className="text-[10px] text-slate-500">
                        {emp.departement} • <strong className="text-slate-700">{emp.statut}</strong>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                      {status === 'Accordée'
                        ? `${(prime?.montant ?? primeConfig.montantReference).toLocaleString('fr-FR')} FCFA`
                        : '0 FCFA'}
                    </td>

                    <td className="py-3.5 px-4">
                      {status === 'Accordée' && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accordée
                        </span>
                      )}
                      {status === 'Refusée' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-extrabold flex items-center gap-1 w-max">
                          <XCircle className="w-3.5 h-3.5" />
                          Refusée
                        </span>
                      )}
                      {status === 'En attente' && (
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-extrabold flex items-center gap-1 w-max">
                          <Clock className="w-3.5 h-3.5" />
                          En attente
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs text-[11px] text-slate-600 truncate">
                      {prime?.motif || 'Aucune note'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDecisionModal(emp, 'Accordée')}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1"
                          title="Accorder la prime"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accorder
                        </button>

                        <button
                          onClick={() => openDecisionModal(emp, 'Refusée')}
                          className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shadow-sm transition-all flex items-center gap-1"
                          title="Refuser la prime"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Refuser
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Aucun collaborateur ne correspond aux critères de recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Modal */}
      {modalState.isOpen && modalState.employee && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-scaleUp space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                Attribution de Prime — {modalState.employee.prenom} {modalState.employee.nom}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDecision} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Décision d&apos;Attribution
                </label>
                <select
                  value={modalState.action}
                  onChange={(e) =>
                    setModalState((prev) => ({
                      ...prev,
                      action: e.target.value as 'Accordée' | 'En attente' | 'Refusée',
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-bold"
                >
                  <option value="Accordée">Accordée</option>
                  <option value="En attente">En attente</option>
                  <option value="Refusée">Refusée</option>
                </select>
              </div>

              {modalState.action === 'Accordée' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Montant de la Prime (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={modalState.montant}
                    onChange={(e) =>
                      setModalState((prev) => ({ ...prev, montant: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motif / Remarque RH
                </label>
                <textarea
                  rows={3}
                  required
                  value={modalState.motif}
                  onChange={(e) =>
                    setModalState((prev) => ({ ...prev, motif: e.target.value }))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                  placeholder="Justification ou remarque relative à l'attribution..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Enregistrer la Décision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
