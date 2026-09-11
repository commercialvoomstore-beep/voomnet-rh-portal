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

  const myPrime = (primes || []).find((p) => p && p.matricule && String(p.matricule).trim() === String(user.matricule).trim());
  const myRequests = (absenceRequests || []).filter(
    (r) => r && r.matricule && String(r.matricule).trim() === String(user.matricule).trim()
  );

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={user.avatar}
            alt={user.nom}
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-100 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                Poste 3CX : {user.matricule}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  user.statut === 'CDI'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : user.statut === 'CDD'
                    ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200'
                }`}
              >
                Contrat {user.statut}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {user.prenom} {user.nom}
            </h2>
            <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>{user.poste}</span>
              <span>•</span>
              <span className="text-slate-500">{user.departement}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Fiche de Poste */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Mon Poste & Informations d&apos;Embauche</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Intitulé du Poste</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{user.poste}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Département</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{user.departement}</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
              <div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Date d&apos;Embauche Officielle</div>
                <div className="font-mono font-bold text-blue-600 mt-0.5">{user.dateEmbauche}</div>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-bold">
                Contrat Actif
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Informations Personnelles & Contacts */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
            <User className="w-4 h-4 text-purple-600" />
            <span>Coordonnées Personnelles</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-600 font-semibold">Email Pro</span>
              </div>
              <span className="font-mono text-slate-900 font-medium">{user.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span className="text-slate-600 font-semibold">Ligne 3CX Interne</span>
              </div>
              <span className="font-mono text-emerald-700 font-bold">{user.telephone3CX}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="text-slate-600 font-semibold">Adresse</span>
              </div>
              <span className="text-slate-800 font-medium">{user.adresse || 'Abidjan, Côte d\'Ivoire'}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-rose-500" />
                <span className="text-slate-600 font-semibold">Contact Urgence</span>
              </div>
              <span className="text-slate-800 font-medium">{user.contactUrgence || 'Non renseigné'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Suivi de Mes Demandes */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Historique de Mes Demandes de Permission & Congés
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Total : <strong className="text-slate-900">{myRequests.length}</strong> demande(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Code Suivi</th>
                <th className="py-3 px-3">Type & Motif</th>
                <th className="py-3 px-3">Période</th>
                <th className="py-3 px-3">Statut Administrateur</th>
                <th className="py-3 px-3">Décision / Remarques Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {myRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-blue-600">
                    <span className="px-2 py-0.5 bg-slate-100 rounded border border-slate-300">
                      {req.codeSuivi}
                    </span>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <div className="font-semibold text-slate-900">{req.typeAbsence}</div>
                    <div className="text-[11px] text-slate-500 truncate">{req.motif}</div>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-slate-700">
                      {req.dateDebut} au {req.dateFin}
                    </div>
                    <div className="text-[10px] text-blue-600 font-bold">
                      {req.dureeJours} jour(s)
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {req.statut === 'Approuvé' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Validée (Approuvée)
                      </span>
                    )}
                    {req.statut === 'Refusé' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 w-max">
                        <XCircle className="w-3.5 h-3.5" />
                        Refusée par Admin
                      </span>
                    )}
                    {req.statut === 'En attente' && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1 w-max">
                        <Clock className="w-3.5 h-3.5" />
                        En attente de l&apos;Admin
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    {req.cadreAdminNotes ? (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                        <span className="text-[10px] uppercase font-bold text-blue-600 block tracking-wider mb-0.5">
                          Remarque Admin RH :
                        </span>
                        <span className="text-slate-800 text-xs leading-relaxed block">
                          {req.cadreAdminNotes}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {req.statut === 'En attente' ? 'En cours d\'étude par la direction RH' : 'Aucune remarque'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {myRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 text-xs">
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
