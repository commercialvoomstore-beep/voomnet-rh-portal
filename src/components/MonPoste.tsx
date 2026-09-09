'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  User,
  PhoneCall,
  Mail,
  Building2,
  Calendar,
  Shield,
  FileText,
  Briefcase,
  MapPin,
  HeartHandshake,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';

export const MonPoste: React.FC = () => {
  const { user, primes, primeConfig, absenceRequests } = useApp();

  if (!user) return null;

  const myPrime = primes.find((p) => p.matricule === user.matricule);
  const myRequests = absenceRequests.filter((r) => r.matricule === user.matricule);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl border border-blue-800/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.nom}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-700">
                Poste 3CX : {user.matricule}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  user.statut === 'CDI'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : user.statut === 'CDD'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}
              >
                Contrat {user.statut}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              {user.prenom} {user.nom}
            </h2>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-400" />
              <span>{user.poste}</span>
              <span>•</span>
              <span className="text-slate-400">{user.departement}</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-right shrink-0">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            Solde Congés Payés
          </div>
          <div className="text-2xl font-extrabold text-white font-mono mt-0.5">
            {user.soldeConges} Jours
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Disponibles pour 2026</div>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Fiche de Poste */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sm font-bold text-white">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Mon Poste & Informations d&apos;Embauche</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Intitulé du Poste</div>
              <div className="font-bold text-white text-sm mt-0.5">{user.poste}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Département</div>
              <div className="font-bold text-white text-sm mt-0.5">{user.departement}</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Date d&apos;Embauche Officielle</div>
                <div className="font-mono font-bold text-blue-400 mt-0.5">{user.dateEmbauche}</div>
              </div>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800 font-bold">
                Contrat Actif
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Informations Personnelles & Contacts */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sm font-bold text-white">
            <User className="w-4 h-4 text-purple-400" />
            <span>Coordonnées Personnel</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300 font-semibold">Email Pro</span>
              </div>
              <span className="font-mono text-white">{user.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-semibold">Ligne 3CX Interne</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">{user.telephone3CX}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300 font-semibold">Adresse</span>
              </div>
              <span className="text-slate-200">{user.adresse || 'Abidjan, Côte d\'Ivoire'}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                <span className="text-slate-300 font-semibold">Contact Urgence</span>
              </div>
              <span className="text-slate-200">{user.contactUrgence || 'Non renseigné'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Mon Statut Prime T3 2026 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Ma Prime de Ponctualité — {primeConfig.periodeNom}
            </h3>
          </div>

          {myPrime?.eligible ? (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Éligible ({primeConfig.montantReference.toLocaleString('fr-FR')} FCFA)
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold rounded-full flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              Prime Suspendue
            </span>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {myPrime?.eligible
            ? 'Règle des 3 mois : Vos assiduités et absences justifiées vous permettent de bénéficier de la totalité de la prime trimestrielle.'
            : `Statut actuel : ${myPrime?.motifStatus || 'Absence non justifiée enregistrée'}. Rapprochez-vous de l'Administration RH en cas de justificatif officiel.`}
        </p>
      </div>

      {/* Card 4: Suivi de Mes Demandes (Validées / Refusées / En attente par l'Admin) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">
              Historique de Mes Demandes de Permission & Congés
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total : <strong className="text-white">{myRequests.length}</strong> demande(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Code Suivi</th>
                <th className="py-3 px-3">Type & Motif</th>
                <th className="py-3 px-3">Période</th>
                <th className="py-3 px-3">Statut Administrateur</th>
                <th className="py-3 px-3">Décision / Remarques Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {myRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-400">
                    <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-700">
                      {req.codeSuivi}
                    </span>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-white">{req.typeAbsence}</div>
                    <div className="text-[11px] text-slate-400 truncate">{req.motif}</div>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-slate-200">
                      {req.dateDebut} au {req.dateFin}
                    </div>
                    <div className="text-[10px] text-blue-400 font-bold">
                      {req.dureeJours} jour(s)
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {req.statut === 'Approuvé' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validée (Approuvée)
                      </span>
                    )}
                    {req.statut === 'Refusé' && (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
                        <XCircle className="w-3.5 h-3.5" />
                        Refusée par Admin
                      </span>
                    )}
                    {req.statut === 'En attente' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
                        <Clock className="w-3.5 h-3.5" />
                        En attente de l&apos;Admin
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-slate-300 text-[11px] italic">
                    {req.cadreAdminNotes || (req.statut === 'En attente' ? 'En cours d\'étude par la direction RH' : 'Aucune remarque')}
                  </td>
                </tr>
              ))}

              {myRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                    Vous n&apos;avez aucune demande de permission enregistrée pour le moment.
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
