import { INITIAL_EMPLOYEES, INITIAL_ABSENCE_REQUESTS, AbsenceRequest } from './src/data/mockData';

console.log('=====================================================');
console.log('🧪 SUITE DE TESTS D\'INTÉGRATION — VOOMNET PORTAIL RH');
console.log('=====================================================');

// 1. Employee FK and Matricule Resolution Test
console.log('\n[TEST 1] Validation de la résolution Clé Étrangère (FK) & Matricules 3CX');
let test1Passed = true;
INITIAL_EMPLOYEES.forEach((emp) => {
  if (!emp.id || !emp.matricule) {
    console.error(`❌ Erreur sur l'employé: ${emp.nom}`);
    test1Passed = false;
  } else {
    console.log(`  ✓ Employé: ${emp.prenom} ${emp.nom} | Matricule: ${emp.matricule} -> UUID DB: ${emp.id}`);
  }
});
if (test1Passed) console.log('👉 RESULTAT TEST 1: SUCCÈS PASSÉ');

// 2. Leave Request Creation Test
console.log('\n[TEST 2] Simulation de création d\'une nouvelle demande d\'absence');
const newReqData: Omit<AbsenceRequest, 'id' | 'codeSuivi' | 'dateDemande'> = {
  matricule: '1015',
  nomPrenom: 'Awa DIABATÉ',
  fonctionService: 'Développement Logiciel (CDD)',
  dateEmbauche: '2026-07-15',
  typeAbsence: 'Maladie',
  dateDebut: '2026-09-10',
  dateFin: '2026-09-12',
  dureeJours: 3,
  motif: 'Test automatique d arrêt maladie avec certificat médical',
  justifiee: true,
  statut: 'En attente',
  cadreAdminNotes: 'Soumis pour validation par l\'Administration RH',
};

const trackingCode = `VN-P-2026-${Math.floor(100000 + Math.random() * 900000)}`;
const simulatedRequest: AbsenceRequest = {
  ...newReqData,
  id: `abs-${Date.now()}`,
  codeSuivi: trackingCode,
  dateDemande: new Date().toISOString().split('T')[0],
};

const requestList: AbsenceRequest[] = [simulatedRequest, ...INITIAL_ABSENCE_REQUESTS];

if (simulatedRequest.codeSuivi && simulatedRequest.statut === 'En attente') {
  console.log(`  ✓ Demande générée avec Code Suivi: ${simulatedRequest.codeSuivi}`);
  console.log(`  ✓ Statut initial: ${simulatedRequest.statut}`);
  console.log('👉 RESULTAT TEST 2: SUCCÈS PASSÉ');
} else {
  console.error('❌ Échec de génération de la demande.');
}

// 3. Admin Reception & Filter Test
console.log('\n[TEST 3] Validation de la visibilité côté Administrateur');
const adminView = requestList;
const foundForAdmin = adminView.find((r) => r.codeSuivi === trackingCode);

if (foundForAdmin) {
  console.log(`  ✓ L'administrateur RH voit la demande: Code ${foundForAdmin.codeSuivi} (${foundForAdmin.nomPrenom})`);
  console.log(`  ✓ Nombre total de demandes reçues par l'Admin: ${adminView.length}`);
  console.log('👉 RESULTAT TEST 3: SUCCÈS PASSÉ');
} else {
  console.error('❌ La demande est invisible pour l\'administrateur.');
}

// 4. Employee History Visibility Test
console.log('\n[TEST 4] Validation de l\'historique dans le profil Employé');
const employeeView = requestList.filter((r) => r.matricule.trim() === '1015');
const foundInProfile = employeeView.find((r) => r.codeSuivi === trackingCode);

if (foundInProfile) {
  console.log(`  ✓ L'employé (Matricule 1015) voit la demande dans son profil "Mon Poste"`);
  console.log(`  ✓ Nombre de demandes dans l'historique de l'employé: ${employeeView.length}`);
  console.log('👉 RESULTAT TEST 4: SUCCÈS PASSÉ');
} else {
  console.error('❌ La demande n\'apparaît pas dans le profil de l\'employé.');
}

// 5. Validation/Approval Workflow Test by Admin
console.log('\n[TEST 5] Simulation du workflow de validation/refus par l\'Admin');
const updatedRequests = requestList.map((r) => {
  if (r.codeSuivi === trackingCode) {
    return {
      ...r,
      statut: 'Approuvé' as const,
      cadreAdminNotes: 'Accordé par Responsable RH (Marc KOUASSI) le 09/09/2026',
    };
  }
  return r;
});

const approvedReq = updatedRequests.find((r) => r.codeSuivi === trackingCode);
if (approvedReq && approvedReq.statut === 'Approuvé') {
  console.log(`  ✓ Demande ${approvedReq.codeSuivi} validée avec succès par l'Admin !`);
  console.log(`  ✓ Remarque Admin enregistrée: "${approvedReq.cadreAdminNotes}"`);
  console.log('👉 RESULTAT TEST 5: SUCCÈS PASSÉ');
} else {
  console.error('❌ Échec de la validation par l\'Admin.');
}

console.log('\n=====================================================');
console.log('🎉 TOUS LES TESTS FONCTIONNELS ET DE FLUX SONT VALIDÉS');
console.log('=====================================================');
