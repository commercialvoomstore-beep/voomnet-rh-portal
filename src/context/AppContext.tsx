'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  AbsenceRequest,
  EmployeePrimeStatus,
  PrimeConfig,
  ChatMessage,
  AlertNotification,
  AuditLog,
  INITIAL_EMPLOYEES,
  INITIAL_ABSENCE_REQUESTS,
  INITIAL_PRIMES,
  INITIAL_PRIME_CONFIG,
  INITIAL_CHAT_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_FALLBACK_AVATAR,
} from '@/data/mockData';

export const playNotificationSound = () => {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Audio context silently ignored if muted
  }
};

interface AppContextType {
  user: Employee | null;
  splashVisible: boolean;
  dismissSplash: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  employees: Employee[];
  absenceRequests: AbsenceRequest[];
  primes: EmployeePrimeStatus[];
  primeConfig: PrimeConfig;
  chatMessages: ChatMessage[];
  notifications: AlertNotification[];
  auditLogs: AuditLog[];
  login: (matricule: string) => boolean;
  logout: () => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, empData: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  updateProfilePicture: (matricule: string, avatarUrl: string | null) => void;
  uploadProfilePictureFile: (file: File, matricule: string) => Promise<void>;
  updatePrimeConfig: (config: Partial<PrimeConfig>) => void;
  sendChatMessage: (text: string, recipientMatricule: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  createAbsenceRequest: (req: Omit<AbsenceRequest, 'id' | 'codeSuivi' | 'dateDemande'>) => string;
  updateAbsenceStatus: (id: string, statut: 'Approuvé' | 'Refusé', justifiee: boolean, notes?: string) => void;
  simulateUnjustifiedAbsence: (matricule: string, dateAbsence: string) => void;
  restorePrime: (matricule: string, motifRestauration: string) => void;
  activeToast: AlertNotification | null;
  dismissToast: () => void;
  showNotificationAlert: (title: string, message: string, type?: AlertNotification['type']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [splashVisible, setSplashVisible] = useState(true);
  const [user, setUser] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>(INITIAL_ABSENCE_REQUESTS);
  const [primeConfig, setPrimeConfig] = useState<PrimeConfig>(INITIAL_PRIME_CONFIG);
  const [primes, setPrimes] = useState<EmployeePrimeStatus[]>(INITIAL_PRIMES);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [notifications, setNotifications] = useState<AlertNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [activeToast, setActiveToast] = useState<AlertNotification | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  const dismissSplash = () => setSplashVisible(false);

  const showNotificationAlert = (
    title: string,
    message: string,
    type: AlertNotification['type'] = 'INFO'
  ) => {
    playNotificationSound();

    const newNotif: AlertNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setActiveToast(newNotif);

    setTimeout(() => {
      setActiveToast((current) => (current?.id === newNotif.id ? null : current));
    }, 5000);
  };

  const dismissToast = () => setActiveToast(null);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const login = (matricule: string): boolean => {
    const found = employees.find((e) => e.matricule.trim() === matricule.trim());
    if (found) {
      setUser(found);
      if (found.role === 'Employé') {
        setActiveTab('monposte');
      } else {
        setActiveTab('dashboard');
      }
      showNotificationAlert(
        `👋 Bienvenue ${found.prenom} ${found.nom}`,
        `Connexion réussie sous le rôle ${found.role} (${found.statut}).`,
        'SUCCESS'
      );
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    showNotificationAlert('🔒 Déconnexion', 'Vous avez été déconnecté du portail RH.', 'INFO');
  };

  const updateProfilePicture = (matricule: string, avatarUrl: string | null) => {
    const newAvatar = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : DEFAULT_FALLBACK_AVATAR;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.matricule === matricule) {
          const updated = { ...emp, avatar: newAvatar };
          if (user && user.matricule === matricule) {
            setUser(updated);
          }
          return updated;
        }
        return emp;
      })
    );

    const logMsg = avatarUrl
      ? `Photo de profil mise à jour pour le matricule ${matricule}.`
      : `Photo de profil réinitialisée pour le matricule ${matricule}.`;

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      type: 'AVATAR_CHANGE',
      message: logMsg,
      auteur: user ? `${user.prenom} ${user.nom}` : 'Utilisateur',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    showNotificationAlert(
      '🖼️ Photo de profil',
      avatarUrl ? 'Photo de profil mise à jour depuis votre appareil !' : 'Photo de profil réinitialisée.',
      'SUCCESS'
    );
  };

  const uploadProfilePictureFile = (file: File, matricule: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target?.result as string;
        if (base64Data) {
          updateProfilePicture(matricule, base64Data);
          resolve();
        } else {
          reject(new Error('Erreur de lecture du fichier image.'));
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      avatar: empData.avatar || DEFAULT_FALLBACK_AVATAR,
    };
    setEmployees((prev) => [newEmp, ...prev]);

    const newPrime: EmployeePrimeStatus = {
      matricule: newEmp.matricule,
      nomPrenom: `${newEmp.prenom} ${newEmp.nom}`,
      dateEmbauche: newEmp.dateEmbauche,
      statutCollaborateur: newEmp.statut,
      roleCollaborateur: newEmp.role,
      periodeNom: primeConfig.periodeNom,
      eligible: true,
      montantCalcule: primeConfig.montantReference,
      motifStatus: 'Nouveau collaborateur — Assiduité conforme',
    };
    setPrimes((prev) => [...prev, newPrime]);

    showNotificationAlert(
      '👤 Utilisateur Créé',
      `Le compte de ${newEmp.prenom} ${newEmp.nom} (Matricule ${newEmp.matricule}) a été créé.`,
      'SUCCESS'
    );
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    let empName = '';
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === id) {
          empName = `${emp.prenom} ${emp.nom}`;
          const updated = { ...emp, ...empData };
          if (user && user.id === id) {
            setUser(updated);
          }
          return updated;
        }
        return emp;
      })
    );

    if (empData.statut || empData.role || empData.nom || empData.prenom || empData.dateEmbauche) {
      setPrimes((prev) =>
        prev.map((p) => {
          const emp = employees.find((e) => e.id === id);
          if (emp && p.matricule === emp.matricule) {
            return {
              ...p,
              nomPrenom: empData.prenom && empData.nom ? `${empData.prenom} ${empData.nom}` : p.nomPrenom,
              dateEmbauche: empData.dateEmbauche || p.dateEmbauche,
              statutCollaborateur: empData.statut || p.statutCollaborateur,
              roleCollaborateur: empData.role || p.roleCollaborateur,
            };
          }
          return p;
        })
      );
    }

    showNotificationAlert(
      '✏️ Profil Modifié',
      `Informations de ${empName} enregistrées avec succès.`,
      'INFO'
    );
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    if (!target) return;

    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setPrimes((prev) => prev.filter((p) => p.matricule !== target.matricule));

    showNotificationAlert(
      '🗑️ Suppression Utilisateur',
      `Le compte de ${target.prenom} ${target.nom} a été supprimé.`,
      'ALERT'
    );
  };

  // Direct Transmission Chat (Sender -> Recipient) without simulated auto-replies
  const sendChatMessage = (text: string, recipientMatricule: string) => {
    if (!user) return;
    const recipientObj = employees.find((e) => e.matricule === recipientMatricule);
    const recipientName = recipientObj ? `${recipientObj.prenom} ${recipientObj.nom}` : 'Destinataire';

    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      senderMatricule: user.matricule,
      senderName: `${user.prenom} ${user.nom}`,
      senderRole: user.role,
      senderAvatar: user.avatar,
      recipientMatricule,
      recipientName,
      text,
      timestamp: nowTime,
      status: 'distribue', // Envoyé & Distribué au récepteur
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Play pleasant transmission sound
    playNotificationSound();

    showNotificationAlert(
      '💬 Message Envoyé',
      `Message transmis de ${user.prenom} vers ${recipientName} (Poste 3CX ${recipientMatricule}).`,
      'SUCCESS'
    );
  };

  const updatePrimeConfig = (newConfig: Partial<PrimeConfig>) => {
    setPrimeConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      if (newConfig.montantReference !== undefined) {
        setPrimes((pPrev) =>
          pPrev.map((p) => ({
            ...p,
            montantCalcule: p.eligible ? updated.montantReference : 0,
          }))
        );
      }
      return updated;
    });

    showNotificationAlert(
      '⚙️ Configuration Primes',
      `Nouveau montant de référence fixé à ${newConfig.montantReference || primeConfig.montantReference} FCFA.`,
      'SUCCESS'
    );
  };

  const generateTrackingCode = (): string => {
    const year = new Date().getFullYear();
    const randomHex = Math.floor(100000 + Math.random() * 900000);
    return `VN-P-${year}-${randomHex}`;
  };

  const createAbsenceRequest = (
    reqData: Omit<AbsenceRequest, 'id' | 'codeSuivi' | 'dateDemande'>
  ): string => {
    const code = generateTrackingCode();
    const newReq: AbsenceRequest = {
      ...reqData,
      id: `abs-${Date.now()}`,
      codeSuivi: code,
      dateDemande: new Date().toISOString().split('T')[0],
    };
    setAbsenceRequests((prev) => [newReq, ...prev]);

    if (!reqData.justifiee) {
      triggerPrimeCancellation(reqData.matricule, `Absence non justifiée (${code})`);
    } else {
      triggerPrimeAccordance(reqData.matricule, `Absence justifiée avec justificatif fourni (${code})`);
    }

    showNotificationAlert(
      '📜 Demande d\'Absence',
      `Demande enregistrée pour ${reqData.nomPrenom} (Code: ${code}).`,
      reqData.justifiee ? 'SUCCESS' : 'WARNING'
    );
    return code;
  };

  const triggerPrimeCancellation = (matricule: string, motif: string) => {
    setPrimes((prev) =>
      prev.map((p) => {
        if (p.matricule === matricule && p.periodeNom === primeConfig.periodeNom) {
          return {
            ...p,
            eligible: false,
            montantCalcule: 0,
            motifStatus: `ANNULÉE — ${motif}`,
            dateAnnulation: new Date().toLocaleString('fr-FR'),
            restaureeParAdmin: false,
          };
        }
        return p;
      })
    );
  };

  const triggerPrimeAccordance = (matricule: string, motif: string) => {
    setPrimes((prev) =>
      prev.map((p) => {
        if (p.matricule === matricule && p.periodeNom === primeConfig.periodeNom) {
          return {
            ...p,
            eligible: true,
            montantCalcule: primeConfig.montantReference,
            motifStatus: `ACCORDÉE — ${motif}`,
          };
        }
        return p;
      })
    );
  };

  const updateAbsenceStatus = (
    id: string,
    statut: 'Approuvé' | 'Refusé',
    justifiee: boolean,
    notes?: string
  ) => {
    let reqMatricule = '';
    setAbsenceRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          reqMatricule = r.matricule;
          return { ...r, statut, justifiee, cadreAdminNotes: notes || r.cadreAdminNotes };
        }
        return r;
      })
    );

    if (!justifiee || statut === 'Refusé') {
      if (reqMatricule) {
        triggerPrimeCancellation(
          reqMatricule,
          `Absence classée non justifiée par l'Administration RH (${notes || 'Sans motif valable'})`
        );
      }
    } else {
      if (reqMatricule) {
        triggerPrimeAccordance(
          reqMatricule,
          `Absence validée avec justificatif officiel (${notes || 'Certificat valide'})`
        );
      }
    }

    showNotificationAlert(
      statut === 'Approuvé' ? '✅ Demande Approuvée' : '❌ Demande Refusée',
      `La demande a été marquée comme ${statut.toLowerCase()}.`,
      statut === 'Approuvé' ? 'SUCCESS' : 'ALERT'
    );
  };

  const simulateUnjustifiedAbsence = (matricule: string, dateAbsence: string) => {
    const emp = employees.find((e) => e.matricule === matricule);
    if (!emp) return;

    triggerPrimeCancellation(matricule, `Pointage absent non justifié le ${dateAbsence}`);
    showNotificationAlert(
      '⚠️ Moteur de Primes Déclenché',
      `Absence non justifiée simulée pour ${emp.prenom} ${emp.nom}. Prime T3 annulée !`,
      'ALERT'
    );
  };

  const restorePrime = (matricule: string, motifRestauration: string) => {
    setPrimes((prev) =>
      prev.map((p) => {
        if (p.matricule === matricule && p.periodeNom === primeConfig.periodeNom) {
          return {
            ...p,
            eligible: true,
            montantCalcule: primeConfig.montantReference,
            restaureeParAdmin: true,
            restaureePar: user ? `${user.prenom} ${user.nom} (${user.role})` : 'Administrateur RH',
            dateRestauration: new Date().toLocaleString('fr-FR'),
            motifStatus: `ACCORDÉE (Restauration Manuelle RH) — ${motifRestauration}`,
          };
        }
        return p;
      })
    );

    showNotificationAlert(
      '🎉 Prime Restaurée',
      `La prime du matricule ${matricule} a été rétablie (${primeConfig.montantReference.toLocaleString('fr-FR')} FCFA).`,
      'SUCCESS'
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        splashVisible,
        dismissSplash,
        activeTab,
        setActiveTab,
        employees,
        absenceRequests,
        primes,
        primeConfig,
        chatMessages,
        notifications,
        auditLogs,
        login,
        logout,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        updateProfilePicture,
        uploadProfilePictureFile,
        updatePrimeConfig,
        sendChatMessage,
        markNotificationAsRead,
        clearAllNotifications,
        createAbsenceRequest,
        updateAbsenceStatus,
        simulateUnjustifiedAbsence,
        restorePrime,
        activeToast,
        dismissToast,
        showNotificationAlert,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
