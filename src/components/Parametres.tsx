'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Lock,
  Database,
  Clock,
  Camera,
  Trash2,
  Upload,
  User,
  Image as ImageIcon,
  FolderOpen,
} from 'lucide-react';

export const Parametres: React.FC = () => {
  const { user, updateProfilePicture, uploadProfilePictureFile, showNotificationAlert } = useApp();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Avatar URL input or File input
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  ];

  if (!user) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }
    showNotificationAlert('🔒 Mot de passe', 'Votre mot de passe a été mis à jour avec succès.', 'SUCCESS');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUpdateAvatar = (url: string) => {
    updateProfilePicture(user.matricule, url);
    setNewAvatarUrl('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadProfilePictureFile(file, user.matricule);
      } catch (err) {
        alert('Erreur lors du téléchargement de l\'image depuis votre appareil.');
      }
    }
  };

  const handleDeleteAvatar = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil actuelle ?')) {
      updateProfilePicture(user.matricule, null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Picture Management Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Importer sa Photo de Profil depuis l&apos;appareil</h3>
            <p className="text-xs text-slate-500">
              Téléchargez un fichier image depuis votre ordinateur/smartphone ou réinitialisez la photo.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
          {/* Current Avatar preview */}
          <div className="relative group shrink-0">
            <img
              src={user.avatar}
              alt={user.nom}
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-blue-100 shadow-sm"
            />
            <span className="absolute bottom-1 right-1 bg-white p-1.5 rounded-lg border border-slate-200 text-blue-600 shadow-sm">
              <User className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-1 space-y-4 w-full">
            {/* Direct Device File Upload Input */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-purple-600" />
                <span>1. Importer un fichier image depuis cet appareil</span>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 transition-all"
                >
                  <Upload className="w-4 h-4" />
                  Choisir une photo sur mon appareil
                </button>

                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-rose-600" />
                  Supprimer la photo
                </button>
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-700">
                2. Ou Saisir l&apos;URL d&apos;une image / Choisir un modèle
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://domaine.com/photo.jpg"
                  value={newAvatarUrl}
                  onChange={(e) => setNewAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => newAvatarUrl && handleUpdateAvatar(newAvatarUrl)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <ImageIcon className="w-4 h-4" />
                  Appliquer
                </button>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                Galerie de photos prédéfinies :
              </span>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleUpdateAvatar(preset)}
                    className="relative group shrink-0"
                  >
                    <img
                      src={preset}
                      alt={`Preset ${idx + 1}`}
                      className="w-10 h-10 rounded-xl object-cover border-2 border-slate-200 hover:border-blue-600 transition-all hover:scale-105"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Account Settings */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Changement de Mot de Passe</h3>
            <p className="text-xs text-slate-500">
              Compte : <strong className="text-blue-600">{user.prenom} {user.nom}</strong> (Matricule 3CX {user.matricule})
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ancien mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            Mettre à jour le mot de passe
          </button>
        </form>
      </div>

      {/* System Technical Config Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Architecture & Configuration Système</h3>
            <p className="text-xs text-slate-500">
              Détails techniques de l&apos;infrastructure et de la base de données.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-900 font-bold">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Suivi du Personnel & Présences 3CX
              </span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">ACTIF</span>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              Gestion automatisée du personnel, des permissions d&apos;absence et intégration avec les téléphones IP 3CX.
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-slate-900 font-bold">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Base de données Neon PostgreSQL
              </span>
              <span className="text-emerald-700 font-mono text-[10px] font-bold">NEON_POSTGRES</span>
            </div>
            <div className="text-[11px] font-mono text-slate-600 space-y-1">
              <div>Tables: employees, leave_requests, chat_messages</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
