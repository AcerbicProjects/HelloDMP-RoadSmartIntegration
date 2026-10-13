// Road-safety learning content: lessons, quiz, road signs and guides.
// Topics follow the proposal's Learn module (full PDF p.39), the STEP concept note (SafeRoad School levels,
// RoadSmart Citizen pathway) and the workbook recommendations SG-026 to SG-030.
import type { Guide, Lesson, QuizQuestion, RoadSign } from './types';

export const LESSONS: Lesson[] = [
  {
    id: 'signals',
    title: { bn: 'সিগন্যাল ও স্টপ লাইন', en: 'Signals and the stop line' },
    minutes: 5,
    icon: 'TrafficCone',
    points: [
      { bn: 'লাল বাতিতে স্টপ লাইনের আগে পুরোপুরি থামুন; জেব্রা ক্রসিংয়ের ওপর গাড়ি রাখবেন না।', en: 'Stop fully behind the stop line on red; never wait on the zebra crossing.' },
      { bn: 'হলুদ বাতি মানে থামার প্রস্তুতি, গতি বাড়িয়ে পার হওয়া নয়।', en: 'Amber means prepare to stop, not speed up to beat the light.' },
      { bn: 'ট্রাফিক পুলিশের হাতের সংকেত বাতির চেয়ে অগ্রাধিকার পায়।', en: "A traffic officer's hand signal overrides the lights." },
      { bn: 'AI ক্যামেরা স্টপ লাইন পার হওয়ার ছবি ও ভিডিও সংরক্ষণ করে; অফিসার যাচাইয়ের পর নোটিশ যায়।', en: 'AI cameras record stop-line crossings; an officer checks the evidence before a notice is sent.' },
    ],
    tip: { bn: 'ঢাকার উদাহরণ: ফার্মগেট মোড়ে সবচেয়ে বেশি স্টপ লাইন লঙ্ঘন ধরা পড়ে।', en: 'Dhaka example: Farmgate is one of the junctions with the most stop-line crossings.' },
  },
  {
    id: 'zebra',
    title: { bn: 'জেব্রা ক্রসিং ও পথচারী', en: 'Zebra crossings and pedestrians' },
    minutes: 4,
    icon: 'Footprints',
    points: [
      { bn: 'জেব্রা ক্রসিংয়ে পথচারী থাকলে গাড়ি থামাতে হবে।', en: 'Vehicles must stop when a pedestrian is on a zebra crossing.' },
      { bn: 'পথচারী হিসেবে ফুটওভার ব্রিজ বা জেব্রা ক্রসিং ব্যবহার করুন; চলন্ত গাড়ির ফাঁক দিয়ে দৌড়াবেন না।', en: 'As a pedestrian, use foot-over-bridges or zebra crossings; never run between moving vehicles.' },
      { bn: 'রাস্তা পার হওয়ার সময় ফোন দেখবেন না।', en: 'Do not look at your phone while crossing.' },
    ],
    tip: { bn: 'ঢাকায় সড়কে নিহতদের প্রায় অর্ধেক পথচারী।', en: 'In Dhaka, nearly half of road deaths are pedestrians.' },
  },
  {
    id: 'helmet',
    title: { bn: 'হেলমেট ও মোটরসাইকেল', en: 'Helmets and motorcycles' },
    minutes: 6,
    icon: 'HardHat',
    points: [
      { bn: 'চালক ও আরোহী দুজনেরই মানসম্মত হেলমেট পরা বাধ্যতামূলক; ফিতা লাগিয়ে পরুন।', en: 'Rider and passenger must both wear a standard helmet, strap fastened.' },
      { bn: 'ফুটপাতে মোটরসাইকেল চালানো দণ্ডনীয়।', en: 'Riding on the footpath is an offence.' },
      { bn: 'বড় গাড়ির ব্লাইন্ড স্পটে থাকবেন না; আয়নায় চালককে দেখতে না পেলে তিনিও আপনাকে দেখছেন না।', en: "Stay out of large vehicles' blind spots; if you cannot see the driver in the mirror, they cannot see you." },
    ],
    tip: { bn: '২০২৫ সালে নিহত শিক্ষার্থীদের ৫২% মোটরসাইকেলের চালক বা আরোহী ছিলেন।', en: 'In 2025, 52% of students killed on roads were motorcycle riders or passengers.' },
  },
  {
    id: 'speed',
    title: { bn: 'গতি ও নিরাপদ দূরত্ব', en: 'Speed and safe distance' },
    minutes: 5,
    icon: 'Gauge',
    points: [
      { bn: 'সাইনবোর্ডে দেওয়া গতিসীমা মেনে চলুন; স্কুল ও হাসপাতালের কাছে আরও ধীরে।', en: 'Keep to the posted limit, and slower near schools and hospitals.' },
      { bn: 'সামনের গাড়ি থেকে কমপক্ষে ২ সেকেন্ডের দূরত্ব রাখুন; বৃষ্টিতে দ্বিগুণ।', en: 'Keep at least a two-second gap to the vehicle ahead, double in rain.' },
      { bn: 'গড় গতির মামলা: দুই ক্যামেরার মাঝের দূরত্ব ÷ সময় = গড় গতি।', en: 'Average-speed cases: distance between two cameras divided by travel time.' },
    ],
    tip: { bn: 'গতি ১০% বাড়লে গুরুতর দুর্ঘটনার ঝুঁকি অনেক বেশি বাড়ে।', en: 'A small rise in speed sharply raises the risk of a serious crash.' },
  },
  {
    id: 'after-crash',
    title: { bn: 'দুর্ঘটনার পর প্রথম করণীয়', en: 'First steps after a crash' },
    minutes: 7,
    icon: 'Siren',
    points: [
      { bn: 'নিজেকে ও অন্যদের নিরাপদ স্থানে সরান; হ্যাজার্ড লাইট জ্বালান।', en: 'Move yourself and others to safety and switch on hazard lights.' },
      { bn: 'কেউ আহত হলে সঙ্গে সঙ্গে ৯৯৯-এ কল করুন।', en: 'If anyone is hurt, call 999 immediately.' },
      { bn: 'আহতকে অপ্রয়োজনে নাড়াবেন না; রক্তপাত চেপে ধরে থামান।', en: 'Do not move an injured person unless necessary; press to stop bleeding.' },
      { bn: 'ছবি তুলুন এবং অ্যাপে রিপোর্ট বা যৌথ দুর্ঘটনা রিপোর্ট জমা দিন।', en: 'Take photos and file a report or a joint accident report in the app.' },
    ],
    tip: { bn: 'কেউ আহত না হলে দুই চালক QR স্ক্যান করে একটি যৌথ রিপোর্ট দিতে পারেন।', en: 'If nobody is hurt, both drivers can file one joint report by scanning a QR code.' },
  },
];

export const QUIZ: QuizQuestion[] = [
  { id: 'q1', q: { bn: 'মোড়ে পৌঁছানোর আগে হলুদ বাতি জ্বলে উঠল। কী করবেন?', en: 'The light turns amber before you reach the junction. What do you do?' }, options: [{ bn: 'গতি বাড়িয়ে পার হয়ে যাব', en: 'Speed up and cross' }, { bn: 'স্টপ লাইনের আগে থামব', en: 'Stop before the stop line' }, { bn: 'হর্ন দিয়ে এগিয়ে যাব', en: 'Sound the horn and go on' }], correct: 1, why: { bn: 'হলুদ মানে থামার প্রস্তুতি। নিরাপদে থামা সম্ভব হলে স্টপ লাইনের আগে থামুন।', en: 'Amber means prepare to stop. If you can stop safely, stop before the line.' } },
  { id: 'q2', q: { bn: 'জেব্রা ক্রসিংয়ে পথচারী থাকলে চালকের করণীয়?', en: 'A pedestrian is on the zebra crossing. What must the driver do?' }, options: [{ bn: 'থেমে পথ ছেড়ে দেওয়া', en: 'Stop and give way' }, { bn: 'ধীরে পাশ কাটিয়ে যাওয়া', en: 'Pass slowly beside them' }, { bn: 'হর্ন দিয়ে সরে যেতে বলা', en: 'Honk so they move' }], correct: 0, why: { bn: 'জেব্রা ক্রসিংয়ে পথচারীর অগ্রাধিকার।', en: 'Pedestrians have priority on a zebra crossing.' } },
  { id: 'q3', q: { bn: 'মোটরসাইকেলে হেলমেট কার জন্য বাধ্যতামূলক?', en: 'Who must wear a helmet on a motorcycle?' }, options: [{ bn: 'শুধু চালক', en: 'Only the rider' }, { bn: 'চালক ও আরোহী দুজনই', en: 'Both rider and passenger' }, { bn: 'শুধু হাইওয়েতে', en: 'Only on highways' }], correct: 1, why: { bn: 'চালক ও আরোহী দুজনকেই মানসম্মত হেলমেট পরতে হয়।', en: 'Both rider and passenger must wear a standard helmet.' } },
  { id: 'q4', q: { bn: 'DMP-এর জরিমানার SMS-এ লিংক থাকলে কী বুঝবেন?', en: 'A DMP fine SMS contains a link. What does that mean?' }, options: [{ bn: 'লিংকে গিয়ে দ্রুত পরিশোধ করব', en: 'Pay quickly through the link' }, { bn: 'এটি ভুয়া হতে পারে; অ্যাপে যাচাই করব', en: 'It is probably fake; check in the app' }, { bn: 'বন্ধুকে ফরোয়ার্ড করব', en: 'Forward it to a friend' }], correct: 1, why: { bn: 'অফিসিয়াল নোটিশে লিংক থাকে না। লিংক মানেই সন্দেহজনক।', en: 'Official notices never contain links. A link means it is suspicious.' } },
  { id: 'q5', q: { bn: 'সামনের গাড়ি থেকে স্বাভাবিক অবস্থায় ন্যূনতম কত সময়ের দূরত্ব রাখা উচিত?', en: 'What is the minimum gap to keep behind the vehicle ahead in normal conditions?' }, options: [{ bn: '১ সেকেন্ড', en: '1 second' }, { bn: '২ সেকেন্ড', en: '2 seconds' }, { bn: 'দূরত্ব দরকার নেই', en: 'No gap is needed' }], correct: 1, why: { bn: 'কমপক্ষে ২ সেকেন্ড, বৃষ্টিতে দ্বিগুণ।', en: 'At least two seconds, double in rain.' } },
  { id: 'q6', q: { bn: 'ছোট দুর্ঘটনায় কেউ আহত না হলে কী করা যায়?', en: 'After a minor crash with no injuries, what can you do?' }, options: [{ bn: 'রাস্তার মাঝে তর্ক করা', en: 'Argue in the middle of the road' }, { bn: 'নিরাপদ জায়গায় সরে যৌথ রিপোর্ট করা', en: 'Move to safety and file a joint report' }, { bn: 'কিছু না করে চলে যাওয়া', en: 'Leave without doing anything' }], correct: 1, why: { bn: 'যৌথ রিপোর্টে দুই পক্ষের তথ্য ও ছবি একসঙ্গে যায়।', en: "A joint report captures both parties' details and photos together." } },
  { id: 'q7', q: { bn: 'স্কুল এলাকার সাইন দেখলে কী করবেন?', en: 'You see a school zone sign. What do you do?' }, options: [{ bn: 'গতি কমিয়ে সতর্ক থাকব', en: 'Slow down and stay alert' }, { bn: 'একই গতিতে চলব', en: 'Keep the same speed' }, { bn: 'হর্ন বাজাব', en: 'Sound the horn' }], correct: 0, why: { bn: 'স্কুলের কাছে শিশুরা হঠাৎ রাস্তায় আসতে পারে।', en: 'Children may step into the road without warning near schools.' } },
  { id: 'q8', q: { bn: 'ট্রাফিক সার্জেন্ট থামালে জরিমানা কীভাবে দেবেন?', en: 'A traffic sergeant stops you. How do you pay a fine?' }, options: [{ bn: 'নগদে সার্জেন্টের হাতে', en: 'In cash to the sergeant' }, { bn: 'POS রসিদ বা অ্যাপের অফিসিয়াল মাধ্যমে', en: 'Through a POS receipt or the official app' }, { bn: 'কোনোভাবেই না', en: 'Not at all' }], correct: 1, why: { bn: 'জরিমানা শুধু অফিসিয়াল মাধ্যমে; নগদে নয়।', en: 'Fines are paid only through official channels, never in cash.' } },
  { id: 'q9', q: { bn: 'বৃষ্টিতে জলাবদ্ধ রাস্তায় কী করবেন?', en: 'What should you do on a waterlogged road?' }, options: [{ bn: 'দ্রুত চালিয়ে পার হব', en: 'Drive through fast' }, { bn: 'যাচাই করা সতর্কতা দেখে বিকল্প পথ নেব', en: 'Check verified alerts and take another route' }, { bn: 'ইঞ্জিন বন্ধ করে পানিতে দাঁড়াব', en: 'Stop in the water with the engine off' }], correct: 1, why: { bn: 'অ্যাপের যাচাই করা সতর্কতায় বিকল্প পথ দেওয়া থাকে।', en: 'Verified alerts in the app suggest an alternative route.' } },
  { id: 'q10', q: { bn: 'অফিসার কাগজ দেখতে চাইলে ডিজিটাল উপায়ে কী দেখাবেন?', en: 'An officer asks for your papers. What can you show digitally?' }, options: [{ bn: 'কাগজের ছবি', en: 'A photo of the papers' }, { bn: 'অ্যাপের QR ওয়ালেট', en: 'The QR wallet in the app' }, { bn: 'কিছুই না', en: 'Nothing' }], correct: 1, why: { bn: 'QR ওয়ালেটের কোড প্রতি মিনিটে বদলায়, তাই স্ক্রিনশট দিয়ে চলে না।', en: 'The wallet QR changes every minute, so a screenshot will not work.' } },
];

export const PASS_MARK = 7;

export const ROAD_SIGNS: RoadSign[] = [
  { id: 'stop', kind: 'regulatory', name: { bn: 'থামুন', en: 'Stop' }, meaning: { bn: 'স্টপ লাইনে পুরোপুরি থামুন, তারপর নিরাপদ হলে এগোন।', en: 'Stop completely at the line, then go when safe.' } },
  { id: 'no-entry', kind: 'regulatory', name: { bn: 'প্রবেশ নিষেধ', en: 'No entry' }, meaning: { bn: 'এই দিক থেকে কোনো যানবাহন প্রবেশ করতে পারবে না।', en: 'No vehicle may enter from this direction.' } },
  { id: 'speed-40', kind: 'regulatory', name: { bn: 'সর্বোচ্চ গতি ৪০', en: 'Speed limit 40' }, meaning: { bn: 'ঘণ্টায় ৪০ কিলোমিটারের বেশি গতিতে চলা যাবে না।', en: 'Do not exceed 40 km/h.' } },
  { id: 'no-horn', kind: 'regulatory', name: { bn: 'হর্ন বাজানো নিষেধ', en: 'No horn' }, meaning: { bn: 'হাসপাতাল, স্কুলসহ নীরব এলাকায় হর্ন বাজাবেন না।', en: 'Do not sound the horn, for example near hospitals and schools.' } },
  { id: 'no-parking', kind: 'regulatory', name: { bn: 'পার্কিং নিষেধ', en: 'No parking' }, meaning: { bn: 'এখানে গাড়ি রাখা যাবে না।', en: 'Do not park here.' } },
  { id: 'no-u-turn', kind: 'regulatory', name: { bn: 'ইউ-টার্ন নিষেধ', en: 'No U-turn' }, meaning: { bn: 'এখানে ঘুরে উল্টো দিকে যাওয়া যাবে না।', en: 'Do not turn back here.' } },
  { id: 'give-way', kind: 'regulatory', name: { bn: 'পথ ছেড়ে দিন', en: 'Give way' }, meaning: { bn: 'প্রধান সড়কের যানবাহনকে আগে যেতে দিন।', en: 'Let traffic on the main road go first.' } },
  { id: 'pedestrian', kind: 'warning', name: { bn: 'সামনে পথচারী পারাপার', en: 'Pedestrian crossing ahead' }, meaning: { bn: 'গতি কমান, পথচারীর জন্য থামতে প্রস্তুত থাকুন।', en: 'Slow down and be ready to stop for pedestrians.' } },
  { id: 'school', kind: 'warning', name: { bn: 'সামনে স্কুল', en: 'School ahead' }, meaning: { bn: 'শিশুরা রাস্তায় আসতে পারে; ধীরে চালান।', en: 'Children may be on the road; drive slowly.' } },
  { id: 'bend', kind: 'warning', name: { bn: 'সামনে বাঁক', en: 'Bend ahead' }, meaning: { bn: 'বাঁকের আগে গতি কমান, ওভারটেক করবেন না।', en: 'Slow down before the bend and do not overtake.' } },
  { id: 'road-works', kind: 'warning', name: { bn: 'সড়কে কাজ চলছে', en: 'Road works' }, meaning: { bn: 'শ্রমিক ও যন্ত্রপাতি থাকতে পারে; সাবধানে চালান।', en: 'Workers and machinery may be present; drive carefully.' } },
  { id: 'hospital', kind: 'information', name: { bn: 'হাসপাতাল', en: 'Hospital' }, meaning: { bn: 'কাছেই হাসপাতাল; নীরবতা বজায় রাখুন।', en: 'A hospital is nearby; keep noise down.' } },
  { id: 'parking', kind: 'information', name: { bn: 'পার্কিং', en: 'Parking' }, meaning: { bn: 'অনুমোদিত পার্কিংয়ের জায়গা।', en: 'Authorised parking area.' } },
  { id: 'one-way', kind: 'information', name: { bn: 'একমুখী সড়ক', en: 'One-way road' }, meaning: { bn: 'শুধু তীর চিহ্নের দিকে চলা যাবে।', en: 'Travel only in the direction of the arrow.' } },
];

export const GUIDES: Guide[] = [
  {
    id: 'pedestrian',
    title: { bn: 'পথচারীর নিরাপত্তা নির্দেশিকা', en: 'Pedestrian safety guide' },
    audience: { bn: 'পথচারী', en: 'Pedestrians' },
    intro: { bn: 'ঢাকার রাস্তায় হাঁটার সময় যা মনে রাখবেন।', en: 'What to keep in mind when walking in Dhaka.' },
    sections: [
      { heading: { bn: 'রাস্তা পার হওয়া', en: 'Crossing' }, points: [{ bn: 'ফুটওভার ব্রিজ, আন্ডারপাস বা জেব্রা ক্রসিং ব্যবহার করুন।', en: 'Use foot-over-bridges, underpasses or zebra crossings.' }, { bn: 'ডানে-বাঁয়ে-আবার ডানে দেখে পার হন।', en: 'Look right, left and right again before crossing.' }, { bn: 'বাস থেকে নেমে বাসের সামনে দিয়ে দৌড়ে পার হবেন না।', en: 'Never run across in front of a bus you just left.' }] },
      { heading: { bn: 'ফুটপাত', en: 'Footpaths' }, points: [{ bn: 'ফুটপাত দখল দেখলে অ্যাপে "ফুটপাত দখল" রিপোর্ট করুন।', en: 'Report blocked footpaths in the app under "Footpath encroachment".' }, { bn: 'ফুটপাত না থাকলে গাড়ির মুখোমুখি দিকে রাস্তার কিনারা দিয়ে হাঁটুন।', en: 'Where there is no footpath, walk at the edge facing oncoming traffic.' }] },
      { heading: { bn: 'রাতে', en: 'At night' }, points: [{ bn: 'হালকা রঙের পোশাক পরুন বা ফোনের আলো জ্বালান।', en: 'Wear light colours or use your phone light.' }, { bn: 'অন্ধকার মোড় এড়িয়ে আলোকিত পথ বেছে নিন।', en: 'Prefer lit streets over dark junctions.' }] },
    ],
  },
  {
    id: 'motorcycle',
    title: { bn: 'মোটরসাইকেল ও হেলমেট নিরাপত্তা', en: 'Motorcycle and helmet safety' },
    audience: { bn: 'মোটরসাইকেল চালক ও আরোহী', en: 'Riders and passengers' },
    intro: { bn: 'ঢাকায় মোটরসাইকেল দুর্ঘটনা সবচেয়ে প্রাণঘাতী। এই নিয়মগুলো জীবন বাঁচায়।', en: 'Motorcycle crashes are among the deadliest in Dhaka. These habits save lives.' },
    sections: [
      { heading: { bn: 'হেলমেট', en: 'Helmet' }, points: [{ bn: 'মানসম্মত পূর্ণ মুখের হেলমেট বেছে নিন; ফিতা লাগান।', en: 'Choose a certified full-face helmet and fasten the strap.' }, { bn: 'আরোহীর জন্যও আলাদা হেলমেট রাখুন।', en: 'Carry a separate helmet for your passenger.' }] },
      { heading: { bn: 'রাস্তায়', en: 'On the road' }, points: [{ bn: 'ফুটপাত বা উল্টো পথে চালাবেন না।', en: 'Never ride on footpaths or against traffic.' }, { bn: 'বড় গাড়ির ব্লাইন্ড স্পট এড়িয়ে চলুন।', en: "Keep out of large vehicles' blind spots." }, { bn: 'রাইড-শেয়ারে দুইজনের বেশি নয়।', en: 'No more than two people on a ride-share bike.' }] },
    ],
  },
  {
    id: 'child',
    title: { bn: 'শিশুদের সড়ক নিরাপত্তা', en: 'Road safety for children' },
    audience: { bn: 'শিশু, অভিভাবক ও শিক্ষক', en: 'Children, parents and teachers' },
    intro: { bn: 'STEP SafeRoad School-এর স্তরভিত্তিক বিষয়বস্তু।', en: 'Level-based content from STEP SafeRoad School.' },
    sections: [
      { heading: { bn: 'প্রাথমিক (১ম–৫ম)', en: 'Primary (classes 1–5)' }, points: [{ bn: 'বড়দের হাত ধরে রাস্তা পার হও।', en: "Hold an adult's hand to cross." }, { bn: 'ফুটপাতে হাঁটো; স্কুল বাসে লাইন ধরে ওঠো।', en: 'Walk on the footpath and queue to board the school bus.' }, { bn: 'মৌলিক সাইন: থামুন, পথচারী পারাপার, স্কুল।', en: 'Basic signs: stop, pedestrian crossing, school.' }] },
      { heading: { bn: 'মাধ্যমিক (৬ষ্ঠ–১০ম)', en: 'Secondary (classes 6–10)' }, points: [{ bn: 'সাইকেলে হেলমেট ও দৃশ্যমান পোশাক।', en: 'Helmet and visible clothing when cycling.' }, { bn: 'গণপরিবহনে দায়িত্বশীল যাত্রী হওয়া।', en: 'Be a responsible passenger on public transport.' }, { bn: 'ফোনে মনোযোগ নয়, রাস্তায় মনোযোগ।', en: 'Eyes on the road, not on the phone.' }] },
      { heading: { bn: 'অভিভাবক ও শিক্ষকের জন্য', en: 'For parents and teachers' }, points: [{ bn: 'স্কুলের সামনে ডাবল পার্কিং করবেন না।', en: 'Do not double-park outside schools.' }, { bn: 'ছাত্র ট্রাফিক নিরাপত্তা ক্লাব গঠনে স্কুলকে উৎসাহ দিন।', en: 'Encourage the school to form a Student Traffic Safety Club.' }] },
    ],
  },
  {
    id: 'post-accident',
    title: { bn: 'দুর্ঘটনার পর চেকলিস্ট', en: 'After-accident checklist' },
    audience: { bn: 'চালক ও নাগরিক', en: 'Drivers and citizens' },
    intro: { bn: 'ধাপে ধাপে করণীয়। জীবন আগে, গাড়ি পরে।', en: 'Step by step. Lives first, vehicles later.' },
    sections: [
      { heading: { bn: 'সঙ্গে সঙ্গে', en: 'Immediately' }, points: [{ bn: 'হ্যাজার্ড লাইট জ্বালান, ইঞ্জিন বন্ধ করুন।', en: 'Switch on hazard lights and turn off the engine.' }, { bn: 'কেউ আহত হলে ৯৯৯-এ কল করুন।', en: 'Call 999 if anyone is hurt.' }, { bn: 'নিরাপদ হলে গাড়ি রাস্তার পাশে সরান।', en: 'Move vehicles to the side if it is safe.' }] },
      { heading: { bn: 'তারপর', en: 'Then' }, points: [{ bn: 'ঘটনাস্থল, ক্ষতি ও নম্বর প্লেটের ছবি তুলুন।', en: 'Photograph the scene, the damage and number plates.' }, { bn: 'অন্য চালকের সঙ্গে তথ্য বিনিময় করুন বা যৌথ রিপোর্ট করুন।', en: 'Exchange details with the other driver or file a joint report.' }, { bn: 'সাক্ষী থাকলে নাম ও নম্বর নিন।', en: 'Note names and numbers of any witnesses.' }] },
    ],
  },
  {
    id: 'breakdown',
    title: { bn: 'গাড়ি বিকল হলে', en: 'If your vehicle breaks down' },
    audience: { bn: 'চালক', en: 'Drivers' },
    intro: { bn: 'প্রধান সড়ক বা ফ্লাইওভারে গাড়ি বিকল হলে নিরাপদ থাকার উপায়।', en: 'Staying safe when you break down on a main road or flyover.' },
    sections: [
      { heading: { bn: 'নিরাপদ থাকুন', en: 'Stay safe' }, points: [{ bn: 'যতটা সম্ভব বাঁ পাশে সরে যান, হ্যাজার্ড লাইট জ্বালান।', en: 'Pull as far left as possible and switch on hazard lights.' }, { bn: 'গাড়ির পেছনে অন্তত ৫০ মিটার দূরে সতর্কতা ত্রিভুজ রাখুন।', en: 'Place a warning triangle at least 50 m behind the vehicle.' }, { bn: 'যাত্রীদের ব্যারিয়ারের পেছনে নিরাপদে রাখুন।', en: 'Keep passengers safely behind the barrier.' }] },
      { heading: { bn: 'সাহায্য নিন', en: 'Get help' }, points: [{ bn: 'অ্যাপের জরুরি সাহায্যে "গাড়ি বিকল" বেছে নিন; নিকটস্থ ইউনিট আপনার অবস্থান পাবে।', en: 'Choose "Breakdown" in Emergency help; the nearest unit gets your location.' }, { bn: 'ফ্লাইওভারে হেঁটে চলাচল করবেন না।', en: 'Do not walk along a flyover.' }] },
    ],
  },
  {
    id: 'checkpoint',
    title: { bn: 'চেকিংয়ে থামালে', en: 'If you are stopped at a checkpoint' },
    audience: { bn: 'চালক', en: 'Drivers' },
    intro: { bn: 'শান্ত থাকুন। গাড়ি নিরাপদে পাশে রাখুন, ইঞ্জিন বন্ধ করুন। ধীরে কথা বলুন।', en: 'Stay calm. Pull over safely, switch off the engine and speak calmly.' },
    sections: [
      { heading: { bn: 'আপনি জিজ্ঞাসা করতে পারেন', en: 'You may ask' }, points: [{ bn: '"কোন আইন ভঙ্গের জন্য থামানো হয়েছে?"', en: '"Which rule am I stopped for?"' }, { bn: '"মামলা হলে POS রসিদ দেবেন কি?"', en: '"Will you give a POS receipt if there is a case?"' }, { bn: '"আপনার নাম ও পদবি জানতে পারি?"', en: '"May I know your name and rank?"' }] },
      { heading: { bn: 'মনে রাখুন', en: 'Remember' }, points: [{ bn: 'লাইসেন্স ও নিবন্ধন QR ওয়ালেট থেকে দেখাতে পারেন।', en: 'You can show your licence and registration from the QR wallet.' }, { bn: 'মামলা হলে কিছুক্ষণের মধ্যে অ্যাপে দেখা যাবে।', en: 'Any case will appear in the app shortly.' }, { bn: 'জরিমানা কাউকে নগদে দেবেন না; শুধু অফিসিয়াল মাধ্যমে।', en: 'Never pay a fine in cash; only through official channels.' }, { bn: 'দ্বিমত থাকলে পরে অ্যাপে আপত্তি জানাতে পারবেন।', en: 'If you disagree, you can object in the app later.' }] },
    ],
  },
];
