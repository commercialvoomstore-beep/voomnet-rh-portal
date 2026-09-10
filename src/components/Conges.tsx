'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AbsenceRequest } from '@/data/mockData';
import {
  CalendarCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  PlusCircle,
  Hash,
  User,
  Calendar,
  ShieldAlert,
  Lock,
  Trash2,
} from 'lucide-react';

export const Conges: React.FC = () => {
  const { absenceRequests, createAbsenceRequest, updateAbsenceStatus, deleteAbsenceRequest, user, employees } = useApp();
  const [showNewForm, setShowShowNewForm] = useState(false);
  const [filterStatut, setFilterStatut] = useState<string>('Tous');

  if (!user) return null;

  const isEmploye = user.role === 'Employé';

  // Filter requests based on role confidentiality requirement and status filter
  const displayedRequests = (
    isEmploye
      ? (absenceRequests || []).filter(
          (r) => r && r.matricule && String(r.matricule).trim() === String(user.matricule).trim()
        )
      : (absenceRequests || []).filter((r) => r && typeof r === 'object')
  ).filter((r) => {
    if (!r) return false;
    if (filterStatut === 'Tous') return true;
    if (filterStatut === 'En attente') return r.statut === 'En attente';
    if (filterStatut === 'Approuvé') return r.statut === 'Approuvé';
    if (filterStatut === 'Refusé') return r.statut === 'Refusé';
    return true;
  });

  // Form state
  const [selectedMatricule, setSelectedMatricule] = useState(user.matricule);
  const selectedEmp = employees.find((e) => e.matricule === selectedMatricule) || user;

  const [typeAbsence, setTypeAbsence] = useState<AbsenceRequest['typeAbsence']>('Permission d\'absence');
  const [dateDebut, setDateDebut] = useState('2026-09-10');
  const [dateFin, setDateFin] = useState('2026-09-11');
  const [motif, setMotif] = useState('');
  const [justifiee, setJustifiee] = useState(true);

  const calculateDays = () => {
    const d1 = new Date(dateDebut);
    const d2 = new Date(dateFin);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isNaN(diffDays) ? 1 : diffDays;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif) {
      alert('Veuillez expliciter le motif de l\'absence.');
      return;
    }

    const targetEmp = isEmploye ? user : selectedEmp;

    const code = createAbsenceRequest({
      matricule: targetEmp.matricule,
      nomPrenom: `${targetEmp.prenom} ${targetEmp.nom}`,
      fonctionService: `${targetEmp.poste} (${targetEmp.departement}) - ${targetEmp.statut}`,
      dateEmbauche: targetEmp.dateEmbauche,
      typeAbsence,
      dateDebut,
      dateFin,
      dureeJours: calculateDays(),
      motif,
      justifiee,
      statut: 'En attente',
      cadreAdminNotes: 'Soumis pour validation par l\'Administration RH',
    });

    setShowShowNewForm(false);
    setMotif('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Hash className="w-4 h-4 text-emerald-400" />
            Code de Suivi Unique : VN-P-2026-XXXXXX
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            {isEmploye
              ? 'Mes Demandes de Permission d\'Absence & Congés'
              : 'Gestion & Validation des Demandes d\'Absence'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEmploye
              ? 'Consultez le statut de vos demandes et soumettez une nouvelle permission.'
              : 'Réception, suivi et validation de toutes les demandes de permissions des employés.'}
          </p>
        </div>

        <button
          onClick={() => setShowShowNewForm(!showNewForm)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          {showNewForm ? 'Masquer le formulaire' : 'Créer une demande'}
        </button>
      </div>

      {/* Official Form Component */}
      {showNewForm && (
        <div className="bg-slate-900 border-2 border-blue-600/50 rounded-2xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                VN
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Demande de Permission d&apos;Absence
                </h4>
                <p className="text-[11px] text-slate-400">
                  Formulaire officiel conforme aux directives RH VOOMNET TECHNOLOGY
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-blue-950 border border-blue-800 text-blue-300 rounded-lg text-xs font-mono font-bold">
              VN-P-2026
            </span>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-5">
            {/* Section 1: Demandeur */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                1. Identification du Demandeur
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {isEmploye ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Matricule 3CX</label>
                    <input
                      type="text"
                      disabled
                      value={`${user.matricule} (${user.prenom} ${user.nom})`}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-blue-400 font-mono font-bold text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Sélectionner le Matricule
                    </label>
                    <select
                      value={selectedMatricule}
                      onChange={(e) => setSelectedMatricule(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold"
                    >
                      {employees.map((e) => (
                        <option key={e.id} value={e.matricule}>
                          {e.matricule} — {e.prenom} {e.nom} ({e.statut})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom & Prénom</label>
                  <input
                    type="text"
                    disabled
                    value={isEmploye ? `${user.prenom} ${user.nom}` : `${selectedEmp.prenom} ${selectedEmp.nom}`}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contrat & Service</label>
                  <input
                    type="text"
                    disabled
                    value={
                      isEmploye
                        ? `${user.poste} [${user.statut}]`
                        : `${selectedEmp.poste} [${selectedEmp.statut}]`
                    }
                    className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300 text-xs truncate"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Nature et Période */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                2. Nature et Période de l&apos;Absence
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type d&apos;absence</label>
                  <select
                    value={typeAbsence}
                    onChange={(e) => setTypeAbsence(e.target.value as AbsenceRequest['typeAbsence'])}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="Permission d'absence">Permission d&apos;absence</option>
                    <option value="Congé annuel">Congé annuel</option>
                    <option value="Maladie">Maladie</option>
                    <option value="Événement familial">Événement familial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date de Début</label>
                  <input
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date de Fin</label>
                  <input
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Durée Calculée</label>
                  <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono font-bold text-xs flex items-center justify-between">
                    <span>{calculateDays()} Jour(s)</span>
                    <span className="text-[10px] text-blue-400">Ouvrés</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Motif Détaillé *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Raison détaillée de la demande d'absence..."
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              {/* Justification toggle */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className={`w-4 h-4 ${justifiee ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Justificatif officiel fourni ?
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {justifiee
                        ? 'Un justificatif (certificat médical, convocation) est joint.'
                        : 'Attention: Une absence non justifiée pendant la période de prime entraîne la perte de la prime.'}
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={justifiee}
                    onChange={(e) => setJustifiee(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowShowNewForm(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Soumettre la Demande
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Requests */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            {isEmploye
              ? 'Historique de Mes Demandes de Permission'
              : 'Registre Global & Validation des Demandes par l\'Admin'}
          </h4>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px] font-semibold text-slate-400">
              <span className="px-1.5 text-[10px] uppercase font-bold text-slate-500">Statut :</span>
              {['Tous', 'En attente', 'Approuvé', 'Refusé'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatut(st)}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    filterStatut === st
                      ? 'bg-blue-600 text-white'
                      : 'hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Total : <strong className="text-white">{displayedRequests.length}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Code Suivi Unique</th>
                <th className="py-3.5 px-4">Demandeur</th>
                <th className="py-3.5 px-4">Type & Motif</th>
                <th className="py-3.5 px-4">Dates & Durée</th>
                <th className="py-3.5 px-4">Justification</th>
                <th className="py-3.5 px-4">Statut RH</th>
                <th className="py-3.5 px-4 text-right">
                  {isEmploye ? 'Suivi Admin' : 'Validation RH'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {displayedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">
                    <span className="px-2 py-1 bg-slate-950 rounded border border-slate-700">
                      {req.codeSuivi}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{req.nomPrenom}</div>
                    <div className="text-[10px] text-slate-400">Matricule: {req.matricule}</div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-200">{req.typeAbsence}</div>
                    <div className="text-[11px] text-slate-400 truncate">{req.motif}</div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <div className="text-slate-200">
                      {req.dateDebut} au {req.dateFin}
                    </div>
                    <div className="text-[10px] text-blue-400 font-bold">
                      {req.dureeJours} jour(s)
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    {req.justifiee ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Justifiée
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 w-max">
                        <AlertTriangle className="w-3 h-3" />
                        Non Justifiée
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    {req.statut === 'Approuvé' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        Approuvé
                      </span>
                    )}
                    {req.statut === 'Refusé' && (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
                        <XCircle className="w-3 h-3" />
                        Refusé
                      </span>
                    )}
                    {req.statut === 'En attente' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
                        <Clock className="w-3 h-3" />
                        En attente
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {!isEmploye ? (
                      <div className="flex flex-col items-end gap-2">
                        {req.statut === 'En attente' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                const note = prompt(
                                  `Valider la demande de ${req.nomPrenom} (${req.codeSuivi}) ?\nRemarque / motif de validation :`,
                                  req.cadreAdminNotes || 'Validé par l\'Administration RH'
                                );
                                if (note !== null) {
                                  updateAbsenceStatus(
                                    req.id,
                                    'Approuvé',
                                    req.justifiee,
                                    note || 'Validé par l\'Administration RH'
                                  );
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Valider
                            </button>

                            <button
                              onClick={() => {
                                const note = prompt(
                                  `Refuser la demande de ${req.nomPrenom} (${req.codeSuivi}) ?\nMotif du refus :`,
                                  'Refusé par l\'Administration RH'
                                );
                                if (note !== null) {
                                  updateAbsenceStatus(
                                    req.id,
                                    'Refusé',
                                    false,
                                    note || 'Refusé par l\'Administration RH'
                                  );
                                }
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Refuser
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                              req.statut === 'Approuvé'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-red-500/20 text-red-300 border-red-500/40'
                            }`}
                          >
                            {req.statut === 'Approuvé' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                Décision Finale : Validée
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-red-400" />
                                Décision Finale : Refusée
                              </>
                            )}
                          </span>
                        )}

                        {req.cadreAdminNotes && (
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-slate-100 text-left max-w-xs shadow-inner mt-1">
                            <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider mb-0.5">
                              Remarque RH Officielle :
                            </span>
                            <span className="text-slate-100 text-xs leading-relaxed block">
                              {req.cadreAdminNotes}
                            </span>
                          </div>
                        )}

                        {/* Bouton de Suppression pour Admin & SuperAdmin */}
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Êtes-vous sûr de vouloir supprimer définitivement la demande ${req.codeSuivi} de ${req.nomPrenom} ?`
                              )
                            ) {
                              deleteAbsenceRequest(req.id);
                            }
                          }}
                          className="px-2.5 py-1 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 font-bold text-[11px] rounded-xl shadow-sm transition-all flex items-center gap-1 mt-1 ml-auto"
                          title="Supprimer définitivement la demande (Admin & SuperAdmin)"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-right">
                        {req.cadreAdminNotes ? (
                          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-left max-w-xs ml-auto shadow-inner">
                            <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider mb-0.5">
                              Remarque Administrateur :
                            </span>
                            <span className="text-slate-100 font-semibold text-xs leading-relaxed block">
                              {req.cadreAdminNotes}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">En cours de traitement par l&apos;Admin</span>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {displayedRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    {isEmploye
                      ? 'Vous n\'avez soumis aucune demande de permission pour le moment.'
                      : 'Aucune demande enregistrée.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
