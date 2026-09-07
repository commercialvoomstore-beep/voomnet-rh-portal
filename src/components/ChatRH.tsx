'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Send,
  MessageSquare,
  Shield,
  Lock,
  Clock,
  Check,
  CheckCheck,
  ArrowRight,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

export const ChatRH: React.FC = () => {
  const { user, chatMessages, sendChatMessage, employees } = useApp();
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!user) return null;

  const isSuperAdmin = user.role === 'SuperAdmin';
  const isAdminRH = user.role === 'Admin RH';

  if (!isSuperAdmin && !isAdminRH) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Canal de Chat RH Restreint</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Le canal de discussion instantanée est réservé exclusivement aux échanges entre le <strong className="text-purple-400">Superadministrateur</strong> et l&apos;<strong className="text-blue-400">Administrateur RH</strong>.
        </p>
      </div>
    );
  }

  // Determine recipient: If user is SuperAdmin (9999), recipient is Admin RH (1000). Vice versa.
  const targetRecipientMatricule = user.matricule === '9999' ? '1000' : '9999';
  const recipientObj = employees.find((e) => e.matricule === targetRecipientMatricule);
  const recipientName = recipientObj ? `${recipientObj.prenom} ${recipientObj.nom}` : 'Récepteur RH';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChatMessage(text.trim(), targetRecipientMatricule);
    setText('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-blue-950 p-5 rounded-2xl border border-purple-800/40 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Messagerie RH Directe (Émetteur ➔ Récepteur)
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Transmission instantanée 3CX
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Canal : {user.prenom} {user.nom} ({user.role}) ➔ {recipientName} ({recipientObj?.role})
            </h3>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <Shield className="w-4 h-4 text-purple-400" />
          <span>Poste {user.matricule} ➔ Poste {targetRecipientMatricule}</span>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[580px] overflow-hidden">
        {/* Chat Feed Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.nom}
                className="h-8 w-8 rounded-full ring-2 ring-blue-500 object-cover"
              />
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <img
                src={recipientObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={recipientName}
                className="h-8 w-8 rounded-full ring-2 ring-purple-500 object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Émetteur : {user.prenom} {user.nom} ({user.matricule})</span>
                <span className="text-slate-500">•</span>
                <span className="text-purple-300">Récepteur : {recipientName} ({targetRecipientMatricule})</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Liaison directe — Suivi avec indicateurs d&apos;envoi (Envoyé / Distribué)
              </div>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800 flex items-center gap-1">
            <CheckCheck className="w-3.5 h-3.5" />
            Ligne Active
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/60">
          {chatMessages.map((msg) => {
            const isMe = msg.senderMatricule === user.matricule;
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-2xl ${
                  isMe ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className={`w-9 h-9 rounded-xl object-cover ring-2 ${
                    msg.senderRole === 'SuperAdmin' ? 'ring-purple-500' : 'ring-blue-500'
                  }`}
                />

                <div
                  className={`p-4 rounded-2xl text-xs space-y-1.5 shadow-lg ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : msg.senderRole === 'SuperAdmin'
                      ? 'bg-purple-950/80 border border-purple-800/80 text-purple-100 rounded-tl-none'
                      : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 border-b border-white/10 pb-1">
                    <span className="font-bold">{msg.senderName} ({msg.senderRole})</span>
                    <span className="font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Message Transmission / Delivery Indicator for Sent Messages */}
                  <div className={`pt-1 flex items-center justify-end text-[10px] font-mono font-semibold ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                    {isMe ? (
                      <span className="flex items-center gap-1 text-cyan-200">
                        <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />
                        <span>Envoyé & Distribué au Poste {targetRecipientMatricule}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Reçu sur votre poste {user.matricule}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1">
            <span className="text-[10px] text-blue-400 font-bold uppercase font-mono shrink-0">
              Vers {recipientName} :
            </span>
            <input
              type="text"
              placeholder={`Tapez votre message pour ${recipientName}...`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full py-2 bg-transparent text-white text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <span>Envoyer</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
