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
  normalizeRole,
  isEmployeRole,
  isSuperAdminRole,
  isAdminRole,
  formatDateYYYYMMDD,
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
  fetchNeonPrimeAttributions,
  insertNeonPrimeAttribution,
  fetchNeonNotifications,
  insertNeonNotification,
  markNeonNotificationAsRead,
  clearNeonNotifications,
} from '@/lib/neonDbService';
import { getActiveProvider } from '@/lib/databaseAdapter';

export const playNotificationSound = (type: 'info' | 'success' | 'alert' | 'chat' = 'info') => {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'chat') {
      // Pleasant double-ding for Chat RH
      const osc1 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      osc1.frequency.setValueAtTime(880, now + 0.08); // A5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.35);
    } else if (type === 'alert') {
      // Warning chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(349.23, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // Success / Info crystal chime (C5 -> E5 -> G5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc2.frequency.setValueAtTime(783.99, now + 0.16); // G5

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.16);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    }
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
  login: (identifier: string, passwordInput?: string, isQuickLogin?: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => Promise<boolean>;
  updateEmployee: (id: string, empData: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  updateProfilePicture: (matricule: string, avatarUrl: string | null) => void;
  uploadProfilePictureFile: (file: File, matricule: string) => Promise<void>;
  updatePrimeConfig: (config: Partial<PrimeConfig>) => void;
  sendChatMessage: (text: string, recipientMatricule: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  markPrimeNotificationsAsRead: () => void;
  markChatMessagesAsRead: (matricule: string, senderMatricule?: string) => void;
  createAbsenceRequest: (req: Omit<AbsenceRequest, 'id' | 'codeSuivi' | 'dateDemande'>) => string;
  updateAbsenceStatus: (id: string, statut: 'Approuvé' | 'Refusé', justifiee: boolean, notes?: string) => void;
  deleteAbsenceRequest: (id: string) => void;
  simulateUnjustifiedAbsence: (matricule: string, dateAbsence: string) => void;
  restorePrime: (matricule: string, motifRestauration: string) => void;
  primeAttributions: (EmployeePrimeStatus & {
    statut: 'Accordée' | 'Refusée' | 'En attente';
    montant: number;
    motif: string;
    masquee?: boolean;
  })[];
  attributePrime: (
    matricule: string,
    statut: 'Accordée' | 'Refusée' | 'En attente',
    motif: string,
    customMontant?: number
  ) => void;
  activeToast: AlertNotification | null;
  dismissToast: () => void;
  showNotificationAlert: (title: string, message: string, type?: AlertNotification['type'], recipientMatricule?: string) => void;
}

// Local persistence overlays to ensure modifications are immediate & permanent
const getEditedEmployeesMap = (): Map<string, Employee> => {
  if (typeof window === 'undefined') return new Map();
  try {
    const saved = localStorage.getItem('VOOMNET_EDITED_EMPLOYEES_MAP');
    if (saved) {
      const obj = JSON.parse(saved);
      const map = new Map<string, Employee>();
      Object.keys(obj).forEach((k) => map.set(k, obj[k]));
      return map;
    }
  } catch (e) {}
  return new Map();
};

const saveEditedEmployeeLocally = (emp: Employee) => {
  if (typeof window === 'undefined' || !emp || !emp.matricule) return;
  try {
    const map = getEditedEmployeesMap();
    map.set(emp.matricule, emp);
    const obj: Record<string, Employee> = {};
    map.forEach((v, k) => (obj[k] = v));
    localStorage.setItem('VOOMNET_EDITED_EMPLOYEES_MAP', JSON.stringify(obj));
  } catch (e) {}
};

const removeEditedEmployeeLocally = (matricule: string) => {
  if (typeof window === 'undefined') return;
  try {
    const map = getEditedEmployeesMap();
    map.delete(matricule);
    const obj: Record<string, Employee> = {};
    map.forEach((v, k) => (obj[k] = v));
    localStorage.setItem('VOOMNET_EDITED_EMPLOYEES_MAP', JSON.stringify(obj));
  } catch (e) {}
};

const getDeletedMatriculesSet = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const saved = localStorage.getItem('VOOMNET_DELETED_MATRICULES');
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

const saveDeletedMatriculeLocally = (matricule: string) => {
  if (typeof window === 'undefined' || !matricule) return;
  try {
    const set = getDeletedMatriculesSet();
    set.add(matricule);
    localStorage.setItem('VOOMNET_DELETED_MATRICULES', JSON.stringify(Array.from(set)));
    removeEditedEmployeeLocally(matricule);
  } catch (e) {}
};

const getMaskedPrimesMap = (): Map<string, boolean> => {
  if (typeof window === 'undefined') return new Map();
  try {
    const saved = localStorage.getItem('VOOMNET_MASKED_PRIMES_MAP');
    if (saved) {
      const obj = JSON.parse(saved);
      const map = new Map<string, boolean>();
      Object.keys(obj).forEach((k) => map.set(k, Boolean(obj[k])));
      return map;
    }
  } catch (e) {}
  return new Map();
};

const saveMaskedPrimeLocally = (matricule: string, isMasked: boolean) => {
  if (typeof window === 'undefined' || !matricule) return;
  try {
    const map = getMaskedPrimesMap();
    map.set(matricule, isMasked);
    const obj: Record<string, boolean> = {};
    map.forEach((v, k) => (obj[k] = v));
    localStorage.setItem('VOOMNET_MASKED_PRIMES_MAP', JSON.stringify(obj));
  } catch (e) {}
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [splashVisible, setSplashVisible] = useState(true);
  const [user, setUser] = useState<Employee | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('VOOMNET_USER_SESSION');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        sessionStorage.removeItem('VOOMNET_USER_SESSION');
      }
    }
    return null;
  });
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
  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const editedMap = getEditedEmployeesMap();
        const deletedSet = getDeletedMatriculesSet();
        const saved = localStorage.getItem('VOOMNET_EXTRA_EMPLOYEES');
        const map = new Map<string, Employee>();

        INITIAL_EMPLOYEES.forEach((e) => {
          if (e && e.matricule && !deletedSet.has(e.matricule)) {
            map.set(e.matricule, e);
          }
        });

        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach((e) => {
              if (e && e.matricule && !deletedSet.has(e.matricule)) {
                map.set(e.matricule, e);
              }
            });
          }
        }

        // Apply edited overlay map
        editedMap.forEach((edited, m) => {
          if (!deletedSet.has(m)) {
            const existing = map.get(m);
            map.set(m, existing ? { ...existing, ...edited } : edited);
          }
        });

        return Array.from(map.values());
      } catch (e) {}
    }
    return INITIAL_EMPLOYEES;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && Array.isArray(employees) && employees.length > 0) {
      try {
        localStorage.setItem('VOOMNET_EXTRA_EMPLOYEES', JSON.stringify(employees));
      } catch (e) {}
    }
  }, [employees]);
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

  const [notifications, setNotifications] = useState<AlertNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('VOOMNET_NOTIFICATIONS');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          localStorage.removeItem('VOOMNET_NOTIFICATIONS');
        }
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [activeToast, setActiveToast] = useState<AlertNotification | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Real-time dynamic sync & polling for Employees, Chat Messages and Leave Requests on Vercel
  useEffect(() => {
    const syncAllNeonData = async () => {
      try {
        // 1. Sync Employees
        const neonEmps = await fetchNeonEmployees();
        if (neonEmps && Array.isArray(neonEmps) && neonEmps.length > 0) {
          const editedMap = getEditedEmployeesMap();
          const deletedSet = getDeletedMatriculesSet();

          setEmployees((prev) => {
            const map = new Map<string, Employee>();

            // First: add neonEmps (overlaying local edited modifications & ignoring deleted)
            neonEmps.forEach((e) => {
              if (e && e.matricule) {
                if (deletedSet.has(e.matricule)) return;
                const edited = editedMap.get(e.matricule);
                if (edited) {
                  map.set(e.matricule, { ...e, ...edited });
                } else {
                  map.set(e.matricule, e);
                }
              }
            });

            // Second: add prev/local state employees not in neonEmps (if not deleted)
            (prev || []).forEach((e) => {
              if (e && e.matricule && !deletedSet.has(e.matricule)) {
                if (!map.has(e.matricule)) {
                  map.set(e.matricule, e);
                } else {
                  const edited = editedMap.get(e.matricule);
                  if (edited) {
                    const currentInMap = map.get(e.matricule)!;
                    map.set(e.matricule, { ...currentInMap, ...edited });
                  }
                }
              }
            });

            const merged = Array.from(map.values());
            if (JSON.stringify(merged) !== JSON.stringify(prev)) {
              if (typeof window !== 'undefined') {
                try {
                  localStorage.setItem('VOOMNET_EXTRA_EMPLOYEES', JSON.stringify(merged));
                } catch (e) {}
              }
              return merged;
            }
            return prev;
          });

          setUser((currentUser) => {
            if (!currentUser) return null;
            const fresh = neonEmps.find(
              (e) => e.matricule === currentUser.matricule || e.id === currentUser.id
            );
            if (!fresh) return currentUser;
            const edited = editedMap.get(currentUser.matricule);
            return edited ? { ...fresh, ...edited } : fresh;
          });
        }

          // 2. Sync Chat Messages
          const latestChats = await fetchNeonChatMessages();
          if (latestChats && Array.isArray(latestChats)) {
            const readSet = getReadChatKeys();
            setChatMessages((prev) => {
              const seen = new Set<string>();
              const unique: ChatMessage[] = [];

              latestChats.forEach((m) => {
                const key = m.id || `${m.senderMatricule}-${m.recipientMatricule}-${m.text ? m.text.trim() : ''}-${m.timestamp}`;
                const isRead = readSet.has(key) || (m.id && readSet.has(m.id));
                const finalStatus = isRead ? ('lu' as const) : m.status;

                if (!seen.has(key)) {
                  seen.add(key);
                  unique.push({ ...m, status: finalStatus });
                }
              });

              if (unique.length !== prev.length || JSON.stringify(unique) !== JSON.stringify(prev)) {
                return unique;
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

                  // Create notifications for validated or refused requests if not already created
                  if (r.statut === 'Approuvé' || r.statut === 'Refusé') {
                    const notifKey = `notif-leave-${r.id}`;
                    setNotifications((prevNotifs) => {
                      if (!prevNotifs.some((n) => n.id === notifKey)) {
                        const isApproved = r.statut === 'Approuvé';
                        const notifTitle = isApproved
                          ? `🎉 Demande ${r.codeSuivi || r.id} Validée !`
                          : `❌ Demande ${r.codeSuivi || r.id} Refusée`;
                        const notifMsg = `Votre demande de permission "${r.typeAbsence}" a été ${r.statut.toLowerCase()} par l'Administration RH. Remarque RH : "${r.cadreAdminNotes || 'Aucune'}"`;
                        const newNotif: AlertNotification = {
                          id: notifKey,
                          title: notifTitle,
                          message: notifMsg,
                          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                          type: isApproved ? 'SUCCESS' : 'ALERT',
                          read: false,
                          recipientMatricule: r.matricule,
                        };
                        const updated = [newNotif, ...prevNotifs];
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('VOOMNET_NOTIFICATIONS', JSON.stringify(updated));
                        }
                        return updated;
                      }
                      return prevNotifs;
                    });
                  }

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
                return { ...prev, ...latestConfig };
              }
              return prev;
            });
          }

          // 5. Sync Prime Attributions from Neon DB
          const latestAttributions = await fetchNeonPrimeAttributions();
          if (latestAttributions && Array.isArray(latestAttributions) && latestAttributions.length > 0) {
            const maskedMap = getMaskedPrimesMap();
            setPrimes((prevPrimes) => {
              const primeMap = new Map<string, EmployeePrimeStatus>();
              (prevPrimes || []).forEach((p) => {
                if (p && p.matricule) {
                  primeMap.set(String(p.matricule).trim(), p);
                }
              });

              latestAttributions.forEach((attr) => {
                if (attr && attr.matricule) {
                  const mKey = String(attr.matricule).trim();
                  const existing = primeMap.get(mKey);
                  const isAccordee = attr.statut === 'Accordée';
                  const isRefused = attr.statut === 'Refusée';
                  const resolvedMontant = typeof attr.montant === 'number' && !isNaN(attr.montant)
                    ? attr.montant
                    : (isAccordee ? primeConfig.montantReference : 0);

                  const isMaskedVal = maskedMap.has(mKey) ? Boolean(maskedMap.get(mKey)) : Boolean(existing?.masquee);

                  const updatedItem: EmployeePrimeStatus = {
                    matricule: mKey,
                    nomPrenom: attr.nomPrenom || existing?.nomPrenom || 'Collaborateur',
                    dateEmbauche: existing?.dateEmbauche || '2023-01-01',
                    statutCollaborateur: existing?.statutCollaborateur || 'CDI',
                    roleCollaborateur: existing?.roleCollaborateur || 'Employé',
                    periodeNom: attr.periodeNom || existing?.periodeNom || primeConfig.periodeNom,
                    eligible: isAccordee,
                    montantCalcule: resolvedMontant,
                    statut: (isAccordee ? 'Accordée' : isRefused ? 'Refusée' : 'En attente') as 'Accordée' | 'Refusée' | 'En attente',
                    montant: resolvedMontant,
                    motif: attr.motif || existing?.motif || '',
                    motifStatus: `${attr.statut.toUpperCase()} — ${attr.motif || 'Décision RH'}`,
                    masquee: isMaskedVal,
                  };

                  primeMap.set(mKey, updatedItem);
                }
              });

              return Array.from(primeMap.values());
            });
          }

          // 6. Sync System Notifications from Neon DB
          if (user) {
            const latestNotifs = await fetchNeonNotifications(user.matricule, user.role);
            if (latestNotifs && Array.isArray(latestNotifs)) {
              const readNotifSet = getReadNotifIds();
              setNotifications((prev) => {
                const merged = latestNotifs.map((n) => {
                  if (readNotifSet.has(n.id)) {
                    return { ...n, read: true };
                  }
                  return n;
                });
                if (JSON.stringify(merged) !== JSON.stringify(prev)) {
                  return merged;
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

    // Re-run periodically every 15 seconds
    const pollInterval = setInterval(syncAllNeonData, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  const dismissSplash = () => setSplashVisible(false);

  const showNotificationAlert = (
    title: string,
    message: string,
    type: AlertNotification['type'] = 'INFO',
    recipientMatricule?: string
  ) => {
    // Only play sound and trigger active toast if recipient matches logged in user or if global
    const isForCurrentUser = !recipientMatricule || (user && recipientMatricule === user.matricule);

    if (isForCurrentUser) {
      const soundType =
        type === 'ALERT'
          ? 'alert'
          : type === 'CHAT'
          ? 'chat'
          : type === 'SUCCESS'
          ? 'success'
          : 'info';
      playNotificationSound(soundType);
    }

    const newNotif: AlertNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title,
      message,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false,
      recipientMatricule,
    };

    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('VOOMNET_NOTIFICATIONS', JSON.stringify(updated));
      }
      return updated;
    });

    // Save directly into Neon PostgreSQL database
    insertNeonNotification({
      id: newNotif.id,
      title,
      message,
      type,
      recipientMatricule,
    }).catch(console.error);

    if (isForCurrentUser) {
      setActiveToast(newNotif);

      setTimeout(() => {
        setActiveToast((current) => (current?.id === newNotif.id ? null : current));
      }, 5000);
    }
  };

  const dismissToast = () => setActiveToast(null);

  const getReadNotifIds = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('VOOMNET_READ_NOTIF_IDS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {}
    return new Set();
  };

  const saveReadNotifIds = (idsSet: Set<string>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('VOOMNET_READ_NOTIF_IDS', JSON.stringify(Array.from(idsSet)));
    } catch (e) {}
  };

  const markNotificationAsRead = (id: string) => {
    const readNotifSet = getReadNotifIds();
    readNotifSet.add(id);
    saveReadNotifIds(readNotifSet);

    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      if (typeof window !== 'undefined') {
        localStorage.setItem('VOOMNET_NOTIFICATIONS', JSON.stringify(updated));
      }
      return updated;
    });
    markNeonNotificationAsRead(id).catch(console.error);
  };

  const clearAllNotifications = () => {
    const readNotifSet = getReadNotifIds();
    notifications.forEach((n) => readNotifSet.add(n.id));
    saveReadNotifIds(readNotifSet);

    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('VOOMNET_NOTIFICATIONS');
    }
    clearNeonNotifications(user?.matricule).catch(console.error);
  };

  const markPrimeNotificationsAsRead = () => {
    const readNotifSet = getReadNotifIds();
    setNotifications((prev) => {
      let changed = false;
      const updated = prev.map((n) => {
        if (
          (n.title && n.title.toLowerCase().includes('prime')) ||
          (n.message && n.message.toLowerCase().includes('prime')) ||
          n.type === 'ALERT'
        ) {
          changed = true;
          readNotifSet.add(n.id);
          return { ...n, read: true };
        }
        return n;
      });
      if (changed) {
        saveReadNotifIds(readNotifSet);
      }
      return updated;
    });
  };

  const getReadChatKeys = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('VOOMNET_READ_CHAT_KEYS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {}
    return new Set();
  };

  const saveReadChatKeys = (keysSet: Set<string>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('VOOMNET_READ_CHAT_KEYS', JSON.stringify(Array.from(keysSet)));
    } catch (e) {}
  };

  const markChatMessagesAsRead = (matricule: string, senderMatricule?: string) => {
    const readSet = getReadChatKeys();
    const readNotifSet = getReadNotifIds();
    const isSuper = user && isSuperAdminRole(user.role);

    setChatMessages((prev) =>
      prev.map((m) => {
        const matchesRecipient =
          m.recipientMatricule === matricule ||
          (isSuper && (m.recipientMatricule === '9999' || m.recipientMatricule === '1000'));
        const matchesSender = !senderMatricule || m.senderMatricule === senderMatricule;
        if (matchesRecipient && matchesSender) {
          const key = m.id || `${m.senderMatricule}-${m.recipientMatricule}-${m.text ? m.text.trim() : ''}-${m.timestamp}`;
          readSet.add(key);
          if (m.id) readSet.add(m.id);
          return { ...m, status: 'lu' as const };
        }
        return m;
      })
    );

    saveReadChatKeys(readSet);

    // Also mark corresponding CHAT notifications as read
    setNotifications((prev) => {
      let changed = false;
      const updated = prev.map((n) => {
        const matchesRecipient =
          n.recipientMatricule === matricule ||
          (isSuper && (n.recipientMatricule === '9999' || n.recipientMatricule === '1000'));
        if (!n.read && matchesRecipient && (n.type === 'CHAT' || (n.title && n.title.includes('Message')))) {
          changed = true;
          readNotifSet.add(n.id);
          return { ...n, read: true };
        }
        return n;
      });
      if (changed) {
        saveReadNotifIds(readNotifSet);
        if (typeof window !== 'undefined') {
          localStorage.setItem('VOOMNET_NOTIFICATIONS', JSON.stringify(updated));
        }
      }
      return updated;
    });

    // Sync read status to Neon DB
    markNeonNotificationAsRead(undefined, matricule).catch(console.error);
    if (isSuper) {
      markNeonNotificationAsRead(undefined, '9999').catch(console.error);
      markNeonNotificationAsRead(undefined, '1000').catch(console.error);
    }
  };

  const login = async (
    identifier: string,
    passwordInput?: string,
    isQuickLogin?: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    const rawTrimmed = (identifier || '').trim();
    const trimmed = rawTrimmed.toLowerCase();
    if (!trimmed) {
      return { success: false, message: 'Veuillez saisir votre numéro de matricule (Poste 3CX), adresse email ou nom.' };
    }

    const passTrimmed = (passwordInput || '').trim();
    if (!passTrimmed && !isQuickLogin) {
      return {
        success: false,
        message: 'Veuillez saisir votre mot de passe pour vous connecter.',
      };
    }

    // Ultra-flexible & accent-insensitive matcher (matricule, email, phone, prenom, nom, full name, reversed full name, tokens)
    const matchesEmp = (e: Employee) => {
      if (!e) return false;
      const m = String(e.matricule || '').trim();
      const em = String(e.email || '').trim();
      const fn = String(e.prenom || '').trim();
      const ln = String(e.nom || '').trim();
      const fullName = `${fn} ${ln}`.trim();
      const reverseFullName = `${ln} ${fn}`.trim();
      const phone = String(e.telephone3CX || '').trim();

      const normalizeStr = (str: string) =>
        str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim();

      const normTrimmed = normalizeStr(trimmed);
      const normM = normalizeStr(m);
      const normEm = normalizeStr(em);
      const normFn = normalizeStr(fn);
      const normLn = normalizeStr(ln);
      const normFull = normalizeStr(fullName);
      const normReverse = normalizeStr(reverseFullName);
      const normPhone = normalizeStr(phone);

      if (
        normM === normTrimmed ||
        normEm === normTrimmed ||
        normPhone === normTrimmed ||
        normEm.includes(normTrimmed) ||
        normFull === normTrimmed ||
        normReverse === normTrimmed ||
        normFn === normTrimmed ||
        normLn === normTrimmed
      ) {
        return true;
      }

      // Check if all user-typed tokens appear anywhere in employee info
      const tokens = normTrimmed.split(/\s+/).filter(Boolean);
      if (tokens.length > 0) {
        const fullSearchable = `${normM} ${normEm} ${normFn} ${normLn} ${normFull} ${normReverse} ${normPhone}`;
        const allTokensMatch = tokens.every((token) => fullSearchable.includes(token));
        if (allTokensMatch) return true;
      }

      return false;
    };

    // Merge all candidate sources: live Neon DB, React state, localStorage cache, initial mock data
    const candidateList: Employee[] = [];
    const seenMatricules = new Set<string>();

    const addCandidates = (list: Employee[]) => {
      if (Array.isArray(list)) {
        list.forEach((e) => {
          if (e && e.matricule && !seenMatricules.has(String(e.matricule).trim())) {
            seenMatricules.add(String(e.matricule).trim());
            candidateList.push(e);
          }
        });
      }
    };

    try {
      const liveEmps = await fetchNeonEmployees();
      if (liveEmps && Array.isArray(liveEmps) && liveEmps.length > 0) {
        addCandidates(liveEmps);
        setEmployees((prev) => {
          const map = new Map<string, Employee>();
          liveEmps.forEach((e) => {
            if (e && e.matricule) map.set(e.matricule, e);
          });
          (prev || []).forEach((e) => {
            if (e && e.matricule && !map.has(e.matricule)) {
              map.set(e.matricule, e);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn('Live fetch on login failed:', err);
    }

    // Add React state employees
    addCandidates(employees);

    // Add localStorage extra employees fallback if any
    if (typeof window !== 'undefined') {
      try {
        const extraSaved = localStorage.getItem('VOOMNET_EXTRA_EMPLOYEES');
        if (extraSaved) {
          const parsed = JSON.parse(extraSaved);
          addCandidates(parsed);
        }
      } catch (e) {}
    }

    // Add Initial mock employees fallback
    addCandidates(INITIAL_EMPLOYEES);

    const found = candidateList.find(matchesEmp);

    if (!found) {
      return {
        success: false,
        message: `Identifiant "${rawTrimmed}" introuvable. Vérifiez votre matricule 3CX ou votre adresse email. Assurez-vous que l'administrateur a bien créé votre compte.`,
      };
    }

    // Verification against stored password in database/state
    const validPassword = String(found.motDePasse || 'voomnet2026').trim();

    if (!isQuickLogin) {
      if (passTrimmed !== validPassword) {
        return {
          success: false,
          message: `Mot de passe incorrect pour ${found.prenom} ${found.nom} (Matricule ${found.matricule}).`,
        };
      }
    }

    const normalizedFound = {
      ...found,
      role: normalizeRole(found.role),
    };

    setUser(normalizedFound);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('VOOMNET_USER_SESSION', JSON.stringify(normalizedFound));
      } catch (e) {
        // Ignore quota limits
      }
    }

    if (isEmployeRole(normalizedFound.role)) {
      setActiveTab('monposte');
    } else {
      setActiveTab('dashboard');
    }

    // Check if there are unread notifications specifically for this employee
    setTimeout(() => {
      setNotifications((currentNotifs) => {
        const unreadForEmp = currentNotifs.find(
          (n) => !n.read && n.recipientMatricule && n.recipientMatricule === found?.matricule
        );
        if (unreadForEmp) {
          setActiveToast(unreadForEmp);
          playNotificationSound();
        } else {
          showNotificationAlert(
            `👋 Bienvenue ${found?.prenom} ${found?.nom}`,
            `Connexion réussie sous le rôle ${found?.role} (${found?.statut}).`,
            'SUCCESS',
            found?.matricule
          );
        }
        return currentNotifs;
      });
    }, 500);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('VOOMNET_USER_SESSION');
      } catch (e) {
        // Ignore
      }
    }
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

  const addEmployee = async (empData: Omit<Employee, 'id'>): Promise<boolean> => {
    const newEmp: Employee = {
      ...empData,
      id: `emp-${Date.now()}`,
      avatar: empData.avatar || DEFAULT_FALLBACK_AVATAR,
      dateEmbauche: formatDateYYYYMMDD(empData.dateEmbauche),
    };

    saveEditedEmployeeLocally(newEmp);

    setEmployees((prev) => {
      const updated = [newEmp, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('VOOMNET_EXTRA_EMPLOYEES', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    const newPrime: EmployeePrimeStatus = {
      matricule: newEmp.matricule,
      nomPrenom: `${newEmp.prenom} ${newEmp.nom}`,
      dateEmbauche: newEmp.dateEmbauche,
      statutCollaborateur: newEmp.statut,
      roleCollaborateur: newEmp.role,
      periodeNom: primeConfig.periodeNom,
      eligible: false,
      montantCalcule: primeConfig.montantReference,
      statut: 'En attente',
      montant: primeConfig.montantReference,
      motif: 'Nouveau collaborateur — Dossier en cours d\'étude RH',
      motifStatus: 'EN ATTENTE — Nouveau collaborateur',
    };
    setPrimes((prev) => [...prev, newPrime]);

    // Save directly to Neon PostgreSQL database
    try {
      const res = await insertNeonEmployee(newEmp);
      if (res && res.email) {
        newEmp.email = res.email;
        saveEditedEmployeeLocally(newEmp);
      }
      // Save initial prime attribution to Neon DB as well
      await insertNeonPrimeAttribution({
        matricule: newEmp.matricule,
        nomPrenom: `${newEmp.prenom} ${newEmp.nom}`,
        periodeNom: primeConfig.periodeNom,
        statut: 'En attente',
        montant: primeConfig.montantReference,
        motif: 'Nouveau collaborateur — Dossier en cours d\'étude RH',
        approvedBy: user ? `${user.prenom} ${user.nom} (${user.role})` : 'Administration RH',
      });
    } catch (err) {
      console.error('Neon DB Employee insert error:', err);
    }

    showNotificationAlert(
      '👤 Utilisateur Créé & Enregistré',
      `Le compte de ${newEmp.prenom} ${newEmp.nom} (Matricule ${newEmp.matricule}) a été créé avec succès.`,
      'SUCCESS'
    );
    return true;
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    let empName = '';
    let updatedObj: Employee | null = null;
    const cleanEmpData = { ...empData };
    if (cleanEmpData.dateEmbauche) {
      cleanEmpData.dateEmbauche = formatDateYYYYMMDD(cleanEmpData.dateEmbauche);
    }

    setEmployees((prev) => {
      const updatedList = prev.map((emp) => {
        if (emp.id === id || emp.matricule === id) {
          empName = `${cleanEmpData.prenom || emp.prenom} ${cleanEmpData.nom || emp.nom}`;
          const updated = { ...emp, ...cleanEmpData };
          updatedObj = updated;

          saveEditedEmployeeLocally(updated);

          if (user && (user.id === id || user.matricule === id)) {
            setUser(updated);
            if (typeof window !== 'undefined') {
              try {
                sessionStorage.setItem('VOOMNET_USER_SESSION', JSON.stringify(updated));
              } catch (e) {}
            }
          }
          return updated;
        }
        return emp;
      });

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('VOOMNET_EXTRA_EMPLOYEES', JSON.stringify(updatedList));
        } catch (e) {}
      }

      return updatedList;
    });

    if (updatedObj) {
      // Sync update to Neon DB directly
      insertNeonEmployee(updatedObj).catch((err) => {
        console.warn('Neon DB update error:', err);
      });
    }

    if (empData.statut || empData.role || empData.nom || empData.prenom || empData.dateEmbauche) {
      setPrimes((prev) =>
        prev.map((p) => {
          if (p.matricule === id || (updatedObj && p.matricule === (updatedObj as Employee).matricule)) {
            return {
              ...p,
              nomPrenom: cleanEmpData.prenom && cleanEmpData.nom ? `${cleanEmpData.prenom} ${cleanEmpData.nom}` : p.nomPrenom,
              dateEmbauche: cleanEmpData.dateEmbauche || p.dateEmbauche,
              statutCollaborateur: cleanEmpData.statut || p.statutCollaborateur,
              roleCollaborateur: cleanEmpData.role || p.roleCollaborateur,
            };
          }
          return p;
        })
      );
    }

    showNotificationAlert(
      '✏️ Profil Modifié & Enregistré',
      `Informations de ${empName} mises à jour avec succès.`,
      'INFO'
    );
  };

  const deleteEmployee = (id: string) => {
    const target = employees.find((e) => e.id === id || e.matricule === id);
    if (!target) return;

    saveDeletedMatriculeLocally(target.matricule);

    setEmployees((prev) => {
      const updated = prev.filter((e) => e.id !== id && e.matricule !== target.matricule);
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('VOOMNET_EXTRA_EMPLOYEES', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });

    setPrimes((prev) => prev.filter((p) => p.matricule !== target.matricule));

    // Delete directly from Neon PostgreSQL
    deleteNeonEmployee(target.matricule).catch(console.error);

    showNotificationAlert(
      '🗑️ Suppression Utilisateur',
      `Le compte de ${target.prenom} ${target.nom} a été supprimé.`,
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
    playNotificationSound('chat');

    showNotificationAlert(
      `💬 Message de ${user.prenom} ${user.nom}`,
      `${text.length > 70 ? text.substring(0, 70) + '...' : text}`,
      'CHAT',
      recipientMatricule
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
      statut === 'Approuvé' ? `🎉 Demande ${reqCode} Validée !` : `❌ Demande ${reqCode} Refusée`,
      `Notification transmise à l'employé ${reqName} (Poste 3CX ${reqMatricule}) : Votre demande de permission ${reqCode} a été ${statut.toLowerCase()} par l'Admin. Remarque RH : "${notes || 'Aucune'}"`,
      statut === 'Approuvé' ? 'SUCCESS' : 'ALERT',
      reqMatricule
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

  const attributePrime = (
    matricule: string,
    statut: 'Accordée' | 'Refusée' | 'En attente',
    motif: string,
    customMontant?: number
  ) => {
    const cleanMatricule = String(matricule).trim();
    const isAccordee = statut === 'Accordée';
    const defaultVal = isAccordee ? primeConfig.montantReference : 0;
    const montantVal =
      customMontant !== undefined && customMontant !== null && !isNaN(customMontant)
        ? customMontant
        : defaultVal;

    const targetEmp = employees.find((e) => String(e.matricule).trim() === cleanMatricule);
    const empName = targetEmp ? `${targetEmp.prenom} ${targetEmp.nom}` : 'Employé';

    setPrimes((prev) => {
      let found = false;
      const updated = prev.map((p) => {
        if (String(p.matricule).trim() === cleanMatricule) {
          found = true;
          return {
            ...p,
            eligible: isAccordee,
            montantCalcule: montantVal,
            statut: statut,
            montant: montantVal,
            motif: motif,
            motifStatus: `${statut.toUpperCase()} — ${motif}`,
            dateAnnulation: isAccordee ? undefined : new Date().toLocaleString('fr-FR'),
          };
        }
        return p;
      });

      if (!found && targetEmp) {
        updated.push({
          matricule: cleanMatricule,
          nomPrenom: empName,
          dateEmbauche: targetEmp.dateEmbauche,
          statutCollaborateur: targetEmp.statut,
          roleCollaborateur: targetEmp.role,
          periodeNom: primeConfig.periodeNom,
          eligible: isAccordee,
          montantCalcule: montantVal,
          statut: statut,
          montant: montantVal,
          motif: motif,
          motifStatus: `${statut.toUpperCase()} — ${motif}`,
        });
      }

      return updated;
    });

    // Save directly into Neon PostgreSQL database
    insertNeonPrimeAttribution({
      matricule: cleanMatricule,
      nomPrenom: empName,
      periodeNom: primeConfig.periodeNom,
      statut,
      montant: montantVal,
      motif,
      approvedBy: user ? `${user.prenom} ${user.nom} (${user.role})` : 'Administration RH',
    }).catch(console.error);

    // Audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('fr-FR'),
      type: isAccordee ? 'PRIME_RESTORE' : 'PRIME_CANCEL',
      message: `Prime trimestrielle ${statut === 'En attente' ? 'mise en attente' : statut.toLowerCase()} pour ${empName} (Matricule ${cleanMatricule}) avec montant alloué ${montantVal.toLocaleString('fr-FR')} FCFA. Motif : "${motif}".`,
      auteur: user ? `${user.prenom} ${user.nom}` : 'Administration RH',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    const notifTitle =
      statut === 'Accordée'
        ? '🎉 Prime Accordée'
        : statut === 'Refusée'
        ? '❌ Prime Refusée'
        : '⏳ Prime Mise en Attente';

    const notifType = statut === 'Accordée' ? 'SUCCESS' : statut === 'Refusée' ? 'ALERT' : 'WARNING';

    showNotificationAlert(
      notifTitle,
      `Notification envoyée à l'employé ${empName} (Poste 3CX ${cleanMatricule}) : Votre prime trimestrielle est ${
        statut === 'En attente' ? 'mise en attente d\'étude' : `désormais ${statut.toLowerCase()}`
      } (${montantVal.toLocaleString('fr-FR')} FCFA). Remarque : "${motif}".`,
      notifType,
      cleanMatricule
    );
  };

  const primeAttributions = (() => {
    const maskedMap = getMaskedPrimesMap();
    const primesByMatricule = new Map<string, any>();

    (primes || []).forEach((p) => {
      if (p && p.matricule) {
        primesByMatricule.set(String(p.matricule).trim(), p);
      }
    });

    // Ensure EVERY employee in employees list has an entry
    (employees || []).forEach((emp) => {
      if (emp && emp.matricule) {
        const mKey = String(emp.matricule).trim();
        if (!primesByMatricule.has(mKey)) {
          primesByMatricule.set(mKey, {
            matricule: mKey,
            nomPrenom: `${emp.prenom} ${emp.nom}`,
            dateEmbauche: emp.dateEmbauche,
            statutCollaborateur: emp.statut,
            roleCollaborateur: emp.role,
            periodeNom: primeConfig.periodeNom,
            eligible: false,
            montantCalcule: primeConfig.montantReference,
            statut: 'En attente',
            montant: primeConfig.montantReference,
            motif: 'Dossier de prime en cours d\'évaluation RH',
            masquee: Boolean(maskedMap.get(mKey)),
          });
        }
      }
    });

    return Array.from(primesByMatricule.values()).map((p) => {
      const cleanM = String(p.matricule || '').trim();
      const isMaskedVal = maskedMap.has(cleanM) ? Boolean(maskedMap.get(cleanM)) : Boolean(p.masquee);

      let resolvedStatut: 'Accordée' | 'Refusée' | 'En attente' = 'En attente';
      if (p.statut) {
        resolvedStatut = p.statut;
      } else if (p.eligible) {
        resolvedStatut = 'Accordée';
      } else if (
        p.motifStatus &&
        (p.motifStatus.includes('REFUSÉE') ||
          p.motifStatus.includes('REFUSÉ') ||
          p.motifStatus.includes('ANNULÉE') ||
          p.motifStatus.includes('ANNULÉ'))
      ) {
        resolvedStatut = 'Refusée';
      }

      const resolvedMontant =
        typeof p.montant === 'number' && !isNaN(p.montant)
          ? p.montant
          : typeof p.montantCalcule === 'number' && !isNaN(p.montantCalcule)
          ? p.montantCalcule
          : resolvedStatut === 'Accordée'
          ? primeConfig.montantReference
          : 0;

      return {
        ...p,
        statut: resolvedStatut,
        montant: resolvedMontant,
        motif: p.motif || (p.motifStatus ? p.motifStatus.replace(/^(ACCORDÉE|REFUSÉE|ANNULÉE)\s*—\s*/i, '') : ''),
        masquee: isMaskedVal,
      };
    });
  })();

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
        primeAttributions,
        attributePrime,
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
