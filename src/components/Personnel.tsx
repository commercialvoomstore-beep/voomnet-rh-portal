'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Employee, RoleType, StatutContrat, DEFAULT_FALLBACK_AVATAR } from '@/data/mockData';
import {
  Users,
  Search,
  UserPlus,
  PhoneCall,
  Mail,
  Building2,
  Calendar,
  X,
  CheckCircle2,
  Shield,
  GraduationCap,
  Edit2,
  Trash2,
  Save,
  Camera,
  RotateCcw,
} from 'lucide-react';

export const Personnel: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, updateProfilePicture, user } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('Tous');
  const [filterRole, setFilterRole] = useState<string>('Tous');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isAdminRH = user?.role === 'Admin' || (user?.role as string) === 'Admin RH';

  // New Employee Form state
  const [addFormState, setAddFormState] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    email: '',
    telephone3CX: '',
    departement: 'Développement Logiciel',
    poste: 'Ingénieur Informatique',
    statut: 'CDI' as StatutContrat,
    role: 'Employé' as RoleType,
    dateEmbauche: new Date().toISOString().split('T')[0],
    avatar: DEFAULT_FALLBACK_AVATAR,
    motDePasse: 'voomnet2026',
    adresse: '',
    telephonePerso: '',
    contactUrgence: '',
    notesAdministratives: '',
  });

  // Edit Employee Form state
  const [editFormState, setEditFormState] = useState<Partial<Employee>>({});

  const filteredEmployees = (employees || []).filter((emp) => {
    if (!emp) return false;
    const search = (searchTerm || '').toLowerCase();
    const nom = (emp.nom || '').toLowerCase();
    const prenom = (emp.prenom || '').toLowerCase();
    const matricule = (emp.matricule || '').toLowerCase();
    const poste = (emp.poste || '').toLowerCase();
    const departement = (emp.departement || '').toLowerCase();

    const matchesSearch =
      nom.includes(search) ||
      prenom.includes(search) ||
      matricule.includes(search) ||
      poste.includes(search) ||
      departement.includes(search);

    const matchesStatut = filterStatut === 'Tous' || emp.statut === filterStatut;
    const matchesRole = filterRole === 'Tous' || emp.role === filterRole;

    return matchesSearch && matchesStatut && matchesRole;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormState.matricule || !addFormState.nom || !addFormState.prenom) {
      alert('Veuillez renseigner au moins le matricule, le nom et le prénom.');
      return;
    }

    const generatedEmail = addFormState.email || `${addFormState.prenom.charAt(0).toLowerCase()}.${addFormState.nom.toLowerCase().replace(/\s+/g, '')}@voomnet.com`;

    addEmployee({
      ...addFormState,
      email: generatedEmail,
      telephone3CX: addFormState.telephone3CX || addFormState.matricule,
      soldeConges: addFormState.statut === 'STAGIAIRE' ? 5 : 24,
      avatar: addFormState.avatar || DEFAULT_FALLBACK_AVATAR,
    });

    setIsAddModalOpen(false);
  };

  const handleStartEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setEditFormState({
      nom: emp.nom,
      prenom: emp.prenom,
      email: emp.email,
      departement: emp.departement,
      poste: emp.poste,
      statut: emp.statut,
      role: emp.role,
      dateEmbauche: emp.dateEmbauche,
      avatar: emp.avatar,
      adresse: emp.adresse || '',
      telephonePerso: emp.telephonePerso || '',
      contactUrgence: emp.contactUrgence || '',
      notesAdministratives: emp.notesAdministratives || '',
      salaireBase: emp.salaireBase || 0,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    updateEmployee(editingEmployee.id, editFormState);
    setEditingEmployee(null);
  };

  const handleDelete = (emp: Employee) => {
    if (emp.matricule === user?.matricule) {
      alert('Vous ne pouvez pas supprimer votre propre compte Superadministrateur actuel.');
      return;
    }
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${emp.prenom} ${emp.nom} (Matricule ${emp.matricule}) ?`)) {
      deleteEmployee(emp.id);
    }
  };

  const getStatutBadge = (statut: StatutContrat) => {
    switch (statut) {
      case 'STAGIAIRE':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
            <GraduationCap className="w-3 h-3" />
            STAGIAIRE
          </span>
        );
      case 'CDD':
        return (
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold w-max">
            CDD
          </span>
        );
      case 'CDI':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 w-max">
            <CheckCircle2 className="w-3 h-3" />
            CDI
          </span>
        );
    }
  };

  const getRoleBadge = (role: RoleType) => {
    switch (role) {
      case 'SuperAdmin':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/40">
            SuperAdmin
          </span>
        );
      case 'Admin':
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Admin
          </span>
        );
      case 'Employé':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Employé
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Info */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Shield className="w-4 h-4 text-purple-400" />
            Espace {isSuperAdmin ? 'Superadministrateur (Accès Master CRUD)' : 'Administrateur RH'}
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            {isSuperAdmin
              ? 'Gestion des Utilisateurs, Rôles & Dates d\'Embauche'
              : 'Suivi des Employés & Fiches Administratives'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Dates d&apos;embauche visibles pour tous les profils (SuperAdmin 9999, Admin RH 1000 et Employés).
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-90 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Créer un Utilisateur
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule 3CX, poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Statut Contrat Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400">
            <span className="px-2 text-[10px] uppercase font-bold text-slate-500">Contrat :</span>
            {['Tous', 'CDI', 'CDD', 'STAGIAIRE'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatut(st)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStatut === st
                    ? 'bg-blue-600 text-white'
                    : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400">
            <span className="px-2 text-[10px] uppercase font-bold text-slate-500">Rôle :</span>
            {['Tous', 'SuperAdmin', 'Admin', 'Employé'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterRole === r
                    ? 'bg-purple-600 text-white'
                    : 'hover:text-white hover:bg-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Utilisateur & Photo</th>
                <th className="py-3.5 px-4">Matricule (3CX)</th>
                <th className="py-3.5 px-4">Poste & Service</th>
                <th className="py-3.5 px-4">Rôle Attribué</th>
                <th className="py-3.5 px-4">Type Contrat</th>
                <th className="py-3.5 px-4">Date d&apos;Embauche</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.nom}
                        className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700"
                      />
                      <div>
                        <div className="font-bold text-white text-sm">
                          {emp.prenom} {emp.nom}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{emp.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 font-bold text-blue-400">
                      <PhoneCall className="w-3 h-3 text-emerald-400" />
                      {emp.matricule}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{emp.poste}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>{emp.departement}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">{getRoleBadge(emp.role)}</td>

                  <td className="py-3.5 px-4">{getStatutBadge(emp.statut)}</td>

                  {/* Prominently Display Hiring Date for ALL employees (including SuperAdmin and Admin RH) */}
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                    <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 w-max text-xs">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>{emp.dateEmbauche}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStartEdit(emp)}
                        title="Modifier / Compléter les infos"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg border border-slate-700 transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isSuperAdmin && (
                        <button
                          onClick={() => handleDelete(emp)}
                          title="Supprimer l'utilisateur"
                          className="p-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-400 rounded-lg border border-red-800/80 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SuperAdmin Add Modal */}
      {isAddModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-purple-400" />
              Créer un Nouvel Utilisateur (SuperAdmin)
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Fixez la date d&apos;embauche, le rôle et le statut contractuel.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Matricule (Poste 3CX) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1030"
                    value={addFormState.matricule}
                    onChange={(e) => setAddFormState({ ...addFormState, matricule: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rôle Système *</label>
                  <select
                    value={addFormState.role}
                    onChange={(e) =>
                      setAddFormState({ ...addFormState, role: e.target.value as RoleType })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-purple-700 rounded-xl text-purple-300 text-xs font-bold"
                  >
                    <option value="Employé">Employé</option>
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: TANOH"
                    value={addFormState.nom}
                    onChange={(e) => setAddFormState({ ...addFormState, nom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Clarisse"
                    value={addFormState.prenom}
                    onChange={(e) => setAddFormState({ ...addFormState, prenom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Poste Occupé *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ingénieure Réseau / Développeur"
                    value={addFormState.poste}
                    onChange={(e) => setAddFormState({ ...addFormState, poste: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Département *</label>
                  <select
                    value={addFormState.departement}
                    onChange={(e) => setAddFormState({ ...addFormState, departement: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="Ressources Humaines">Ressources Humaines</option>
                    <option value="Développement Logiciel">Développement Logiciel</option>
                    <option value="Infrastructure & Réseau">Infrastructure & Réseau</option>
                    <option value="Direction Générale">Direction Générale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Statut Contractuel *</label>
                  <select
                    value={addFormState.statut}
                    onChange={(e) =>
                      setAddFormState({ ...addFormState, statut: e.target.value as StatutContrat })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-bold"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="STAGIAIRE">STAGIAIRE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date d&apos;Embauche *</label>
                  <input
                    type="date"
                    required
                    value={addFormState.dateEmbauche}
                    onChange={(e) => setAddFormState({ ...addFormState, dateEmbauche: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-blue-600 rounded-xl text-white font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse Email *</label>
                  <input
                    type="email"
                    placeholder="c.tanoh@voomnet.com"
                    value={addFormState.email}
                    onChange={(e) => setAddFormState({ ...addFormState, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe de Connexion *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: voomnet2026"
                    value={addFormState.motDePasse}
                    onChange={(e) => setAddFormState({ ...addFormState, motDePasse: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-600 rounded-xl text-emerald-300 font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Urgence</label>
                  <input
                    type="text"
                    placeholder="Ex: Frère (+225 01 22 33 44 55)"
                    value={addFormState.contactUrgence}
                    onChange={(e) => setAddFormState({ ...addFormState, contactUrgence: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Photo de Profil (URL)</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={addFormState.avatar}
                    onChange={(e) => setAddFormState({ ...addFormState, avatar: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30"
                >
                  Créer l&apos;utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Accessible to SuperAdmin and Admin RH) */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingEmployee(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-400" />
              Modifier ({editingEmployee.prenom} {editingEmployee.nom})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Matricule : <strong className="text-blue-400 font-mono">{editingEmployee.matricule}</strong>
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Photo modification */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-4">
                <img
                  src={editFormState.avatar || DEFAULT_FALLBACK_AVATAR}
                  alt="Avatar Preview"
                  className="w-14 h-14 rounded-xl object-cover ring-2 ring-blue-500"
                />
                <div className="flex-1 space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300">URL Photo de Profil</label>
                  <input
                    type="text"
                    value={editFormState.avatar || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, avatar: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setEditFormState({ ...editFormState, avatar: DEFAULT_FALLBACK_AVATAR })}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Réinitialiser la photo par défaut
                  </button>
                </div>
              </div>

              {isSuperAdmin ? (
                <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-800/50 grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-purple-300 mb-1">Rôle</label>
                    <select
                      value={editFormState.role}
                      onChange={(e) =>
                        setEditFormState({ ...editFormState, role: e.target.value as RoleType })
                      }
                      className="w-full px-2 py-1.5 bg-slate-950 border border-purple-700 rounded-xl text-purple-300 text-xs font-bold"
                    >
                      <option value="Employé">Employé</option>
                      <option value="Admin">Admin</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-300 mb-1">Contrat</label>
                    <select
                      value={editFormState.statut}
                      onChange={(e) =>
                        setEditFormState({ ...editFormState, statut: e.target.value as StatutContrat })
                      }
                      className="w-full px-2 py-1.5 bg-slate-950 border border-purple-700 rounded-xl text-purple-300 text-xs font-bold"
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="STAGIAIRE">STAGIAIRE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-purple-300 mb-1">Date Embauche</label>
                    <input
                      type="date"
                      value={editFormState.dateEmbauche || ''}
                      onChange={(e) => setEditFormState({ ...editFormState, dateEmbauche: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-purple-700 rounded-xl text-white font-mono text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date d&apos;Embauche</label>
                  <input
                    type="date"
                    value={editFormState.dateEmbauche || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, dateEmbauche: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={editFormState.nom || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, nom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={editFormState.prenom || ''}
                    onChange={(e) => setEditFormState({ ...editFormState, prenom: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Urgence</label>
                <input
                  type="text"
                  placeholder="Ex: Frère (+225 01 22 33 44 55)"
                  value={editFormState.contactUrgence || ''}
                  onChange={(e) => setEditFormState({ ...editFormState, contactUrgence: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes Administratives RH</label>
                <textarea
                  rows={2}
                  value={editFormState.notesAdministratives || ''}
                  onChange={(e) => setEditFormState({ ...editFormState, notesAdministratives: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
