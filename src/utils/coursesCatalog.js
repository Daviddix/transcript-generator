// Standard course catalog for Health Sciences & Technology Programs
export const COURSE_CATALOG = {
  // Public Health & Environmental Health
  'PUB121': 'Introduction to Primary Health Care',
  'PUB122': 'Community Health Assessment & Diagnosis',
  'PUB123': 'Environmental Sanitation & Hygiene',
  'PUB124': 'Health Education & Communication',
  'PUB125': 'Introduction to Epidemiology & Disease Control',
  'PUB126': 'Maternal, Infant & Child Health',
  'PUB127': 'Occupational Health & Industrial Safety',
  'PUB128': 'Field Practical Experience & Community Survey',
  'PUB211': 'Primary Health Care Practice & Management I',
  'PUB212': 'Communicable & Non-Communicable Diseases',
  'PUB215': 'Health Information Systems & Vital Statistics',
  'PUB220': 'Health Planning & Community Development',
  'PUB221': 'Primary Health Care Practice & Management II',
  'PUB222': 'Applied Epidemiology & Biostatistics',
  'PUB223': 'School Health & Adolescent Nutrition',
  'PUB224': 'Health Services Administration & Ethics',
  'PUB225': 'Demography & Population Dynamics',
  'PUB226': 'Disaster & Emergency Health Management',
  'PUB227': 'Mental Health & Substance Abuse Prevention',
  'PUB228': 'Community Rehabilitation & Geriatric Care',
  'PUB229': 'Community Health Research Project',
  'EHT101': 'Introduction to Environmental Health',
  'EHT111': 'Fundamentals of Environmental Health',
  'EHT146': 'Environmental Health Practical & Fieldwork',
  'PHT111': 'Introduction to Public Health Technology',
  'GHT132': 'Global Health & Environmental Threats',
  'HET101': 'Human Ecology & Health Ecosystems',
  'HET106': 'Health Extension Techniques & Outreach',
  'HET109': 'Community Health Extension Practice',

  // Medical Laboratory Technology
  'MLT301': 'Clinical Chemistry & Diagnostic Enzymology',
  'MLT303': 'Medical Microbiology & Bacteriology',
  'MLT305': 'Haematology & Blood Transfusion Science',
  'MLT307': 'Histopathology & Cytological Techniques',
  'MLT309': 'Medical Parasitology & Entomology',
  'MLT311': 'Clinical Immunology & Serology',
  'MLT313': 'Laboratory Management & Quality Assurance',
  'LAB101': 'Basic Medical Laboratory Techniques',
  'FAP102': 'First Aid & Patient Triage Procedures',

  // Basic Sciences
  'ANA221': 'Human Anatomy & Applied Physiology',
  'BCH111': 'General Biochemistry & Bio-molecules',
  'BCH211': 'Clinical Biochemistry & Metabolic Pathways',
  'BIO101': 'General Biology I (Botany & Zoology)',
  'BIO102': 'General Biology II (Cytology & Genetics)',
  'CHE112': 'General Inorganic & Physical Chemistry',
  'CHE116': 'Practical Chemistry & Quantitative Analysis',
  'CHE121': 'Organic Chemistry for Health Sciences',
  'CHE123': 'Pharmaceutical Chemistry & Solutions',
  'CHE125': 'Applied Organic Chemistry & Stereochemistry',
  'CHE146': 'Analytical Chemistry & Instrumentation',
  'CHM102': 'Introductory General Chemistry',
  'MCB211': 'General Microbiology & Microbial Ecology',
  'PHY101': 'General Physics I (Mechanics & Heat)',
  'PHY102': 'General Physics II (Electricity & Optics)',

  // General Studies & Quantitative
  'COM111': 'Introduction to Computing & Information Technology',
  'CSC102': 'Computer Applications in Health Sciences',
  'ELS102': 'English Language & Communication Skills II',
  'ENG121': 'Use of English & Scientific Communication',
  'GNS102': 'Citizenship Education & Social Studies',
  'GNS111': 'Use of English & Communication Skills I',
  'GNS121': 'African History, Peace & Conflict Studies',
  'GNS122': 'Philosophy & Logic',
  'GNS211': 'Entrepreneurship Development Studies I',
  'GNS220': 'Peace Studies & Conflict Resolution',
  'GST102': 'Nigerian Peoples and Culture',
  'MTH101': 'General Mathematics I (Algebra & Trigonometry)',
  'MTH102': 'General Mathematics II (Calculus & Vectors)',
  'MTH211': 'Health Biostatistics & Probability',
  'SEM301': 'Seminar Presentation & Scientific Writing',
};

// Helper to look up course title by code
export function getCourseTitle(code, customDict = {}) {
  if (!code) return 'N/A';
  const clean = code.trim().replace(/\s+/g, '').toUpperCase();
  if (customDict[clean]) return customDict[clean];
  if (COURSE_CATALOG[clean]) return COURSE_CATALOG[clean];
  return `${clean} Course`;
}
