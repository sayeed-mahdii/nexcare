// Seed script for diagnostic tests
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const diagnosticTests = [
    // Blood Tests
    { name: 'Complete Blood Count (CBC)', description: 'Measures different components of blood including red blood cells, white blood cells, and platelets', price: 500, category: 'Blood Tests' },
    { name: 'Blood Glucose Fasting', description: 'Measures blood sugar levels after fasting for 8-12 hours', price: 200, category: 'Blood Tests' },
    { name: 'Blood Glucose Random', description: 'Measures blood sugar levels at any time', price: 180, category: 'Blood Tests' },
    { name: 'HbA1c (Glycated Hemoglobin)', description: 'Measures average blood sugar over past 2-3 months', price: 800, category: 'Blood Tests' },
    { name: 'Lipid Profile', description: 'Measures cholesterol levels including HDL, LDL, and triglycerides', price: 900, category: 'Blood Tests' },
    { name: 'Liver Function Test (LFT)', description: 'Assesses liver health through various enzyme and protein levels', price: 1200, category: 'Blood Tests' },
    { name: 'Kidney Function Test (KFT)', description: 'Evaluates kidney function through creatinine and urea levels', price: 1000, category: 'Blood Tests' },
    { name: 'Thyroid Profile (T3, T4, TSH)', description: 'Measures thyroid hormone levels', price: 1500, category: 'Blood Tests' },
    { name: 'Vitamin D', description: 'Measures vitamin D levels in blood', price: 1800, category: 'Blood Tests' },
    { name: 'Vitamin B12', description: 'Measures vitamin B12 levels', price: 1200, category: 'Blood Tests' },

    // Urine Tests
    { name: 'Urine Routine & Microscopy', description: 'Complete urine analysis including physical, chemical, and microscopic examination', price: 300, category: 'Urine Tests' },
    { name: 'Urine Culture & Sensitivity', description: 'Identifies bacteria in urine and determines antibiotic sensitivity', price: 800, category: 'Urine Tests' },
    { name: '24-Hour Urine Protein', description: 'Measures protein levels in urine collected over 24 hours', price: 600, category: 'Urine Tests' },

    // Imaging
    { name: 'X-Ray Chest PA View', description: 'Chest X-ray posteroanterior view', price: 500, category: 'Imaging' },
    { name: 'X-Ray Spine', description: 'Spinal X-ray examination', price: 700, category: 'Imaging' },
    { name: 'Ultrasound Abdomen', description: 'Abdominal ultrasound including liver, kidney, spleen', price: 1500, category: 'Imaging' },
    { name: 'Ultrasound Pelvis', description: 'Pelvic ultrasound examination', price: 1200, category: 'Imaging' },
    { name: 'ECG (Electrocardiogram)', description: 'Records electrical activity of the heart', price: 400, category: 'Imaging' },
    { name: 'Echo (Echocardiogram)', description: 'Ultrasound of the heart', price: 3000, category: 'Imaging' },

    // Pathology
    { name: 'Stool Routine & Microscopy', description: 'Complete stool analysis', price: 300, category: 'Pathology' },
    { name: 'Sputum Culture', description: 'Identifies bacteria in sputum', price: 700, category: 'Pathology' },
    { name: 'Pap Smear', description: 'Cervical cancer screening test', price: 800, category: 'Pathology' },

    // Cardiac Tests
    { name: 'Troponin I', description: 'Cardiac marker for heart attack', price: 1500, category: 'Cardiac Tests' },
    { name: 'BNP (Brain Natriuretic Peptide)', description: 'Heart failure marker', price: 2000, category: 'Cardiac Tests' },

    // Infectious Disease
    { name: 'Dengue NS1 Antigen', description: 'Early detection of dengue fever', price: 1200, category: 'Infectious Disease' },
    { name: 'Dengue IgM/IgG', description: 'Dengue antibody test', price: 1000, category: 'Infectious Disease' },
    { name: 'Typhoid (Widal Test)', description: 'Typhoid fever detection', price: 400, category: 'Infectious Disease' },
    { name: 'COVID-19 RT-PCR', description: 'COVID-19 detection test', price: 2500, category: 'Infectious Disease' },
    { name: 'COVID-19 Rapid Antigen', description: 'Quick COVID-19 screening', price: 500, category: 'Infectious Disease' },

    // Health Packages
    { name: 'Basic Health Checkup', description: 'CBC, Blood Sugar, Urine Routine, Lipid Profile', price: 2500, category: 'Health Packages' },
    { name: 'Comprehensive Health Checkup', description: 'Full body checkup including all major tests', price: 5000, category: 'Health Packages' },
    { name: 'Diabetic Health Package', description: 'HbA1c, Fasting Sugar, KFT, Lipid Profile, Urine Routine', price: 3500, category: 'Health Packages' },
    { name: 'Cardiac Health Package', description: 'Lipid Profile, ECG, Echo, Troponin, Blood Sugar', price: 6000, category: 'Health Packages' },
];

async function seedDiagnosticTests() {
    console.log('🧪 Seeding diagnostic tests...');

    for (const test of diagnosticTests) {
        await prisma.diagnosticTest.upsert({
            where: { id: test.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
            update: test,
            create: test,
        });
    }

    console.log(`✅ Seeded ${diagnosticTests.length} diagnostic tests`);
}

seedDiagnosticTests()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
