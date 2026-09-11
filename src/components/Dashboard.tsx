'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  UserCheck,
  CalendarCheck,
  Clock,
  CheckCircle2,
  Briefcase,
  Zap,
  Award,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { employees, absenceRequests, auditLogs, setActiveTab, user } = useApp();

  if (!user) return null;

  const isEmploye = user.role === 'Employé';
  const isSuperAdmin = user.role === 'SuperAdmin';

  // If user is regular Employee, show personalized Employee Dashboard
  if (isEmploye) {
    const myRequests = absenceRequests.filter((r) => r.matricule === user.matricule);

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
              Espace Collaborateur VOOMNET — {user.statut}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Bienvenue, {user.prenom} {user.nom}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Poste : <strong className="text-slate-900">{user.poste}</strong> ({user.departement})
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('conges')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              Soumettre une permission
            </button>
            <button
              onClick={() => setActiveTab('primes')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Ma Prime
            </button>
            <button
              onClick={() => setActiveTab('monposte')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              Voir mon poste
            </button>
          </div>
        </div>

        {/* My KPIs */}
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500">Mes Demandes Soumises</div>
            <div className="mt-2 text-3xl font-extrabold text-slate-900">{myRequests.length}</div>
            <div className="mt-2 text-xs text-blue-600 font-semibold">
              {myRequests.filter((r) => r.statut === 'En attente').length} en attente de validation RH
            </div>
          </div>
        </div>

        {/* My Recent Requests */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              Mes Dernières Demandes de Permission
            </h4>
            <button
              onClick={() => setActiveTab('conges')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
            >
              Voir tout
            </button>
          </div>

          <div className="space-y-2">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-blue-600 mr-2">{req.codeSuivi}</span>
                  <span className="font-semibold text-slate-900">{req.typeAbsence}</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">
                    {req.dateDebut} au {req.dateFin} ({req.dureeJours} jours)
                  </span>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                    req.statut === 'Approuvé'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : req.statut === 'Refusé'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {req.statut}
                </span>
              </div>
            ))}

            {myRequests.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">
                Aucune demande soumise. Utilisez le bouton ci-dessus pour faire une demande.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // SuperAdmin & Admin RH Dashboard View
  const totalEmployees = employees.length;
  const cdiCount = employees.filter((e) => e.statut === 'CDI').length;
  const cddCount = employees.filter((e) => e.statut === 'CDD').length;
  const stagiairesCount = employees.filter((e) => e.statut === 'STAGIAIRE').length;

  const pendingAbsences = absenceRequests.filter((r) => r.statut === 'En attente').length;
  const approvedAbsences = absenceRequests.filter((r) => r.statut === 'Approuvé').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Welcome */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              VOOMNET TECH RH — Espace {isSuperAdmin ? 'Superadministrateur' : 'Administrateur RH'}
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Tableau de Bord de Pilotage RH
            </h3>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Suivi global du personnel (CDI, CDD, Stagiaires) et contrôle centralisé des demandes d&apos;absences et congés.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('conges')}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              Validations ({pendingAbsences})
            </button>
            <button
              onClick={() => setActiveTab('primes')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Attribution Primes
            </button>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Personnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Utilisateurs</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{totalEmployees}</div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-600 font-bold">100%</span> postes 3CX configurés
          </div>
        </div>

        {/* CDI / CDD / Stagiaires Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Répartition Contrats</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="text-emerald-600 font-mono">{cdiCount} CDI</span>
            <span>•</span>
            <span className="text-cyan-600 font-mono">{cddCount} CDD</span>
          </div>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            {stagiairesCount} Stagiaire(s) sous convention
          </div>
        </div>

        {/* Demandes en Attente */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Demandes à Valider</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{pendingAbsences}</div>
          <div className="mt-2 text-xs text-amber-600 font-medium">
            Permissions et congés en attente
          </div>
        </div>

        {/* Demandes Approuvées */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Demandes Valides</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-extrabold text-slate-900">{approvedAbsences}</div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            Permissions & congés approuvés
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Categories Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-4">
              Répartition des Collaborateurs par Statut Contractuel
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Contrat CDI (Contrat à Durée Indéterminée)</span>
                  <span className="text-slate-500 font-mono">
                    {cdiCount} / {totalEmployees} ({((cdiCount / totalEmployees) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(cdiCount / totalEmployees) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Contrat CDD (Contrat à Durée Déterminée)</span>
                  <span className="text-slate-500 font-mono">
                    {cddCount} / {totalEmployees} ({((cddCount / totalEmployees) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${(cddCount / totalEmployees) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-700 font-medium">Convention STAGIAIRE</span>
                  <span className="text-slate-500 font-mono">
                    {stagiairesCount} / {totalEmployees} ({((stagiairesCount / totalEmployees) * 100).toFixed(0)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${(stagiairesCount / totalEmployees) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Log / Journal d'Activité */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Journal d&apos;Activité RH</h4>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
              Live
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-[460px] pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="font-mono">{log.timestamp}</span>
                  <span className="font-semibold text-blue-600">{log.auteur}</span>
                </div>
                <p className="text-slate-800 leading-snug font-medium">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
