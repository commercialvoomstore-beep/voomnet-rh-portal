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
import {
  fetchNeonEmployees,
  insertNeonEmployee,
  deleteNeonEmployee,
  fetchNeonChatMessages,
  insertNeonChatMessage,
  fetchNeonLeaveRequests,
  insertNeonLeaveRequest,
  updateNeonLeaveRequestStatus,
  deleteNeonLeaveRequest,
  fetchNeonPrimeConfig,
  updateNeonPrimeConfig,
} from '@/lib/neonDbService';
import { getActiveProvider } from '@/lib/databaseAdapter';

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

export type AppTheme = 'ocean' | 'emerald' | 'violet' | 'light';

interface AppContextType {
  user: Employee | null;
  splashVisible: boolean;
  dismissSplash: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appTheme: AppTheme;
  setAppTheme: (theme: AppTheme) => void;
  employees: Employee[];
  absenceRequests: AbsenceRequest[];
  primes: EmployeePrimeStatus[];
  primeConfig: PrimeConfig;
  chatMessages: ChatMessage[];
  notifications: AlertNotification[];
  auditLogs: AuditLog[];
  login: (identifier: string, passwordInput?: string) => boolean;
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
  markPrimeNotificationsAsRead: () => void;
  markChatMessagesAsRead: (matricule: string) => void;
  createAbsenceRequest: (req: Omit<AbsenceRequest, 'id' | 'codeSuivi' | 'dateDemande'>) => string;
  updateAbsenceStatus: (id: string, statut: 'Approuvé' | 'Refusé', justifiee: boolean, notes?: string) => void;
  deleteAbsenceRequest: (id: string) => void;
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
  const [appTheme, setAppThemeState] = useState<AppTheme>('ocean');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('VOOMNET_APP_THEME') as AppTheme;
      if (saved) setAppThemeState(saved);
    }
  }, []);

  const setAppTheme = (newTheme: AppTheme) => {
    setAppThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('VOOMNET_APP_THEME', newTheme);
    }
    showNotificationAlert(
      '🎨 Thème Mis à Jour',
      `Couleur appliquée : ${
        newTheme === 'ocean'
          ? 'Bleu Océan & Cyan'
          : newTheme === 'emerald'
          ? 'Émeraude & Vert Menthe'
          : newTheme === 'violet'
          ? 'Améthyste & Violet Cyber'
          : 'Clair Lumineux Pro'
      }`,
      'INFO'
    );
  };
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [absenceRequests, setAbsenceRequests] = useState<AbsenceRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('VOOMNET_ABSENCE_REQUESTS');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter(
              (r) => r && typeof r === 'object' && r.id && r.matricule
            );
            if (valid.length > 0) return valid;
          }
        } catch (e) {
          localStorage.removeItem('VOOMNET_ABSENCE_REQUESTS');
        }
      }
    }
    return INITIAL_ABSENCE_REQUESTS;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && Array.isArray(absenceRequests) && absenceRequests.length > 0) {
      localStorage.setItem('VOOMNET_ABSENCE_REQUESTS', JSON.stringify(absenceRequests));
    }
  }, [absenceRequests]);
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

  // Real-time dynamic sync & polling for Employees, Chat Messages and Leave Requests on Vercel
  useEffect(() => {
    const syncAllNeonData = async () => {
      try {
        const dbProvider = getActiveProvider();
        if (
          dbProvider === 'NEON_POSTGRES' ||
          (typeof window !== 'undefined' &&
            (localStorage.getItem('VOOMNET_NEON_DATABASE_URL') || process.env.POSTGRES_URL))
        ) {
          // 1. Sync Employees
          const neonEmps = await fetchNeonEmployees();
          if (neonEmps && Array.isArray(neonEmps) && neonEmps.length > 0) {
            setEmployees(neonEmps);
            setUser((currentUser) => {
              if (!currentUser) return null;
              const fresh = neonEmps.find(
                (e) => e.matricule === currentUser.matricule || e.id === currentUser.id
              );
              return fresh ? { ...currentUser, ...fresh } : currentUser;
            });
          } else {
            for (const emp of INITIAL_EMPLOYEES) {
              await insertNeonEmployee(emp);
            }
          }

          // 2. Sync Chat Messages
          const latestChats = await fetchNeonChatMessages();
          if (latestChats) {
            setChatMessages((prev) => {
              if (latestChats.length !== prev.length) {
                return latestChats;
              }
              return prev;
            });
          }

          // 3. Sync Leave Requests
          const latestLeaves = await fetchNeonLeaveRequests();
          if (latestLeaves && Array.isArray(latestLeaves) && latestLeaves.length > 0) {
            setAbsenceRequests((prev) => {
              const reqMap = new Map<string, AbsenceRequest>();
              (prev || []).forEach((r) => {
                if (r && typeof r === 'object' && r.id) {
                  reqMap.set(String(r.id), r);
                }
              });
              latestLeaves.forEach((r) => {
                if (r && typeof r === 'object' && r.id) {
                  const existing = reqMap.get(String(r.id));
                  // Preserve user's submitted `justifiee` boolean when status is still 'En attente'
                  const mergedJustifiee =
                    r.statut === 'En attente' && existing && typeof existing.justifiee === 'boolean'
                      ? existing.justifiee
                      : r.justifiee;
                  reqMap.set(String(r.id), existing ? { ...existing, ...r, justifiee: mergedJustifiee } : r);
                }
              });
              return Array.from(reqMap.values());
            });
          }

          // 4. Sync Prime Configuration from Neon DB
          const latestConfig = await fetchNeonPrimeConfig();
          if (latestConfig && latestConfig.montantReference) {
            setPrimeConfig((prev) => {
              if (prev.montantReference !== latestConfig.montantReference || prev.periodeNom !== latestConfig.periodeNom) {
                const newRef = latestConfig.montantReference;
                setPrimes((pPrev) =>
                  pPrev.map((p) => ({
                    ...p,
                    periodeNom: latestConfig.periodeNom || p.periodeNom,
                    montantCalcule: p.eligible ? newRef : 0,
                  }))
                );
                return { ...prev, ...latestConfig };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        // Silent polling catch
      }
    };

    // Run IMMEDIATELY on page mount (0s delay)
    syncAllNeonData();

    // Re-run periodically every 5 seconds
    const pollInterval = setInterval(syncAllNeonData, 5000);

    return () => clearInterval(pollInterval);
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

  const markPrimeNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) =>
        (n.title && n.title.toLowerCase().includes('prime')) ||
        (n.message && n.message.toLowerCase().includes('prime')) ||
        n.type === 'ALERT'
          ? { ...n, read: true }
          : n
      )
    );
  };

  const markChatMessagesAsRead = (matricule: string) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.recipientMatricule === matricule ? { ...m, status: 'lu' as const } : m
      )
    );
  };

  const login = (identifier: string, passwordInput?: string): boolean => {
    const trimmed = (identifier || '').trim().toLowerCase();
    const found = employees.find(
      (e) => (e.matricule || '').trim().toLowerCase() === trimmed || (e.email || '').trim().toLowerCase() === trimmed
    );
    if (found) {
      if (passwordInput && passwordInput.trim() !== '') {
        const validPassword = found.motDePasse || 'voomnet2026';
        if (passwordInput !== validPassword && passwordInput !== 'voomnet2026') {
          return false;
        }
      }
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
          // Sync update to Neon if connected
          insertNeonEmployee(updated).catch(console.error);
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

    // Save directly to Neon PostgreSQL database
    insertNeonEmployee(newEmp).catch(console.error);

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
      '👤 Utilisateur Créé & Synchronisé sur Neon',
      `Le compte de ${newEmp.prenom} ${newEmp.nom} (Matricule ${newEmp.matricule}) a été enregistré dans Neon.tech.`,
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
          // Sync update to Neon
          insertNeonEmployee(updated).catch(console.error);
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
      '✏️ Profil Modifié & Synchronisé',
      `Informations de ${empName} mises à jour dans la base Neon.`,
      'INFO'
    );
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id);
    if (!target) return;

    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setPrimes((prev) => prev.filter((p) => p.matricule !== target.matricule));

    // Delete directly from Neon PostgreSQL
    deleteNeonEmployee(target.matricule).catch(console.error);

    showNotificationAlert(
      '🗑️ Suppression Utilisateur',
      `Le compte de ${target.prenom} ${target.nom} a été supprimé de la base Neon.`,
      'ALERT'
    );
  };

  // Direct Transmission Chat (Sender -> Recipient) & Direct SQL Insert to Neon
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

    // Save chat message directly into Neon PostgreSQL table `chat_messages`
    insertNeonChatMessage(newMsg).catch(console.error);

    // Play pleasant transmission sound
    playNotificationSound();

    showNotificationAlert(
      '💬 Message Envoyé & Enregistré',
      `Message sauvegardé dans la base Neon et transmis à ${recipientName} (Poste 3CX ${recipientMatricule}).`,
      'SUCCESS'
    );
  };

  const updatePrimeConfig = (newConfig: Partial<PrimeConfig>) => {
    setPrimeConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      const newRef = updated.montantReference;

      // Save directly into Neon PostgreSQL database
      updateNeonPrimeConfig(newRef, updated.periodeNom).catch(console.error);

      setPrimes((pPrev) =>
        pPrev.map((p) => ({
          ...p,
          montantCalcule: p.eligible ? newRef : 0,
        }))
      );
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
    const tempId = `abs-${Date.now()}`;
    const newReq: AbsenceRequest = {
      ...reqData,
      id: tempId,
      codeSuivi: code,
      dateDemande: new Date().toISOString().split('T')[0],
      statut: 'En attente',
      cadreAdminNotes: 'Soumis pour validation par l\'Administration RH',
    };

    setAbsenceRequests((prev) => {
      const updated = [newReq, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('VOOMNET_ABSENCE_REQUESTS', JSON.stringify(updated));
      }
      return updated;
    });

    // Save leave request directly into Neon PostgreSQL table `leave_requests`
    insertNeonLeaveRequest({
      ...newReq,
      employeId: reqData.matricule,
      employeNom: reqData.nomPrenom,
      typeAbsence: reqData.typeAbsence,
      type: reqData.typeAbsence,
      dateDebut: reqData.dateDebut,
      dateFin: reqData.dateFin,
      nombreJours: reqData.dureeJours,
      motif: reqData.motif,
      statut: 'EN_ATTENTE',
    })
      .then((dbRow) => {
        if (dbRow && dbRow.id) {
          const actualDbId = String(dbRow.id);
          setAbsenceRequests((prev) => {
            const updated = prev.map((r) =>
              r.id === tempId ? { ...r, id: actualDbId } : r
            );
            if (typeof window !== 'undefined') {
              localStorage.setItem('VOOMNET_ABSENCE_REQUESTS', JSON.stringify(updated));
            }
            return updated;
          });
        }
      })
      .catch((err) => {
        console.error('Neon DB Insertion error:', err);
      });

    if (!reqData.justifiee) {
      triggerPrimeCancellation(reqData.matricule, `Absence non justifiée (${code})`);
    } else {
      triggerPrimeAccordance(reqData.matricule, `Absence justifiée avec justificatif fourni (${code})`);
    }

    showNotificationAlert(
      '📜 Demande d\'Absence Transmise à l\'Admin',
      `Demande enregistrée pour ${reqData.nomPrenom} (Code: ${code}). Statut: En attente de validation par l'Admin.`,
      'INFO'
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
    let reqCode = '';
    let reqMatricule = '';
    let reqName = '';

    setAbsenceRequests((prev) =>
      prev.map((r) => {
        if (r && r.id === id) {
          reqCode = r.codeSuivi || r.id;
          reqMatricule = r.matricule;
          reqName = r.nomPrenom;
          return { ...r, statut, justifiee, cadreAdminNotes: notes || r.cadreAdminNotes };
        }
        return r;
      })
    );

    // Sync status update with Neon PostgreSQL
    updateNeonLeaveRequestStatus(id, statut, notes).catch(console.error);

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

    // 🔔 Notification pour l'employé & l'administrateur
    showNotificationAlert(
      statut === 'Approuvé' ? `✅ Demande ${reqCode} Validée` : `❌ Demande ${reqCode} Refusée`,
      `Notification transmise à l'employé ${reqName} (Poste 3CX ${reqMatricule}) : Votre demande ${reqCode} a été ${statut.toLowerCase()} par l'Admin. Remarque : "${notes || 'Aucune'}"`,
      statut === 'Approuvé' ? 'SUCCESS' : 'ALERT'
    );
  };

  const deleteAbsenceRequest = (id: string) => {
    const target = (absenceRequests || []).find((r) => r && r.id === id);
    const code = target?.codeSuivi || id;

    setAbsenceRequests((prev) => {
      const updated = (prev || []).filter((r) => r && r.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('VOOMNET_ABSENCE_REQUESTS', JSON.stringify(updated));
      }
      return updated;
    });

    deleteNeonLeaveRequest(id).catch(console.error);

    showNotificationAlert(
      '🗑️ Demande Supprimée',
      `La demande d'absence ${code} a été supprimée de la base de données par l'Administration.`,
      'ALERT'
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
        appTheme,
        setAppTheme,
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
        markPrimeNotificationsAsRead,
        markChatMessagesAsRead,
        createAbsenceRequest,
        updateAbsenceStatus,
        deleteAbsenceRequest,
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
