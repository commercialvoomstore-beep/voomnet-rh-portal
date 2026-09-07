'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Zap,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Cpu,
  History,
  X,
  Play,
  Settings,
  Save,
  Calendar,
  FileCheck,
} from 'lucide-react';

export const PrimesEngine: React.FC = () => {
  const {
    primes,
    primeConfig,
    updatePrimeConfig,
    user,
    restorePrime,
    simulateUnjustifiedAbsence,
    auditLogs,
    employees,
    showNotificationAlert,
  } = useApp();

  if (!user) return null;

  const isSuperAdmin = user.role === 'SuperAdmin';
  const isAdminRH = user.role === 'Admin RH';
  const isEmploye = user.role === 'Employé';

  const displayedPrimes = isEmploye
    ? primes.filter((p) => p.matricule === user.matricule)
    : primes;

  // State for SuperAdmin Config Panel
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [refAmountInput, setRefAmountInput] = useState(primeConfig.montantReference);

  // State for Restoration Modal
  const [selectedMatriculeToSimulate, setSelectedMatriculeToSimulate] = useState('1009');
  const [restorationModal, setRestorationModal] = useState<{
    open: boolean;
    matricule: string;
    nomPrenom: string;
  }>({ open: false, matricule: '', nomPrenom: '' });

  const [motifRestauration, setMotifRestauration] = useState('');

  const handleOpenRestoreModal = (matricule: string, nomPrenom: string) => {
    setRestorationModal({ open: true, matricule, nomPrenom });
    setMotifRestauration('');
  };

  const handleConfirmRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motifRestauration) {
      alert('Veuillez saisir un motif de dérogation RH.');
      return;
    }
    restorePrime(restorationModal.matricule, motifRestauration);
    setRestorationModal({ open: false, matricule: '', nomPrenom: '' });
  };

  const handleSavePrimeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updatePrimeConfig({ montantReference: Number(refAmountInput) });
    setShowConfigPanel(false);
  };

  const handleRunCron = () => {
    showNotificationAlert(
      '⏰ Tâche Planifiée Cron (00h30)',
      'Recalcul global des primes terminé. Toutes les absences ont été passées en revue.',
      'INFO'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 p-6 rounded-2xl border border-amber-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/40">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Règle d&apos;Évaluation des Primes (Période de 3 Mois)
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40">
                  Calcul selon Date d&apos;Embauche
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {primeConfig.periodeNom}
              </h3>
              <div className="mt-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    RÈGLE PRÉCISE : Si la demande de permission est JUSTIFIÉE avec certificat fourni ➔ La prime est MAINTENUE / ACCORDÉE ({primeConfig.montantReference.toLocaleString('fr-FR')} FCFA).
                  </span>
                </div>
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>
                    RÈGLE STRICTE : Si au cours des 3 mois l&apos;employé envoie une demande d&apos;absence SANS JUSTIFICATIF ➔ La prime est ANNULÉE (0 FCFA).
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <button
                onClick={() => setShowConfigPanel(!showConfigPanel)}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
              >
                <Settings className="w-4 h-4" />
                Fixer le montant (SuperAdmin)
              </button>
            )}

            {!isEmploye && (
              <button
                onClick={handleRunCron}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                Cron Nocturne
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SuperAdmin Prime Config Panel */}
      {showConfigPanel && isSuperAdmin && (
        <div className="bg-slate-900 border-2 border-purple-500/50 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-400" />
              Fixer la Configuration des Primes (SuperAdmin)
            </h4>
            <button onClick={() => setShowConfigPanel(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSavePrimeConfig} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Période Trimestrielle</label>
              <input
                type="text"
                disabled
                value={primeConfig.periodeNom}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Montant de Référence par Employé (FCFA) *
              </label>
              <input
                type="number"
                required
                step="5000"
                value={refAmountInput}
                onChange={(e) => setRefAmountInput(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-950 border border-purple-600 rounded-xl text-white font-mono font-bold text-xs"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Appliquer le nouveau montant
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Simulator for Admin RH and SuperAdmin */}
      {!isEmploye && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Play className="w-4 h-4 text-emerald-400" />
            Test Live de la Règle d&apos;Annulation / Accordance
          </div>
          <p className="text-xs text-slate-300">
            Simulez un pointage absent sans justificatif pour observer le basculement immédiat du statut :
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <select
              value={selectedMatriculeToSimulate}
              onChange={(e) => setSelectedMatriculeToSimulate(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.matricule}>
                  Matricule {e.matricule} ({e.prenom} {e.nom} - Embauché le {e.dateEmbauche})
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                simulateUnjustifiedAbsence(
                  selectedMatriculeToSimulate,
                  new Date().toLocaleDateString('fr-FR')
                )
              }
              className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <AlertTriangle className="w-4 h-4" />
              Simuler Absence Non Justifiée
            </button>
          </div>
        </div>
      )}

      {/* Main Table displaying Hiring Dates for All Users */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            {isEmploye ? 'Ma Prime de Ponctualité' : 'Matrice des Primes (Affichage Date d\'Embauche & Justification)'}
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Période : <strong className="text-white">{primeConfig.periodeNom}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Matricule</th>
                <th className="py-3.5 px-4">Collaborateur & Rôle</th>
                <th className="py-3.5 px-4">Date d&apos;Embauche</th>
                <th className="py-3.5 px-4">Statut Prime T3</th>
                <th className="py-3.5 px-4">Montant Alloué</th>
                <th className="py-3.5 px-4">Détails Règle 3 Mois</th>
                {!isEmploye && <th className="py-3.5 px-4 text-right">Action RH</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {displayedPrimes.map((p) => (
                <tr key={p.matricule} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                    <span className="px-2 py-1 bg-slate-950 rounded border border-slate-700">
                      {p.matricule}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{p.nomPrenom}</div>
                    <div className="text-[10px] text-slate-400">[{p.statutCollaborateur} — {p.roleCollaborateur}]</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    <span className="inline-flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {p.dateEmbauche}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {p.eligible ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PRIME ACCORDÉE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
                        <XCircle className="w-3.5 h-3.5" />
                        PRIME ANNULÉE
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-sm">
                    {p.eligible ? (
                      <span className="text-emerald-400">
                        {p.montantCalcule.toLocaleString('fr-FR')} FCFA
                      </span>
                    ) : (
                      <span className="text-red-400 line-through">0 FCFA</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="text-[11px] leading-snug">
                      {p.eligible ? (
                        <span className="text-emerald-300 font-semibold">
                          {p.motifStatus || 'Absences toutes justifiées pendant les 3 mois — Prime Accordée'}
                        </span>
                      ) : (
                        <span className="text-red-300 font-semibold">
                          {p.motifStatus || 'Demande sans justificatif détectée ➔ Prime Annulée'}
                        </span>
                      )}
                    </div>
                  </td>

                  {!isEmploye && (
                    <td className="py-3.5 px-4 text-right">
                      {!p.eligible ? (
                        <button
                          onClick={() => handleOpenRestoreModal(p.matricule, p.nomPrenom)}
                          className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[11px] rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 ml-auto"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restaurer
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold">Conforme</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Restoration Modal */}
      {restorationModal.open && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setRestorationModal({ open: false, matricule: '', nomPrenom: '' })}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
              Restauration Manuelle de Prime
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Collaborateur : <strong className="text-white">{restorationModal.nomPrenom}</strong> (Matricule {restorationModal.matricule})
            </p>

            <form onSubmit={handleConfirmRestore} className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                L&apos;action sera consignée dans le journal d&apos;audit sous votre nom.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Motif de la Restauration *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Justificatif transmis ultérieurement et validé par la Direction..."
                  value={motifRestauration}
                  onChange={(e) => setMotifRestauration(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestorationModal({ open: false, matricule: '', nomPrenom: '' })}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  Rétablir la Prime ({primeConfig.montantReference.toLocaleString('fr-FR')} FCFA)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
