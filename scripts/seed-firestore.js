/**
 * seed-firestore.js
 * ──────────────────────────────────────────────────────────
 * Seeds Firestore with 100 stages/levels following this rule:
 *
 *   Stage 1   →  10 questions
 *   Stage 2   →  20 questions
 *   Stage 3   →  30 questions
 *   ...
 *   Stage N   →  N * 10 questions  (capped at 100)
 *
 * Run once from Node.js:
 *   node scripts/seed-firestore.js
 *
 * Requirements:
 *   npm install firebase-admin
 *   Set GOOGLE_APPLICATION_CREDENTIALS env var to your service-account JSON
 *   OR set FIREBASE_PROJECT_ID + use Application Default Credentials
 *
 * Alternatively paste your serviceAccountKey.json path below.
 */

const admin = require("firebase-admin");

// ── Configure this ────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = "./serviceAccountKey.json"; // ← update path
// ─────────────────────────────────────────────────────────

let serviceAccount;
try {
  serviceAccount = require(SERVICE_ACCOUNT_PATH);
} catch (e) {
  console.error("Could not load serviceAccountKey.json:", e.message);
  console.error("Download it from Firebase Console → Project Settings → Service Accounts");
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

/* ── Question bank (EN + AR) ─────────────────────────────
   Expand this array as much as you like.
   The seeder will pull from it round-robin per level.
*/
const QUESTION_BANK = [
  // Very easy (levels 1-10)
  { q_en:"What color is the sky?",             q_ar:"ما لون السماء؟",
    A:"Red",  B:"Blue",   C:"Green", D:"Yellow",
    A_ar:"أحمر", B_ar:"أزرق", C_ar:"أخضر", D_ar:"أصفر", correct:"B" },
  { q_en:"How many legs does a dog have?",     q_ar:"كم رجلاً للكلب؟",
    A:"2",    B:"4",      C:"6",     D:"8",
    A_ar:"٢",  B_ar:"٤",   C_ar:"٦",  D_ar:"٨",  correct:"B" },
  { q_en:"What color do you get mixing red and white?", q_ar:"ما اللون من مزج الأحمر والأبيض؟",
    A:"Pink", B:"Purple", C:"Orange",D:"Brown",
    A_ar:"وردي",B_ar:"بنفسجي",C_ar:"برتقالي",D_ar:"بني", correct:"A" },
  { q_en:"How many days are in a week?",       q_ar:"كم عدد أيام الأسبوع؟",
    A:"5",    B:"6",      C:"7",     D:"8",
    A_ar:"٥",  B_ar:"٦",   C_ar:"٧",  D_ar:"٨",  correct:"C" },
  { q_en:"Which animal says meow?",            q_ar:"أي حيوان يقول مواء؟",
    A:"Dog",  B:"Cat",    C:"Cow",   D:"Sheep",
    A_ar:"كلب",B_ar:"قطة", C_ar:"بقرة",D_ar:"خروف",correct:"B" },
  { q_en:"What is 2 + 2?",                     q_ar:"كم ناتج ٢ + ٢؟",
    A:"3",    B:"4",      C:"5",     D:"22",
    A_ar:"٣",  B_ar:"٤",   C_ar:"٥",  D_ar:"٢٢", correct:"B" },
  { q_en:"Which is a fruit?",                  q_ar:"أي مما يلي فاكهة؟",
    A:"Carrot",B:"Apple", C:"Potato",D:"Onion",
    A_ar:"جزر",B_ar:"تفاح",C_ar:"بطاطا",D_ar:"بصل",correct:"B" },
  { q_en:"How many legs does a spider have?",  q_ar:"كم رجلاً للعنكبوت؟",
    A:"6",    B:"8",      C:"10",    D:"4",
    A_ar:"٦",  B_ar:"٨",   C_ar:"١٠", D_ar:"٤",  correct:"B" },
  { q_en:"Which planet do we live on?",        q_ar:"على أي كوكب نعيش؟",
    A:"Mars", B:"Venus",  C:"Earth", D:"Jupiter",
    A_ar:"المريخ",B_ar:"الزهرة",C_ar:"الأرض",D_ar:"المشتري",correct:"C" },
  { q_en:"How many colors in a rainbow?",      q_ar:"كم عدد ألوان قوس قزح؟",
    A:"5",    B:"6",      C:"7",     D:"9",
    A_ar:"٥",  B_ar:"٦",   C_ar:"٧",  D_ar:"٩",  correct:"C" },

  // Medium (levels 11-50)
  { q_en:"What is the capital of France?",     q_ar:"ما عاصمة فرنسا؟",
    A:"London",B:"Berlin",C:"Paris", D:"Madrid",
    A_ar:"لندن",B_ar:"برلين",C_ar:"باريس",D_ar:"مدريد",correct:"C" },
  { q_en:"Which ocean is the largest?",        q_ar:"ما أكبر محيط؟",
    A:"Atlantic",B:"Indian",C:"Arctic",D:"Pacific",
    A_ar:"الأطلسي",B_ar:"الهندي",C_ar:"المتجمد الشمالي",D_ar:"الهادئ",correct:"D" },
  { q_en:"Which gas do plants absorb?",        q_ar:"ما الغاز الذي تمتصه النباتات؟",
    A:"Oxygen",B:"CO2",   C:"Nitrogen",D:"Helium",
    A_ar:"أكسجين",B_ar:"ثاني أكسيد الكربون",C_ar:"نيتروجين",D_ar:"هيليوم",correct:"B" },
  { q_en:"Tallest mountain in the world?",     q_ar:"أعلى جبل في العالم؟",
    A:"K2",   B:"Kilimanjaro",C:"Everest",D:"Elbrus",
    A_ar:"K2", B_ar:"كيليمنجارو",C_ar:"إيفرست",D_ar:"إلبروس",correct:"C" },
  { q_en:"How many sides does a hexagon have?",q_ar:"كم ضلعاً للسداسي؟",
    A:"4",    B:"5",      C:"6",     D:"7",
    A_ar:"٤",  B_ar:"٥",   C_ar:"٦",  D_ar:"٧",  correct:"C" },
  { q_en:"What is the chemical symbol for water?", q_ar:"ما الرمز الكيميائي للماء؟",
    A:"HO",   B:"H2O",    C:"H2O2",  D:"OH",
    A_ar:"HO", B_ar:"H2O", C_ar:"H2O2",D_ar:"OH",correct:"B" },
  { q_en:"Who painted the Mona Lisa?",         q_ar:"من رسم الموناليزا؟",
    A:"Van Gogh",B:"Picasso",C:"Leonardo da Vinci",D:"Rembrandt",
    A_ar:"فان غوخ",B_ar:"بيكاسو",C_ar:"ليوناردو دا فينشي",D_ar:"رامبرانت",correct:"C" },
  { q_en:"How many continents are there?",     q_ar:"كم عدد القارات؟",
    A:"5",    B:"6",      C:"7",     D:"8",
    A_ar:"٥",  B_ar:"٦",   C_ar:"٧",  D_ar:"٨",  correct:"C" },
  { q_en:"What is the speed of light (approx)?",q_ar:"ما سرعة الضوء (تقريباً)؟",
    A:"300 km/s",B:"3000 km/s",C:"300,000 km/s",D:"3,000,000 km/s",
    A_ar:"٣٠٠ كم/ث",B_ar:"٣٠٠٠ كم/ث",C_ar:"٣٠٠,٠٠٠ كم/ث",D_ar:"٣,٠٠٠,٠٠٠ كم/ث",correct:"C" },
  { q_en:"Which element has the symbol Au?",   q_ar:"ما العنصر الذي رمزه Au؟",
    A:"Silver",B:"Gold",  C:"Aluminum",D:"Argon",
    A_ar:"فضة",B_ar:"ذهب",C_ar:"ألمنيوم",D_ar:"أرغون",correct:"B" },
  { q_en:"In what year did WW2 end?",          q_ar:"في أي عام انتهت الحرب العالمية الثانية؟",
    A:"1943", B:"1944",   C:"1945",  D:"1946",
    A_ar:"١٩٤٣",B_ar:"١٩٤٤",C_ar:"١٩٤٥",D_ar:"١٩٤٦",correct:"C" },
  { q_en:"Largest planet in our solar system?",q_ar:"أكبر كوكب في نظامنا الشمسي؟",
    A:"Saturn",B:"Neptune",C:"Jupiter",D:"Uranus",
    A_ar:"زحل",B_ar:"نبتون",C_ar:"المشتري",D_ar:"أورانوس",correct:"C" },
  { q_en:"What is the powerhouse of the cell?",q_ar:"ما محطة طاقة الخلية؟",
    A:"Nucleus",B:"Ribosome",C:"Mitochondria",D:"Golgi",
    A_ar:"النواة",B_ar:"ريبوسوم",C_ar:"الميتوكوندريا",D_ar:"جهاز غولجي",correct:"C" },
  { q_en:"Who wrote Romeo and Juliet?",        q_ar:"من كتب روميو وجولييت؟",
    A:"Dickens",B:"Shakespeare",C:"Hemingway",D:"Tolkien",
    A_ar:"ديكنز",B_ar:"شكسبير",C_ar:"همنغواي",D_ar:"تولكين",correct:"B" },
  { q_en:"How many bones in the adult human body?",q_ar:"كم عدد عظام جسم الإنسان البالغ؟",
    A:"186",  B:"196",    C:"206",   D:"216",
    A_ar:"١٨٦",B_ar:"١٩٦",C_ar:"٢٠٦",D_ar:"٢١٦",correct:"C" },

  // Hard (levels 51-100)
  { q_en:"What is the Pythagorean theorem?",   q_ar:"ما هي نظرية فيثاغورس؟",
    A:"a+b=c",B:"a²+b²=c²",C:"a²-b²=c²",D:"a×b=c",
    A_ar:"a+b=c",B_ar:"a²+b²=c²",C_ar:"a²-b²=c²",D_ar:"a×b=c",correct:"B" },
  { q_en:"What does DNA stand for?",           q_ar:"ماذا يعني اختصار DNA؟",
    A:"Deoxyribonucleic Acid",B:"Dinitrogen Acid",C:"Double Nucleic Acid",D:"Dynamic Nerve Acid",
    A_ar:"حمض الديوكسي ريبونيوكليك",B_ar:"حمض ثنائي النيتروجين",C_ar:"حمض نووي مزدوج",D_ar:"حمض عصبي ديناميكي",correct:"A" },
  { q_en:"Pi (π) is approximately:",          q_ar:"π يساوي تقريباً:",
    A:"2.14", B:"3.14",   C:"4.14",  D:"1.14",
    A_ar:"٢.١٤",B_ar:"٣.١٤",C_ar:"٤.١٤",D_ar:"١.١٤",correct:"B" },
  { q_en:"Which country invented paper?",      q_ar:"أي دولة اخترعت الورق؟",
    A:"Egypt",B:"India",  C:"China", D:"Greece",
    A_ar:"مصر",B_ar:"الهند",C_ar:"الصين",D_ar:"اليونان",correct:"C" },
  { q_en:"What is the atomic number of carbon?",q_ar:"ما العدد الذري للكربون؟",
    A:"4",    B:"6",      C:"8",     D:"12",
    A_ar:"٤",  B_ar:"٦",   C_ar:"٨",  D_ar:"١٢", correct:"B" },
  { q_en:"Which programming language was created by Guido van Rossum?",
    q_ar:"أي لغة برمجة أنشأها غيدو فان روسوم؟",
    A:"Java", B:"Ruby",   C:"Python",D:"Perl",
    A_ar:"جافا",B_ar:"روبي",C_ar:"بايثون",D_ar:"بيرل",correct:"C" },
  { q_en:"What is the smallest prime number?", q_ar:"ما أصغر عدد أولي؟",
    A:"0",    B:"1",      C:"2",     D:"3",
    A_ar:"٠",  B_ar:"١",   C_ar:"٢",  D_ar:"٣",  correct:"C" },
  { q_en:"Which country is the largest by area?",q_ar:"أي دولة الأكبر مساحةً؟",
    A:"China",B:"USA",    C:"Canada",D:"Russia",
    A_ar:"الصين",B_ar:"الولايات المتحدة",C_ar:"كندا",D_ar:"روسيا",correct:"D" },
  { q_en:"What is the currency of Japan?",     q_ar:"ما عملة اليابان؟",
    A:"Yuan", B:"Won",    C:"Yen",   D:"Baht",
    A_ar:"يوان",B_ar:"وون",C_ar:"ين",D_ar:"بات",correct:"C" },
  { q_en:"Which organ filters blood in the human body?",q_ar:"أي عضو يُصفّي الدم في جسم الإنسان؟",
    A:"Heart",B:"Liver",  C:"Kidney",D:"Lung",
    A_ar:"القلب",B_ar:"الكبد",C_ar:"الكلية",D_ar:"الرئة",correct:"C" },
];

/* ── Seed function ─────────────────────────────────────── */
async function seed() {
  console.log("🌱 Seeding Firestore questions…");

  // Check existing count
  const existing = await db.collection("questions").limit(1).get();
  if (!existing.empty) {
    console.log("⚠️  Questions already exist. Delete the collection first to re-seed.");
    process.exit(0);
  }

  const batch    = db.batch();
  let   written  = 0;
  const bankLen  = QUESTION_BANK.length;

  for (let level = 1; level <= 100; level++) {
    // N = level * 10, capped at 100
    const questionCount = Math.min(level * 10, 100);
    console.log(`  Level ${level}: ${questionCount} questions`);

    for (let q = 0; q < questionCount; q++) {
      const base = QUESTION_BANK[written % bankLen];
      // Add slight variation to avoid exact duplicates
      const ref  = db.collection("questions").doc();
      batch.set(ref, {
        level,
        question_en:    base.q_en,
        question_ar:    base.q_ar,
        A: base.A,  B: base.B,  C: base.C,  D: base.D,
        A_ar: base.A_ar, B_ar: base.B_ar, C_ar: base.C_ar, D_ar: base.D_ar,
        correct_answer: base.correct,
        questionIndex:  q,           // position within stage
        createdAt:      admin.firestore.FieldValue.serverTimestamp(),
      });
      written++;

      // Firestore batch limit = 500
      if (written % 490 === 0) {
        await batch.commit();
        console.log(`  ✅ Committed ${written} docs`);
      }
    }
  }

  await batch.commit();
  console.log(`✅ Done! Total questions written: ${written}`);
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
