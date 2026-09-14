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
  const { user, chatMessages, sendChatMessage, employees, markChatMessagesAsRead } = useApp();
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.matricule) {
      markChatMessagesAsRead(user.matricule);
    }
  }, [user?.matricule]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (!user) return null;

  const isSuperAdmin = user.role === 'SuperAdmin';
  const isAdminRH = user.role === 'Admin' || (user.role as string) === 'Admin RH';

  if (!isSuperAdmin && !isAdminRH) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Canal de Chat RH Restreint</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Le canal de discussion instantanée est réservé exclusivement aux échanges entre le <strong className="text-purple-600">Superadministrateur</strong> et l&apos;<strong className="text-blue-600">Administrateur RH</strong>.
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
      {/* Redesigned Modern Chat Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-3xl shadow-lg border border-slate-800 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
        {/* Background glow decoration */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-400 shadow-inner shrink-0">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                Messagerie Instantanée RH
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Ligne Directe 3CX
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              Discussion Directe & Sécurisée
            </h2>

            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2 font-medium">
              <span>{user.prenom} {user.nom} ({user.role})</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-emerald-300 font-bold">{recipientName} ({recipientObj?.role || 'RH'})</span>
            </p>
          </div>
        </div>

        {/* Receiver Quick Card / Line Status */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 relative z-10 shrink-0">
          <img
            src={recipientObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={recipientName}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-400 shadow"
          />
          <div className="text-xs">
            <div className="font-extrabold text-white">{recipientName}</div>
            <div className="text-[10px] text-blue-200 font-mono flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <span>Poste 3CX : {targetRecipientMatricule}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[580px] overflow-hidden">
        {/* Chat Feed Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.nom}
                className="h-8 w-8 rounded-full ring-2 ring-blue-500 object-cover"
              />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <img
                src={recipientObj?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={recipientName}
                className="h-8 w-8 rounded-full ring-2 ring-purple-500 object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Émetteur : {user.prenom} {user.nom} ({user.matricule})</span>
                <span className="text-slate-400">•</span>
                <span className="text-purple-700">Récepteur : {recipientName} ({targetRecipientMatricule})</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Liaison directe — Suivi avec indicateurs d&apos;envoi (Envoyé / Distribué)
              </div>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 font-bold">
            <CheckCheck className="w-3.5 h-3.5" />
            Ligne Active
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
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
                  className={`p-4 rounded-2xl text-xs space-y-1.5 shadow-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : msg.senderRole === 'SuperAdmin'
                      ? 'bg-purple-50 border border-purple-200 text-purple-900 rounded-tl-none font-medium'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-80 border-b border-black/10 pb-1">
                    <span className="font-bold">{msg.senderName} ({msg.senderRole})</span>
                    <span className="font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {/* Message Transmission / Delivery Indicator for Sent Messages */}
                  <div className={`pt-1 flex items-center justify-end text-[10px] font-mono font-semibold ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                    {isMe ? (
                      <span className="flex items-center gap-1 text-blue-100">
                        <CheckCheck className="w-3.5 h-3.5 text-blue-100" />
                        <span>Envoyé & Distribué au Poste {targetRecipientMatricule}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
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
        <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3 py-1">
            <span className="text-[10px] text-blue-600 font-bold uppercase font-mono shrink-0">
              Vers {recipientName} :
            </span>
            <input
              type="text"
              placeholder={`Tapez votre message pour ${recipientName}...`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full py-2 bg-transparent text-slate-900 text-xs focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all shrink-0"
          >
            <span>Envoyer</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
