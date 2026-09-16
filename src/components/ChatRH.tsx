'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Send,
  MessageSquare,
  Search,
  Clock,
  Check,
  CheckCheck,
  PhoneCall,
  Briefcase,
  Users,
  Zap,
} from 'lucide-react';

export const ChatRH: React.FC = () => {
  const { user, chatMessages, sendChatMessage, employees, markChatMessagesAsRead } = useApp();
  const [selectedMatricule, setSelectedMatricule] = useState<string>('');
  const [searchContact, setSearchContact] = useState<string>('');
  const [text, setText] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessagesCountRef = useRef<number>(0);
  const selectedMatriculeRef = useRef<string>(selectedMatricule);

  // Exclude current user from candidate contacts
  const otherEmployees = (employees || []).filter(
    (e) => e && e.matricule && e.matricule !== user?.matricule
  );

  // Default selected recipient
  useEffect(() => {
    if (!selectedMatricule && otherEmployees.length > 0) {
      const defaultContact =
        otherEmployees.find((e) => e.matricule === '9999' || e.matricule === '1000') ||
        otherEmployees[0];
      if (defaultContact) {
        setSelectedMatricule(defaultContact.matricule);
      }
    }
  }, [otherEmployees, selectedMatricule]);

  // Mark chat messages as read when active contact is open or updated
  useEffect(() => {
    if (user?.matricule && selectedMatricule) {
      markChatMessagesAsRead(user.matricule, selectedMatricule);
    }
  }, [user?.matricule, selectedMatricule, chatMessages.length, markChatMessagesAsRead]);

  if (!user) return null;

  const selectedRecipient = otherEmployees.find((e) => e.matricule === selectedMatricule) || otherEmployees[0];

  // Filter messages between current logged-in user and selected contact
  const conversationMessages = (chatMessages || []).filter(
    (m) =>
      (m.senderMatricule === user.matricule && m.recipientMatricule === selectedMatricule) ||
      (m.senderMatricule === selectedMatricule && m.recipientMatricule === user.matricule)
  );

  // Scroll to bottom helper
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  };

  // Smart Auto-scroll handling: only scroll down if contact changed or if user is already near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const contactChanged = selectedMatriculeRef.current !== selectedMatricule;
    selectedMatriculeRef.current = selectedMatricule;

    const currentCount = conversationMessages.length;
    const prevCount = prevMessagesCountRef.current;
    prevMessagesCountRef.current = currentCount;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 150;

    if (contactChanged) {
      scrollToBottom(false);
    } else if (currentCount > prevCount && isNearBottom) {
      scrollToBottom(true);
    }
  }, [conversationMessages, selectedMatricule]);

  // Focus input when selected contact changes
  useEffect(() => {
    if (selectedMatricule) {
      inputRef.current?.focus();
    }
  }, [selectedMatricule]);

  // Filter contacts by search query
  const filteredContacts = otherEmployees.filter((emp) => {
    const q = searchContact.toLowerCase();
    const fullName = `${emp.prenom} ${emp.nom}`.toLowerCase();
    return (
      fullName.includes(q) ||
      emp.matricule.toLowerCase().includes(q) ||
      (emp.poste || '').toLowerCase().includes(q) ||
      (emp.role || '').toLowerCase().includes(q)
    );
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !selectedMatricule) return;
    sendChatMessage(text.trim(), selectedMatricule);
    setText('');
    setTimeout(() => scrollToBottom(true), 50);
  };

  const handleQuickReply = (suggestion: string) => {
    if (!selectedMatricule) return;
    sendChatMessage(suggestion, selectedMatricule);
    setTimeout(() => scrollToBottom(true), 50);
  };

  const quickSuggestions = [
    "Bonjour !",
    "Bien reçu, merci !",
    "Pouvez-vous valider ma demande ?",
    "Message urgent poste 3CX",
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0E125E] via-[#2A1175] to-[#5E1675] p-5 rounded-3xl shadow-lg border border-purple-900/30 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden shrink-0">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-purple-200 shadow-inner shrink-0">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] font-mono font-extrabold uppercase tracking-wider">
                Messagerie Instantanée RH
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Ligne 3CX Directe
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Espace de Discussion Directe
            </h2>
            <p className="text-xs text-purple-200 mt-0.5 font-medium">
              Canal de communication chiffré et synchronisé en temps réel avec le serveur Neon.
            </p>
          </div>
        </div>

        {selectedRecipient && (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2.5 px-3.5 rounded-2xl border border-white/15 relative z-10 shrink-0">
            <img
              src={selectedRecipient.avatar}
              alt={selectedRecipient.nom}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-purple-300 shadow"
            />
            <div className="text-xs">
              <div className="font-extrabold text-white">{selectedRecipient.prenom} {selectedRecipient.nom}</div>
              <div className="text-[10px] text-purple-200 font-mono flex items-center gap-1">
                <PhoneCall className="w-3 h-3 text-emerald-400" />
                <span>Poste 3CX : {selectedRecipient.matricule} ({selectedRecipient.role})</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Chat Layout with Clean Responsive Height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-210px)] min-h-[580px] max-h-[720px]">
        {/* Left Column: Contact Selector Directory */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden h-full">
          {/* Contacts Header & Search */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0E125E] uppercase tracking-wider">
                <Users className="w-4 h-4 text-[#5E1675]" />
                <span>Contacts ({otherEmployees.length})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                Ligne Directe
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Chercher un nom, rôle, poste..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#5E1675] focus:ring-1 focus:ring-purple-100"
              />
            </div>
          </div>

          {/* Contacts List with Sleek Scrollbar */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 custom-scrollbar">
            {filteredContacts.map((emp) => {
              const isSelected = emp.matricule === selectedMatricule;

              // Unread badge counter for this specific sender
              const unreadForThisContact = chatMessages.filter((m) => {
                const isForUser = m.recipientMatricule === user.matricule;
                const isForSuperAdminRH =
                  user.role === 'SuperAdmin' && (m.recipientMatricule === '9999' || m.recipientMatricule === '1000');
                return m.senderMatricule === emp.matricule && (isForUser || isForSuperAdminRH) && m.status !== 'lu';
              }).length;

              // Last message exchanged with this contact
              const lastMsg = (chatMessages || []).filter(
                (m) =>
                  (m.senderMatricule === emp.matricule && m.recipientMatricule === user.matricule) ||
                  (m.senderMatricule === user.matricule && m.recipientMatricule === emp.matricule)
              ).slice(-1)[0];

              return (
                <button
                  key={emp.id || emp.matricule}
                  onClick={() => setSelectedMatricule(emp.matricule)}
                  className={`w-full p-3 rounded-2xl text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0E125E]/10 to-[#5E1675]/10 border-2 border-[#5E1675] shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img
                        src={emp.avatar}
                        alt={emp.nom}
                        className={`w-10 h-10 rounded-xl object-cover ring-2 ${
                          isSelected ? 'ring-[#5E1675]' : 'ring-slate-200'
                        }`}
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-extrabold truncate ${isSelected ? 'text-[#0E125E]' : 'text-slate-900'}`}>
                          {emp.prenom} {emp.nom}
                        </span>
                        {lastMsg && (
                          <span className="text-[9px] font-mono text-slate-400 shrink-0">
                            {lastMsg.timestamp}
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        {lastMsg ? (
                          <span className="truncate italic text-slate-600">
                            {lastMsg.senderMatricule === user.matricule ? 'Vous : ' : ''}{lastMsg.text}
                          </span>
                        ) : (
                          <span className="font-mono text-[#5E1675]">Poste {emp.matricule} • {emp.poste}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                        emp.role === 'SuperAdmin'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : emp.role === 'Admin' || (emp.role as string) === 'Admin RH'
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {emp.role}
                    </span>

                    {unreadForThisContact > 0 && (
                      <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-bounce shadow">
                        {unreadForThisContact}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredContacts.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs font-medium">
                Aucun collaborateur trouvé.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Conversation Window */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden h-full">
          {selectedRecipient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedRecipient.avatar}
                    alt={selectedRecipient.nom}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#5E1675]"
                  />
                  <div>
                    <div className="text-xs font-extrabold text-[#0E125E] flex items-center gap-2">
                      <span>Discussion avec {selectedRecipient.prenom} {selectedRecipient.nom}</span>
                      <span className="text-[10px] font-mono text-[#5E1675] font-bold">
                        (Poste 3CX {selectedRecipient.matricule})
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      <span>{selectedRecipient.poste} — {selectedRecipient.departement}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 font-bold">
                    <CheckCheck className="w-3.5 h-3.5" />
                    En Ligne
                  </span>
                </div>
              </div>

              {/* Message Feed with Custom Scrollbar & Container Ref */}
              <div
                ref={messagesContainerRef}
                className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/40 custom-scrollbar scroll-smooth"
              >
                {conversationMessages.map((msg) => {
                  const isMe = msg.senderMatricule === user.matricule;
                  const isRead = msg.status === 'lu';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-md ${
                        isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl text-xs space-y-1.5 shadow-sm w-full ${
                          isMe
                            ? 'bg-gradient-to-r from-[#0E125E] to-[#2A1175] text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none font-medium'
                        }`}
                      >
                        {/* Header: Sender Name + Timestamp */}
                        <div
                          className={`flex items-center justify-between gap-4 text-[10px] pb-1 border-b ${
                            isMe ? 'border-white/15 text-purple-200' : 'border-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="font-extrabold tracking-wide">{msg.senderName}</span>
                          <span className="font-mono flex items-center gap-1 opacity-90">
                            <Clock className="w-3 h-3" />
                            {msg.timestamp}
                          </span>
                        </div>

                        {/* Message Text */}
                        <p className="leading-relaxed whitespace-pre-wrap text-xs font-normal py-0.5">
                          {msg.text}
                        </p>

                        {/* WhatsApp-Style Checkmark Status */}
                        <div className="flex items-center justify-end pt-0.5">
                          {isMe ? (
                            isRead ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400" title="Message lu par le destinataire">
                                <CheckCheck className="w-4 h-4 text-emerald-400" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-300" title="Message distribué au poste">
                                <Check className="w-3.5 h-3.5 text-purple-300" />
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600" title="Message reçu">
                              <CheckCheck className="w-4 h-4 text-emerald-600" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {conversationMessages.length === 0 && (
                  <div className="text-center py-16 text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">
                      Aucun message échangé pour le moment avec {selectedRecipient.prenom} {selectedRecipient.nom}.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Saisissez un message ci-dessous pour démarrer la discussion directe.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Reply Suggestions */}
              <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/60 flex items-center gap-2 overflow-x-auto select-none shrink-0 custom-scrollbar">
                <span className="text-[10px] font-bold text-[#5E1675] flex items-center gap-1 shrink-0 font-mono uppercase">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Réponses Rapides :
                </span>
                {quickSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickReply(sug)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-[#0E125E] text-[10px] font-bold transition-all shrink-0 cursor-pointer shadow-none hover:shadow-sm"
                  >
                    {sug}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form onSubmit={handleSend} className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shrink-0">
                <div className="flex-1 flex items-center gap-2 bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 focus-within:border-[#5E1675] focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                  <span className="text-[10px] text-[#5E1675] font-extrabold uppercase font-mono shrink-0">
                    À {selectedRecipient.prenom} :
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Tapez votre message pour ${selectedRecipient.prenom} ${selectedRecipient.nom}...`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full py-1.5 bg-transparent text-slate-900 text-xs focus:outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-3 bg-gradient-to-r from-[#0E125E] to-[#5E1675] hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0 cursor-pointer"
                >
                  <span>Envoyer</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Veuillez sélectionner un collaborateur dans la liste à gauche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
