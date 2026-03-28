// SAFE SCRIPT: Only adds Diagnostic Tests without affecting other data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Adding Diagnostic Tests (SAFE - no other data affected)...');

    // Check if tests already exist
    const existingCount = await prisma.diagnosticTest.count();
    if (existingCount > 0) {
        console.log(`⚠️ Found ${existingCount} existing diagnostic tests.`);
        console.log('   Skipping to avoid duplicates. Delete existing tests first if you want to re-seed.');
        return;
    }

    const diagnosticTests = [
        // Blood Tests
        { name: 'Complete Blood Count (CBC)', description: 'Measures various blood components including red cells, white cells, and platelets', price: 500, category: 'Blood Tests' },
        { name: 'Blood Glucose Fasting', description: 'Measures blood sugar levels after 8-12 hours of fasting', price: 200, category: 'Blood Tests' },
        { name: 'Blood Glucose PP', description: 'Measures blood sugar 2 hours after a meal', price: 200, category: 'Blood Tests' },
        { name: 'HbA1c (Glycated Hemoglobin)', description: 'Average blood glucose over past 2-3 months', price: 800, category: 'Blood Tests' },
        { name: 'Lipid Profile', description: 'Measures cholesterol, triglycerides, HDL, LDL', price: 800, category: 'Blood Tests' },
        { name: 'Liver Function Test (LFT)', description: 'Panel of tests to assess liver health', price: 1200, category: 'Blood Tests' },
        { name: 'Kidney Function Test (KFT)', description: 'Measures creatinine, BUN, and other kidney markers', price: 1000, category: 'Blood Tests' },
        { name: 'Thyroid Profile (T3, T4, TSH)', description: 'Complete thyroid hormone panel', price: 1500, category: 'Blood Tests' },
        { name: 'Vitamin D Test', description: 'Measures Vitamin D (25-OH) levels', price: 1800, category: 'Blood Tests' },
        { name: 'Vitamin B12', description: 'Measures Vitamin B12 levels in blood', price: 1200, category: 'Blood Tests' },
        { name: 'Iron Studies', description: 'Serum iron, ferritin, TIBC panel', price: 1000, category: 'Blood Tests' },
        { name: 'ESR (Erythrocyte Sedimentation Rate)', description: 'Inflammation marker test', price: 150, category: 'Blood Tests' },
        { name: 'CRP (C-Reactive Protein)', description: 'Inflammation and infection marker', price: 600, category: 'Blood Tests' },
        { name: 'Blood Group & Rh Typing', description: 'Determines ABO blood group and Rh factor', price: 300, category: 'Blood Tests' },
        { name: 'Hemoglobin (Hb)', description: 'Measures hemoglobin concentration', price: 100, category: 'Blood Tests' },

        // Urine Tests
        { name: 'Urine Routine Examination', description: 'Complete urine analysis including physical, chemical, microscopic', price: 200, category: 'Urine Tests' },
        { name: 'Urine Culture & Sensitivity', description: 'Identifies bacteria and antibiotic sensitivity', price: 800, category: 'Urine Tests' },
        { name: 'Microalbumin (Urine)', description: 'Early kidney damage detection test', price: 600, category: 'Urine Tests' },

        // Imaging
        { name: 'Chest X-Ray', description: 'Standard PA view chest radiograph', price: 500, category: 'Imaging' },
        { name: 'X-Ray Spine', description: 'Spinal radiograph (cervical/lumbar)', price: 800, category: 'Imaging' },
        { name: 'Ultrasound Abdomen', description: 'Complete abdominal ultrasound scan', price: 1500, category: 'Imaging' },
        { name: 'Ultrasound Pelvis', description: 'Pelvic ultrasound for lower abdomen', price: 1200, category: 'Imaging' },
        { name: 'ECG (Electrocardiogram)', description: '12-lead resting ECG', price: 400, category: 'Cardiac' },
        { name: 'Echo (2D Echocardiography)', description: 'Heart ultrasound with Doppler', price: 2500, category: 'Cardiac' },
        { name: 'TMT (Treadmill Test)', description: 'Stress test for cardiac evaluation', price: 2000, category: 'Cardiac' },

        // Packages
        { name: 'Basic Health Checkup', description: 'CBC, Blood Sugar, Lipid Profile, LFT, KFT, Urine', price: 2500, category: 'Health Packages' },
        { name: 'Comprehensive Health Checkup', description: 'Full body checkup with 40+ parameters', price: 5000, category: 'Health Packages' },
        { name: 'Diabetes Care Package', description: 'Fasting sugar, PP sugar, HbA1c, KFT, Lipid Profile', price: 2000, category: 'Health Packages' },
        { name: 'Cardiac Health Package', description: 'Lipid Profile, ECG, Echo, Stress Test', price: 4500, category: 'Health Packages' },
        { name: 'Thyroid Care Package', description: 'Complete thyroid panel with antibodies', price: 2200, category: 'Health Packages' },

        // Special Tests
        { name: 'COVID-19 RT-PCR', description: 'SARS-CoV-2 detection by PCR', price: 1500, category: 'Special Tests' },
        { name: 'Dengue NS1 Antigen', description: 'Early dengue detection test', price: 800, category: 'Special Tests' },
        { name: 'Dengue IgG/IgM', description: 'Dengue antibody detection', price: 1000, category: 'Special Tests' },
        { name: 'Hepatitis B Surface Antigen', description: 'HBsAg screening test', price: 500, category: 'Special Tests' },
        { name: 'HIV 1 & 2 Antibody', description: 'HIV screening test', price: 600, category: 'Special Tests' },
    ];

    await prisma.diagnosticTest.createMany({
        data: diagnosticTests,
    });

    console.log('✅ Created 35 diagnostic tests successfully!');
    console.log('   Your existing doctors, patients, and other data are UNCHANGED.');
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
