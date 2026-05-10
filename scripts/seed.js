/*
 * Seed data for Venom Quiz.
 * 100 levels, 1 question per level (general knowledge).
 * Each question has English + Arabic text and translated options.
 *
 * This file can be `require`d from main.js (exports a function) OR run directly
 * via `npm run seed` to (re)build database.db.
 */
"use strict";

const path = require("path");

const QUESTIONS = [
  // Level 1 — Very easy
  { q_en: "What color do you get by mixing red and white?", q_ar: "ما اللون الناتج من مزج الأحمر والأبيض؟",
    A: "Pink", B: "Purple", C: "Orange", D: "Brown",
    A_ar: "وردي", B_ar: "بنفسجي", C_ar: "برتقالي", D_ar: "بني", correct: "A", level: 1 },

  // Level 2
  { q_en: "How many days are in a week?", q_ar: "كم عدد أيام الأسبوع؟",
    A: "5", B: "6", C: "7", D: "8",
    A_ar: "٥", B_ar: "٦", C_ar: "٧", D_ar: "٨", correct: "C", level: 2 },

  // Level 3
  { q_en: "Which animal says 'meow'?", q_ar: "أي حيوان يقول 'مواء'؟",
    A: "Dog", B: "Cat", C: "Cow", D: "Sheep",
    A_ar: "كلب", B_ar: "قطة", C_ar: "بقرة", D_ar: "خروف", correct: "B", level: 3 },

  // Level 4
  { q_en: "What is 2 + 2?", q_ar: "كم ناتج ٢ + ٢؟",
    A: "3", B: "4", C: "5", D: "22",
    A_ar: "٣", B_ar: "٤", C_ar: "٥", D_ar: "٢٢", correct: "B", level: 4 },

  // Level 5
  { q_en: "Which is a fruit?", q_ar: "أي مما يلي فاكهة؟",
    A: "Carrot", B: "Apple", C: "Potato", D: "Onion",
    A_ar: "جزر", B_ar: "تفاح", C_ar: "بطاطا", D_ar: "بصل", correct: "B", level: 5 },

  // Level 6
  { q_en: "How many legs does a spider have?", q_ar: "كم رجلاً للعنكبوت؟",
    A: "6", B: "8", C: "10", D: "4",
    A_ar: "٦", B_ar: "٨", C_ar: "١٠", D_ar: "٤", correct: "B", level: 6 },

  // Level 7
  { q_en: "Which planet do we live on?", q_ar: "على أي كوكب نعيش؟",
    A: "Mars", B: "Venus", C: "Earth", D: "Jupiter",
    A_ar: "المريخ", B_ar: "الزهرة", C_ar: "الأرض", D_ar: "المشتري", correct: "C", level: 7 },

  // Level 8
  { q_en: "What is the opposite of 'hot'?", q_ar: "ما عكس كلمة 'حار'؟",
    A: "Cold", B: "Warm", C: "Wet", D: "Dark",
    A_ar: "بارد", B_ar: "دافئ", C_ar: "رطب", D_ar: "مظلم", correct: "A", level: 8 },

  // Level 9
  { q_en: "Which is the largest: elephant, mouse, cat, or dog?", q_ar: "أيهم الأكبر: الفيل، الفأر، القطة، أو الكلب؟",
    A: "Mouse", B: "Cat", C: "Dog", D: "Elephant",
    A_ar: "الفأر", B_ar: "القطة", C_ar: "الكلب", D_ar: "الفيل", correct: "D", level: 9 },

  // Level 10
  { q_en: "How many colors are in a rainbow?", q_ar: "كم عدد ألوان قوس قزح؟",
    A: "5", B: "6", C: "7", D: "9",
    A_ar: "٥", B_ar: "٦", C_ar: "٧", D_ar: "٩", correct: "C", level: 10 },

  // Level 11
  { q_en: "What is the capital of France?", q_ar: "ما هي عاصمة فرنسا؟",
    A: "London", B: "Berlin", C: "Paris", D: "Madrid",
    A_ar: "لندن", B_ar: "برلين", C_ar: "باريس", D_ar: "مدريد", correct: "C", level: 11 },

  // Level 12
  { q_en: "Which ocean is the largest?", q_ar: "ما أكبر محيط؟",
    A: "Atlantic", B: "Indian", C: "Arctic", D: "Pacific",
    A_ar: "الأطلسي", B_ar: "الهندي", C_ar: "المتجمد الشمالي", D_ar: "الهادئ", correct: "D", level: 12 },

  // Level 13
  { q_en: "Which gas do plants absorb from the air?", q_ar: "ما الغاز الذي تمتصه النباتات من الهواء؟",
    A: "Oxygen", B: "Carbon Dioxide", C: "Nitrogen", D: "Helium",
    A_ar: "الأكسجين", B_ar: "ثاني أكسيد الكربون", C_ar: "النيتروجين", D_ar: "الهيليوم", correct: "B", level: 13 },

  // Level 14
  { q_en: "Which is the tallest mountain in the world?", q_ar: "ما أعلى جبل في العالم؟",
    A: "K2", B: "Mont Blanc", C: "Everest", D: "Kilimanjaro",
    A_ar: "كي٢", B_ar: "مون بلان", C_ar: "إفرست", D_ar: "كليمنجارو", correct: "C", level: 14 },

  // Level 15
  { q_en: "How many continents are there?", q_ar: "كم عدد القارات؟",
    A: "5", B: "6", C: "7", D: "8",
    A_ar: "٥", B_ar: "٦", C_ar: "٧", D_ar: "٨", correct: "C", level: 15 },

  // Level 16
  { q_en: "Which country has the pyramids of Giza?", q_ar: "أي دولة فيها أهرامات الجيزة؟",
    A: "Iraq", B: "Egypt", C: "Mexico", D: "Greece",
    A_ar: "العراق", B_ar: "مصر", C_ar: "المكسيك", D_ar: "اليونان", correct: "B", level: 16 },

  // Level 17
  { q_en: "What is H2O commonly known as?", q_ar: "بماذا يُعرف H2O؟",
    A: "Salt", B: "Sugar", C: "Water", D: "Oxygen",
    A_ar: "ملح", B_ar: "سكر", C_ar: "ماء", D_ar: "أكسجين", correct: "C", level: 17 },

  // Level 18
  { q_en: "Which bird cannot fly?", q_ar: "أي طائر لا يستطيع الطيران؟",
    A: "Eagle", B: "Sparrow", C: "Penguin", D: "Pigeon",
    A_ar: "النسر", B_ar: "العصفور", C_ar: "البطريق", D_ar: "الحمام", correct: "C", level: 18 },

  // Level 19
  { q_en: "Which organ pumps blood through the body?", q_ar: "أي عضو يضخ الدم في الجسم؟",
    A: "Brain", B: "Lungs", C: "Heart", D: "Liver",
    A_ar: "الدماغ", B_ar: "الرئتان", C_ar: "القلب", D_ar: "الكبد", correct: "C", level: 19 },

  // Level 20
  { q_en: "How many sides does a hexagon have?", q_ar: "كم ضلعًا للشكل السداسي؟",
    A: "5", B: "6", C: "7", D: "8",
    A_ar: "٥", B_ar: "٦", C_ar: "٧", D_ar: "٨", correct: "B", level: 20 },

  // Level 21
  { q_en: "Who wrote 'Romeo and Juliet'?", q_ar: "من كتب 'روميو وجولييت'؟",
    A: "Charles Dickens", B: "William Shakespeare", C: "Mark Twain", D: "Jane Austen",
    A_ar: "تشارلز ديكنز", B_ar: "ويليام شكسبير", C_ar: "مارك توين", D_ar: "جين أوستن", correct: "B", level: 21 },

  // Level 22
  { q_en: "What is the largest desert in the world?", q_ar: "ما أكبر صحراء في العالم؟",
    A: "Sahara", B: "Gobi", C: "Arabian", D: "Antarctic",
    A_ar: "الصحراء الكبرى", B_ar: "جوبي", C_ar: "العربية", D_ar: "القارة القطبية الجنوبية", correct: "D", level: 22 },

  // Level 23
  { q_en: "In which year did World War II end?", q_ar: "في أي عام انتهت الحرب العالمية الثانية؟",
    A: "1943", B: "1945", C: "1947", D: "1950",
    A_ar: "١٩٤٣", B_ar: "١٩٤٥", C_ar: "١٩٤٧", D_ar: "١٩٥٠", correct: "B", level: 23 },

  // Level 24
  { q_en: "Which is the longest river in the world?", q_ar: "ما أطول نهر في العالم؟",
    A: "Amazon", B: "Nile", C: "Yangtze", D: "Mississippi",
    A_ar: "الأمازون", B_ar: "النيل", C_ar: "اليانغتسي", D_ar: "المسيسيبي", correct: "B", level: 24 },

  // Level 25
  { q_en: "Which country is known as the Land of the Rising Sun?", q_ar: "أي دولة تُعرف ببلاد الشمس المشرقة؟",
    A: "China", B: "Japan", C: "Korea", D: "Thailand",
    A_ar: "الصين", B_ar: "اليابان", C_ar: "كوريا", D_ar: "تايلاند", correct: "B", level: 25 },

  // Level 26
  { q_en: "Which is the smallest prime number?", q_ar: "ما أصغر عدد أولي؟",
    A: "0", B: "1", C: "2", D: "3",
    A_ar: "٠", B_ar: "١", C_ar: "٢", D_ar: "٣", correct: "C", level: 26 },

  // Level 27
  { q_en: "How many bones are in the adult human body?", q_ar: "كم عدد عظام جسم الإنسان البالغ؟",
    A: "196", B: "206", C: "216", D: "226",
    A_ar: "١٩٦", B_ar: "٢٠٦", C_ar: "٢١٦", D_ar: "٢٢٦", correct: "B", level: 27 },

  // Level 28
  { q_en: "What is the chemical symbol for gold?", q_ar: "ما الرمز الكيميائي للذهب؟",
    A: "Go", B: "Gd", C: "Au", D: "Ag",
    A_ar: "Go", B_ar: "Gd", C_ar: "Au", D_ar: "Ag", correct: "C", level: 28 },

  // Level 29
  { q_en: "Which instrument has black and white keys?", q_ar: "أي آلة موسيقية لها مفاتيح بيضاء وسوداء؟",
    A: "Guitar", B: "Piano", C: "Violin", D: "Flute",
    A_ar: "الغيتار", B_ar: "البيانو", C_ar: "الكمان", D_ar: "الناي", correct: "B", level: 29 },

  // Level 30
  { q_en: "What is the fastest land animal?", q_ar: "ما أسرع حيوان بري؟",
    A: "Lion", B: "Horse", C: "Cheetah", D: "Gazelle",
    A_ar: "الأسد", B_ar: "الحصان", C_ar: "الفهد", D_ar: "الغزال", correct: "C", level: 30 },

  // Level 31
  { q_en: "Which country has the largest population?", q_ar: "أي دولة لديها أكبر عدد سكان؟",
    A: "USA", B: "India", C: "Russia", D: "Indonesia",
    A_ar: "الولايات المتحدة", B_ar: "الهند", C_ar: "روسيا", D_ar: "إندونيسيا", correct: "B", level: 31 },

  // Level 32
  { q_en: "Which element has the atomic number 1?", q_ar: "ما العنصر الذي عدده الذري ١؟",
    A: "Helium", B: "Oxygen", C: "Hydrogen", D: "Carbon",
    A_ar: "الهيليوم", B_ar: "الأكسجين", C_ar: "الهيدروجين", D_ar: "الكربون", correct: "C", level: 32 },

  // Level 33
  { q_en: "Who painted the Mona Lisa?", q_ar: "من رسم لوحة الموناليزا؟",
    A: "Van Gogh", B: "Picasso", C: "Da Vinci", D: "Michelangelo",
    A_ar: "فان جوخ", B_ar: "بيكاسو", C_ar: "ليوناردو دافنشي", D_ar: "مايكل أنجلو", correct: "C", level: 33 },

  // Level 34
  { q_en: "Which is the hottest planet in our solar system?", q_ar: "أي كوكب هو الأكثر حرارة في المجموعة الشمسية؟",
    A: "Mercury", B: "Venus", C: "Mars", D: "Jupiter",
    A_ar: "عطارد", B_ar: "الزهرة", C_ar: "المريخ", D_ar: "المشتري", correct: "B", level: 34 },

  // Level 35
  { q_en: "What is the currency of Japan?", q_ar: "ما عملة اليابان؟",
    A: "Yuan", B: "Won", C: "Yen", D: "Ringgit",
    A_ar: "اليوان", B_ar: "الوون", C_ar: "الين", D_ar: "الرينغيت", correct: "C", level: 35 },

  // Level 36
  { q_en: "What is the largest mammal?", q_ar: "ما أكبر الثدييات؟",
    A: "Elephant", B: "Blue whale", C: "Giraffe", D: "Polar bear",
    A_ar: "الفيل", B_ar: "الحوت الأزرق", C_ar: "الزرافة", D_ar: "الدب القطبي", correct: "B", level: 36 },

  // Level 37
  { q_en: "Who is known as the 'Father of Computers'?", q_ar: "من يُعرف بـ 'أبو الحاسوب'؟",
    A: "Alan Turing", B: "Charles Babbage", C: "Steve Jobs", D: "Bill Gates",
    A_ar: "آلان تورينغ", B_ar: "تشارلز باباج", C_ar: "ستيف جوبز", D_ar: "بيل غيتس", correct: "B", level: 37 },

  // Level 38
  { q_en: "Which metal is liquid at room temperature?", q_ar: "أي فلز يكون سائلًا في درجة حرارة الغرفة؟",
    A: "Iron", B: "Mercury", C: "Aluminum", D: "Copper",
    A_ar: "الحديد", B_ar: "الزئبق", C_ar: "الألمنيوم", D_ar: "النحاس", correct: "B", level: 38 },

  // Level 39
  { q_en: "How many players are on a football (soccer) team on the field?", q_ar: "كم لاعبًا في فريق كرة القدم على أرض الملعب؟",
    A: "9", B: "10", C: "11", D: "12",
    A_ar: "٩", B_ar: "١٠", C_ar: "١١", D_ar: "١٢", correct: "C", level: 39 },

  // Level 40
  { q_en: "Which is the smallest country in the world?", q_ar: "ما أصغر دولة في العالم؟",
    A: "Monaco", B: "Maldives", C: "Vatican City", D: "San Marino",
    A_ar: "موناكو", B_ar: "جزر المالديف", C_ar: "الفاتيكان", D_ar: "سان مارينو", correct: "C", level: 40 },

  // Level 41
  { q_en: "Which is the hardest natural substance?", q_ar: "ما أقسى مادة طبيعية؟",
    A: "Gold", B: "Iron", C: "Diamond", D: "Quartz",
    A_ar: "الذهب", B_ar: "الحديد", C_ar: "الألماس", D_ar: "الكوارتز", correct: "C", level: 41 },

  // Level 42
  { q_en: "What is the speed of light approximately?", q_ar: "كم تقارب سرعة الضوء؟",
    A: "3×10^8 m/s", B: "3×10^6 m/s", C: "3×10^10 m/s", D: "3×10^5 m/s",
    A_ar: "٣×١٠^٨ م/ث", B_ar: "٣×١٠^٦ م/ث", C_ar: "٣×١٠^١٠ م/ث", D_ar: "٣×١٠^٥ م/ث", correct: "A", level: 42 },

  // Level 43
  { q_en: "Which is the deepest ocean trench?", q_ar: "ما أعمق خندق في المحيطات؟",
    A: "Puerto Rico Trench", B: "Java Trench", C: "Mariana Trench", D: "Tonga Trench",
    A_ar: "خندق بورتوريكو", B_ar: "خندق جاوة", C_ar: "خندق ماريانا", D_ar: "خندق تونغا", correct: "C", level: 43 },

  // Level 44
  { q_en: "Who discovered penicillin?", q_ar: "من اكتشف البنسلين؟",
    A: "Isaac Newton", B: "Alexander Fleming", C: "Louis Pasteur", D: "Marie Curie",
    A_ar: "إسحاق نيوتن", B_ar: "ألكسندر فليمنج", C_ar: "لويس باستور", D_ar: "ماري كوري", correct: "B", level: 44 },

  // Level 45
  { q_en: "What does 'CPU' stand for?", q_ar: "ماذا يعني 'CPU'؟",
    A: "Central Process Unit", B: "Central Processing Unit", C: "Control Process Unit", D: "Computer Personal Unit",
    A_ar: "وحدة العمليات المركزية", B_ar: "وحدة المعالجة المركزية", C_ar: "وحدة التحكم بالعمليات", D_ar: "وحدة الحاسوب الشخصي", correct: "B", level: 45 },

  // Level 46
  { q_en: "What year did humans first land on the Moon?", q_ar: "في أي عام هبط الإنسان على القمر أول مرة؟",
    A: "1965", B: "1969", C: "1971", D: "1975",
    A_ar: "١٩٦٥", B_ar: "١٩٦٩", C_ar: "١٩٧١", D_ar: "١٩٧٥", correct: "B", level: 46 },

  // Level 47
  { q_en: "Which vitamin is produced by the skin in sunlight?", q_ar: "أي فيتامين يُنتج في الجلد عند التعرض للشمس؟",
    A: "Vitamin A", B: "Vitamin B12", C: "Vitamin C", D: "Vitamin D",
    A_ar: "فيتامين A", B_ar: "فيتامين B12", C_ar: "فيتامين C", D_ar: "فيتامين D", correct: "D", level: 47 },

  // Level 48
  { q_en: "Which country invented paper?", q_ar: "أي دولة اخترعت الورق؟",
    A: "India", B: "Egypt", C: "China", D: "Greece",
    A_ar: "الهند", B_ar: "مصر", C_ar: "الصين", D_ar: "اليونان", correct: "C", level: 48 },

  // Level 49
  { q_en: "What is the pH of pure water?", q_ar: "ما الرقم الهيدروجيني للماء النقي؟",
    A: "5", B: "6", C: "7", D: "8",
    A_ar: "٥", B_ar: "٦", C_ar: "٧", D_ar: "٨", correct: "C", level: 49 },

  // Level 50
  { q_en: "What is the square root of 144?", q_ar: "ما الجذر التربيعي لـ ١٤٤؟",
    A: "10", B: "11", C: "12", D: "14",
    A_ar: "١٠", B_ar: "١١", C_ar: "١٢", D_ar: "١٤", correct: "C", level: 50 },

  // Level 51
  { q_en: "Who developed the theory of general relativity?", q_ar: "من طوّر نظرية النسبية العامة؟",
    A: "Newton", B: "Einstein", C: "Tesla", D: "Hawking",
    A_ar: "نيوتن", B_ar: "أينشتاين", C_ar: "تيسلا", D_ar: "هوكينغ", correct: "B", level: 51 },

  // Level 52
  { q_en: "Which is the largest organ of the human body?", q_ar: "ما أكبر عضو في جسم الإنسان؟",
    A: "Liver", B: "Brain", C: "Skin", D: "Lungs",
    A_ar: "الكبد", B_ar: "الدماغ", C_ar: "الجلد", D_ar: "الرئتان", correct: "C", level: 52 },

  // Level 53
  { q_en: "Which language has the most native speakers worldwide?", q_ar: "أي لغة لديها أكبر عدد من المتحدثين الأصليين؟",
    A: "English", B: "Spanish", C: "Mandarin Chinese", D: "Hindi",
    A_ar: "الإنجليزية", B_ar: "الإسبانية", C_ar: "الصينية (ماندرين)", D_ar: "الهندية", correct: "C", level: 53 },

  // Level 54
  { q_en: "Which is the only mammal capable of true flight?", q_ar: "ما الثديي الوحيد القادر على الطيران الحقيقي؟",
    A: "Flying squirrel", B: "Bat", C: "Sugar glider", D: "Colugo",
    A_ar: "السنجاب الطائر", B_ar: "الخفاش", C_ar: "السكر غلايدر", D_ar: "الكولوغو", correct: "B", level: 54 },

  // Level 55
  { q_en: "What does 'HTTP' stand for?", q_ar: "ماذا يعني 'HTTP'؟",
    A: "HyperText Transfer Protocol", B: "High Transfer Text Protocol", C: "HyperText Transmission Path", D: "Hyper Transfer Text Process",
    A_ar: "بروتوكول نقل النص التشعبي", B_ar: "بروتوكول النص عالي النقل", C_ar: "مسار إرسال النص التشعبي", D_ar: "عملية نقل النص الفائق", correct: "A", level: 55 },

  // Level 56
  { q_en: "What is the capital of Australia?", q_ar: "ما عاصمة أستراليا؟",
    A: "Sydney", B: "Melbourne", C: "Canberra", D: "Perth",
    A_ar: "سيدني", B_ar: "ملبورن", C_ar: "كانبرا", D_ar: "بيرث", correct: "C", level: 56 },

  // Level 57
  { q_en: "Which sea is the saltiest body of water in the world?", q_ar: "ما المسطح المائي الأكثر ملوحة في العالم؟",
    A: "Red Sea", B: "Dead Sea", C: "Mediterranean", D: "Caspian Sea",
    A_ar: "البحر الأحمر", B_ar: "البحر الميت", C_ar: "البحر المتوسط", D_ar: "بحر قزوين", correct: "B", level: 57 },

  // Level 58
  { q_en: "Which planet has the most moons (as of 2023)?", q_ar: "أي كوكب لديه أكبر عدد من الأقمار (حتى ٢٠٢٣)؟",
    A: "Jupiter", B: "Saturn", C: "Uranus", D: "Neptune",
    A_ar: "المشتري", B_ar: "زحل", C_ar: "أورانوس", D_ar: "نبتون", correct: "B", level: 58 },

  // Level 59
  { q_en: "What is the chemical formula for table salt?", q_ar: "ما الصيغة الكيميائية لملح الطعام؟",
    A: "NaCl", B: "KCl", C: "CaCl2", D: "NaHCO3",
    A_ar: "NaCl", B_ar: "KCl", C_ar: "CaCl2", D_ar: "NaHCO3", correct: "A", level: 59 },

  // Level 60
  { q_en: "Which scientist formulated the laws of motion?", q_ar: "أي عالم وضع قوانين الحركة؟",
    A: "Einstein", B: "Galileo", C: "Newton", D: "Kepler",
    A_ar: "أينشتاين", B_ar: "جاليليو", C_ar: "نيوتن", D_ar: "كبلر", correct: "C", level: 60 },

  // Level 61
  { q_en: "Which country has the most time zones?", q_ar: "أي دولة لديها أكبر عدد من المناطق الزمنية؟",
    A: "USA", B: "Russia", C: "China", D: "France",
    A_ar: "الولايات المتحدة", B_ar: "روسيا", C_ar: "الصين", D_ar: "فرنسا", correct: "D", level: 61 },

  // Level 62
  { q_en: "What is the main gas in Earth's atmosphere?", q_ar: "ما الغاز الرئيسي في الغلاف الجوي للأرض؟",
    A: "Oxygen", B: "Nitrogen", C: "Carbon Dioxide", D: "Argon",
    A_ar: "الأكسجين", B_ar: "النيتروجين", C_ar: "ثاني أكسيد الكربون", D_ar: "الأرجون", correct: "B", level: 62 },

  // Level 63
  { q_en: "Who is the author of 'Harry Potter'?", q_ar: "من مؤلف سلسلة 'هاري بوتر'؟",
    A: "J.K. Rowling", B: "J.R.R. Tolkien", C: "George R.R. Martin", D: "C.S. Lewis",
    A_ar: "ج. ك. رولينغ", B_ar: "ج. ر. ر. تولكين", C_ar: "جورج ر. ر. مارتن", D_ar: "س. س. لويس", correct: "A", level: 63 },

  // Level 64
  { q_en: "Which is the largest island in the world?", q_ar: "ما أكبر جزيرة في العالم؟",
    A: "Madagascar", B: "Borneo", C: "New Guinea", D: "Greenland",
    A_ar: "مدغشقر", B_ar: "بورنيو", C_ar: "غينيا الجديدة", D_ar: "جرينلاند", correct: "D", level: 64 },

  // Level 65
  { q_en: "Which is the study of earthquakes?", q_ar: "ما علم دراسة الزلازل؟",
    A: "Seismology", B: "Geology", C: "Meteorology", D: "Volcanology",
    A_ar: "علم الزلازل", B_ar: "علم الأرض", C_ar: "علم الأرصاد الجوية", D_ar: "علم البراكين", correct: "A", level: 65 },

  // Level 66
  { q_en: "Who painted 'The Starry Night'?", q_ar: "من رسم لوحة 'ليلة النجوم'؟",
    A: "Monet", B: "Van Gogh", C: "Rembrandt", D: "Dali",
    A_ar: "مونيه", B_ar: "فان جوخ", C_ar: "رامبرانت", D_ar: "دالي", correct: "B", level: 66 },

  // Level 67
  { q_en: "Which blood type is known as the universal donor?", q_ar: "أي فصيلة دم تُعرف بالمانح العام؟",
    A: "A+", B: "B-", C: "O-", D: "AB+",
    A_ar: "A+", B_ar: "B-", C_ar: "O-", D_ar: "AB+", correct: "C", level: 67 },

  // Level 68
  { q_en: "Which is the tallest animal on Earth?", q_ar: "ما أطول حيوان على الأرض؟",
    A: "Horse", B: "Giraffe", C: "Elephant", D: "Ostrich",
    A_ar: "الحصان", B_ar: "الزرافة", C_ar: "الفيل", D_ar: "النعامة", correct: "B", level: 68 },

  // Level 69
  { q_en: "Which country is both in Europe and Asia?", q_ar: "أي دولة تقع في أوروبا وآسيا معًا؟",
    A: "Turkey", B: "Italy", C: "Iran", D: "Greece",
    A_ar: "تركيا", B_ar: "إيطاليا", C_ar: "إيران", D_ar: "اليونان", correct: "A", level: 69 },

  // Level 70
  { q_en: "What is the value of π (pi) to two decimal places?", q_ar: "ما قيمة π (باي) لأقرب منزلتين عشريتين؟",
    A: "3.12", B: "3.14", C: "3.16", D: "3.18",
    A_ar: "٣٫١٢", B_ar: "٣٫١٤", C_ar: "٣٫١٦", D_ar: "٣٫١٨", correct: "B", level: 70 },

  // Level 71
  { q_en: "Which particle has a negative charge?", q_ar: "أي جسيم يحمل شحنة سالبة؟",
    A: "Proton", B: "Neutron", C: "Electron", D: "Positron",
    A_ar: "البروتون", B_ar: "النيوترون", C_ar: "الإلكترون", D_ar: "البوزيترون", correct: "C", level: 71 },

  // Level 72
  { q_en: "In which continent is the Amazon rainforest?", q_ar: "في أي قارة تقع غابات الأمازون المطيرة؟",
    A: "Africa", B: "Asia", C: "South America", D: "Australia",
    A_ar: "أفريقيا", B_ar: "آسيا", C_ar: "أمريكا الجنوبية", D_ar: "أستراليا", correct: "C", level: 72 },

  // Level 73
  { q_en: "Which galaxy do we live in?", q_ar: "في أي مجرة نعيش؟",
    A: "Andromeda", B: "Triangulum", C: "Milky Way", D: "Whirlpool",
    A_ar: "أندروميدا", B_ar: "المثلث", C_ar: "درب التبانة", D_ar: "الدوامة", correct: "C", level: 73 },

  // Level 74
  { q_en: "What is the boiling point of water at sea level (°C)?", q_ar: "ما درجة غليان الماء عند مستوى سطح البحر (°م)؟",
    A: "90", B: "95", C: "100", D: "105",
    A_ar: "٩٠", B_ar: "٩٥", C_ar: "١٠٠", D_ar: "١٠٥", correct: "C", level: 74 },

  // Level 75
  { q_en: "Which company created the iPhone?", q_ar: "أي شركة ابتكرت iPhone؟",
    A: "Samsung", B: "Google", C: "Apple", D: "Microsoft",
    A_ar: "سامسونغ", B_ar: "جوجل", C_ar: "آبل", D_ar: "مايكروسوفت", correct: "C", level: 75 },

  // Level 76
  { q_en: "Who wrote the play 'Hamlet'?", q_ar: "من كتب مسرحية 'هاملت'؟",
    A: "Shakespeare", B: "Dickens", C: "Wilde", D: "Chaucer",
    A_ar: "شكسبير", B_ar: "ديكنز", C_ar: "وايلد", D_ar: "تشوسر", correct: "A", level: 76 },

  // Level 77
  { q_en: "What gas do humans exhale?", q_ar: "ما الغاز الذي يزفره الإنسان؟",
    A: "Oxygen", B: "Nitrogen", C: "Carbon Dioxide", D: "Hydrogen",
    A_ar: "الأكسجين", B_ar: "النيتروجين", C_ar: "ثاني أكسيد الكربون", D_ar: "الهيدروجين", correct: "C", level: 77 },

  // Level 78
  { q_en: "Which planet is known as the Red Planet?", q_ar: "أي كوكب يُعرف بالكوكب الأحمر؟",
    A: "Venus", B: "Mars", C: "Jupiter", D: "Mercury",
    A_ar: "الزهرة", B_ar: "المريخ", C_ar: "المشتري", D_ar: "عطارد", correct: "B", level: 78 },

  // Level 79
  { q_en: "What does 'RAM' stand for?", q_ar: "ماذا تعني 'RAM'؟",
    A: "Rapid Access Memory", B: "Random Access Memory", C: "Read Access Memory", D: "Run Active Memory",
    A_ar: "ذاكرة الوصول السريع", B_ar: "ذاكرة الوصول العشوائي", C_ar: "ذاكرة قراءة الوصول", D_ar: "ذاكرة التشغيل النشط", correct: "B", level: 79 },

  // Level 80
  { q_en: "Which country is home to the kangaroo?", q_ar: "أي دولة موطن حيوان الكنغر؟",
    A: "Brazil", B: "South Africa", C: "Australia", D: "India",
    A_ar: "البرازيل", B_ar: "جنوب أفريقيا", C_ar: "أستراليا", D_ar: "الهند", correct: "C", level: 80 },

  // Level 81
  { q_en: "Who invented the telephone?", q_ar: "من اخترع الهاتف؟",
    A: "Edison", B: "Bell", C: "Tesla", D: "Marconi",
    A_ar: "إديسون", B_ar: "بيل", C_ar: "تيسلا", D_ar: "ماركوني", correct: "B", level: 81 },

  // Level 82
  { q_en: "Which is the largest country by area?", q_ar: "ما أكبر دولة من حيث المساحة؟",
    A: "Canada", B: "USA", C: "China", D: "Russia",
    A_ar: "كندا", B_ar: "الولايات المتحدة", C_ar: "الصين", D_ar: "روسيا", correct: "D", level: 82 },

  // Level 83
  { q_en: "Which vitamin is essential for blood clotting?", q_ar: "أي فيتامين ضروري لتجلط الدم؟",
    A: "Vitamin A", B: "Vitamin C", C: "Vitamin K", D: "Vitamin E",
    A_ar: "فيتامين A", B_ar: "فيتامين C", C_ar: "فيتامين K", D_ar: "فيتامين E", correct: "C", level: 83 },

  // Level 84
  { q_en: "Which is the main language spoken in Brazil?", q_ar: "ما اللغة الرئيسية في البرازيل؟",
    A: "Spanish", B: "English", C: "Portuguese", D: "French",
    A_ar: "الإسبانية", B_ar: "الإنجليزية", C_ar: "البرتغالية", D_ar: "الفرنسية", correct: "C", level: 84 },

  // Level 85
  { q_en: "Which organ filters blood in the human body?", q_ar: "أي عضو يُرشح الدم في جسم الإنسان؟",
    A: "Stomach", B: "Kidneys", C: "Heart", D: "Pancreas",
    A_ar: "المعدة", B_ar: "الكليتان", C_ar: "القلب", D_ar: "البنكرياس", correct: "B", level: 85 },

  // Level 86
  { q_en: "What is the highest-grossing film franchise of all time (live-action)?", q_ar: "ما أعلى سلسلة أفلام دخلًا في التاريخ (حية الحركة)؟",
    A: "Star Wars", B: "Marvel Cinematic Universe", C: "Harry Potter", D: "Fast & Furious",
    A_ar: "حرب النجوم", B_ar: "عالم مارفل السينمائي", C_ar: "هاري بوتر", D_ar: "سريع وغاضب", correct: "B", level: 86 },

  // Level 87
  { q_en: "Who is the Greek god of the sea?", q_ar: "من هو إله البحر عند اليونان؟",
    A: "Zeus", B: "Apollo", C: "Poseidon", D: "Hades",
    A_ar: "زيوس", B_ar: "أبولو", C_ar: "بوسيدون", D_ar: "هاديس", correct: "C", level: 87 },

  // Level 88
  { q_en: "Which structure was built to protect against invasions in ancient China?", q_ar: "أي بنية بُنيت للحماية من الغزوات في الصين القديمة؟",
    A: "The Forbidden City", B: "The Great Wall", C: "The Terracotta Army", D: "The Summer Palace",
    A_ar: "المدينة المحرمة", B_ar: "سور الصين العظيم", C_ar: "جيش التيراكوتا", D_ar: "القصر الصيفي", correct: "B", level: 88 },

  // Level 89
  { q_en: "Which shape has all sides of equal length and all angles of 90°?", q_ar: "أي شكل جميع أضلاعه متساوية وزواياه قائمة؟",
    A: "Rectangle", B: "Rhombus", C: "Square", D: "Trapezoid",
    A_ar: "مستطيل", B_ar: "معين", C_ar: "مربع", D_ar: "شبه منحرف", correct: "C", level: 89 },

  // Level 90
  { q_en: "Which planet has visible rings?", q_ar: "أي كوكب له حلقات ظاهرة؟",
    A: "Jupiter", B: "Saturn", C: "Neptune", D: "Uranus",
    A_ar: "المشتري", B_ar: "زحل", C_ar: "نبتون", D_ar: "أورانوس", correct: "B", level: 90 },

  // Level 91
  { q_en: "What is the hardest mineral on the Mohs scale?", q_ar: "ما أصلب معدن على مقياس موهس؟",
    A: "Quartz", B: "Topaz", C: "Corundum", D: "Diamond",
    A_ar: "الكوارتز", B_ar: "التوباز", C_ar: "الكوراندوم", D_ar: "الألماس", correct: "D", level: 91 },

  // Level 92
  { q_en: "Which programming language is primarily used for web styling?", q_ar: "أي لغة برمجة تُستخدم بشكل أساسي لتنسيق الويب؟",
    A: "HTML", B: "Python", C: "CSS", D: "SQL",
    A_ar: "HTML", B_ar: "بايثون", C_ar: "CSS", D_ar: "SQL", correct: "C", level: 92 },

  // Level 93
  { q_en: "Which gas makes up about 21% of Earth's atmosphere?", q_ar: "أي غاز يشكّل نحو ٢١٪ من الغلاف الجوي للأرض؟",
    A: "Nitrogen", B: "Oxygen", C: "Argon", D: "Carbon Dioxide",
    A_ar: "النيتروجين", B_ar: "الأكسجين", C_ar: "الأرجون", D_ar: "ثاني أكسيد الكربون", correct: "B", level: 93 },

  // Level 94
  { q_en: "Which mathematician is famous for the theorem relating the sides of a right triangle?", q_ar: "أي عالم رياضيات اشتهر بنظرية أضلاع المثلث القائم الزاوية؟",
    A: "Euclid", B: "Archimedes", C: "Pythagoras", D: "Euler",
    A_ar: "إقليدس", B_ar: "أرخميدس", C_ar: "فيثاغورس", D_ar: "أويلر", correct: "C", level: 94 },

  // Level 95
  { q_en: "What is the most spoken language in the world by total number of speakers?", q_ar: "ما أكثر لغة تحدّثًا في العالم بإجمالي عدد المتحدثين؟",
    A: "Mandarin", B: "English", C: "Hindi", D: "Spanish",
    A_ar: "الصينية", B_ar: "الإنجليزية", C_ar: "الهندية", D_ar: "الإسبانية", correct: "B", level: 95 },

  // Level 96
  { q_en: "Which is the only planet known to support life?", q_ar: "ما الكوكب الوحيد المعروف بأنه يدعم الحياة؟",
    A: "Mars", B: "Earth", C: "Venus", D: "Kepler-186f",
    A_ar: "المريخ", B_ar: "الأرض", C_ar: "الزهرة", D_ar: "Kepler-186f", correct: "B", level: 96 },

  // Level 97
  { q_en: "Who composed the Ninth Symphony?", q_ar: "من ألّف السيمفونية التاسعة؟",
    A: "Bach", B: "Mozart", C: "Beethoven", D: "Chopin",
    A_ar: "باخ", B_ar: "موزارت", C_ar: "بيتهوفن", D_ar: "شوبان", correct: "C", level: 97 },

  // Level 98
  { q_en: "What is the SI unit of electric current?", q_ar: "ما وحدة قياس التيار الكهربائي في النظام الدولي؟",
    A: "Volt", B: "Ohm", C: "Watt", D: "Ampere",
    A_ar: "الفولت", B_ar: "الأوم", C_ar: "الواط", D_ar: "الأمبير", correct: "D", level: 98 },

  // Level 99
  { q_en: "Which ancient wonder was located in Alexandria?", q_ar: "أي عجيبة قديمة كانت في الإسكندرية؟",
    A: "Hanging Gardens", B: "Lighthouse (Pharos)", C: "Colossus", D: "Statue of Zeus",
    A_ar: "حدائق بابل المعلقة", B_ar: "منارة الإسكندرية", C_ar: "تمثال رودس", D_ar: "تمثال زيوس", correct: "B", level: 99 },

  // Level 100 — Boss question
  { q_en: "What is the smallest unit of matter that retains the properties of an element?", q_ar: "ما أصغر وحدة من المادة تحتفظ بخصائص العنصر؟",
    A: "Molecule", B: "Atom", C: "Electron", D: "Quark",
    A_ar: "الجزيء", B_ar: "الذرة", C_ar: "الإلكترون", D_ar: "الكوارك", correct: "B", level: 100 }
];

function seed(db) {
  const insert = db.prepare(`
    INSERT INTO questions
      (question_en, question_ar, A, B, C, D, A_ar, B_ar, C_ar, D_ar, correct_answer, level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const bankLen = QUESTIONS.length;
  let written = 0;

  const tx = db.transaction(() => {
    for (let stage = 1; stage <= 100; stage++) {
      const questionCount = Math.min(stage * 10, 100);
      for (let q = 0; q < questionCount; q++) {
        const base = QUESTIONS[written % bankLen];
        insert.run(
          base.q_en, base.q_ar,
          base.A, base.B, base.C, base.D,
          base.A_ar, base.B_ar, base.C_ar, base.D_ar,
          base.correct, stage
        );
        written++;
      }
    }
  });

  tx();
  return written;
}

module.exports = seed;
module.exports.QUESTIONS = QUESTIONS;

// Allow running directly: `node scripts/seed.js`
if (require.main === module) {
  const Database = require("better-sqlite3");
  const dbPath = path.join(__dirname, "..", "database.db");
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_en TEXT NOT NULL,
      question_ar TEXT NOT NULL,
      A TEXT NOT NULL,
      B TEXT NOT NULL,
      C TEXT NOT NULL,
      D TEXT NOT NULL,
      A_ar TEXT,
      B_ar TEXT,
      C_ar TEXT,
      D_ar TEXT,
      correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
      level INTEGER NOT NULL
    );
  `);

  db.prepare("DELETE FROM questions").run();
  const n = seed(db);
  console.log(`Seeded ${n} questions into ${dbPath}`);
  db.close();
}
