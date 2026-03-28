const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // Clear existing data
    await prisma.labReport.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.doctorSpecialty.deleteMany();
    await prisma.doctor.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.pathologist.deleteMany();
    await prisma.user.deleteMany();
    await prisma.specialty.deleteMany();
    await prisma.department.deleteMany();
    await prisma.laboratory.deleteMany();
    await prisma.branch.deleteMany();
    await prisma.location.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Create Locations
    const location1 = await prisma.location.create({
        data: {
            name: 'Chittagong Main',
            city: 'Chittagong',
            state: 'Chittagong Division',
            zipCode: '4331',
        },
    });

    const location2 = await prisma.location.create({
        data: {
            name: 'Dhaka Central',
            city: 'Dhaka',
            state: 'Dhaka Division',
            zipCode: '1000',
        },
    });

    console.log('📍 Created locations');

    // Create Branches
    const branch1 = await prisma.branch.create({
        data: {
            name: 'NEXCARE Main Hospital',
            phone: '+880 31-123-4567',
            locationId: location1.id,
        },
    });

    const branch2 = await prisma.branch.create({
        data: {
            name: 'NEXCARE Dhaka Center',
            phone: '+880 2-123-4567',
            locationId: location2.id,
        },
    });

    console.log('🏥 Created branches');

    // Create Departments (18 total)
    const departments = await Promise.all([
        // Branch 1 departments
        prisma.department.create({ data: { name: 'Cardiology', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Neurology', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Orthopedics', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Pediatrics', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'General Medicine', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Gastroenterology', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Pulmonology', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Nephrology', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Oncology', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Psychiatry', branchId: branch1.id } }),
        prisma.department.create({ data: { name: 'Emergency Medicine', branchId: branch1.id } }),
        // Branch 2 departments
        prisma.department.create({ data: { name: 'Ophthalmology', branchId: branch2.id } }),
        prisma.department.create({ data: { name: 'Dermatology', branchId: branch2.id } }),
        prisma.department.create({ data: { name: 'ENT', branchId: branch2.id } }),
        prisma.department.create({ data: { name: 'Gynecology', branchId: branch2.id } }),
        prisma.department.create({ data: { name: 'Urology', branchId: branch2.id } }),
        prisma.department.create({ data: { name: 'Rheumatology', branchId: branch2.id } }),
        prisma.department.create({ data: { name: 'Endocrinology', branchId: branch2.id } }),
    ]);

    console.log('🏢 Created 18 departments');

    // Create Laboratories
    const lab1 = await prisma.laboratory.create({
        data: {
            name: 'Central Pathology Lab',
            labType: 'Pathology',
            branchId: branch1.id,
        },
    });

    const lab2 = await prisma.laboratory.create({
        data: {
            name: 'Radiology Center',
            labType: 'Radiology',
            branchId: branch1.id,
        },
    });

    console.log('🔬 Created laboratories');

    // Create Specialties
    const specialties = await Promise.all([
        prisma.specialty.create({ data: { name: 'Heart Surgery' } }),
        prisma.specialty.create({ data: { name: 'Interventional Cardiology' } }),
        prisma.specialty.create({ data: { name: 'Brain Surgery' } }),
        prisma.specialty.create({ data: { name: 'Spine Surgery' } }),
        prisma.specialty.create({ data: { name: 'Joint Replacement' } }),
    ]);

    console.log('⭐ Created specialties');

    // Hash password
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create Admin User
    const adminUser = await prisma.user.create({
        data: {
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@nexcare.com',
            password: hashedPassword,
            role: 'Administrator',
            phone: '+880 1700-000001',
            gender: 'Male',
        },
    });

    // Create Second Admin (Tanjim)
    const adminPassword2 = await bcrypt.hash('admin1234@#!', 10);
    await prisma.user.create({
        data: {
            firstName: 'Tanjim',
            lastName: 'Admin',
            email: 'tanjimjrcsecu@gmail.com',
            password: adminPassword2,
            role: 'Administrator',
            phone: '+880 1700-000002',
            gender: 'Male',
        },
    });

    console.log('👤 Created admin users');

    // Create Doctors
    const doctorData = [
        { firstName: 'Rahman', lastName: 'Ahmed', email: 'dr.rahman@nexcare.com', deptIndex: 0, exp: 15, qual: 'MBBS, MD (Cardiology)' },
        { firstName: 'Fatima', lastName: 'Khan', email: 'dr.fatima@nexcare.com', deptIndex: 1, exp: 12, qual: 'MBBS, MS (Neurology)' },
        { firstName: 'Karim', lastName: 'Hossain', email: 'dr.karim@nexcare.com', deptIndex: 2, exp: 18, qual: 'MBBS, MS (Orthopedics)' },
        { firstName: 'Amina', lastName: 'Begum', email: 'dr.amina@nexcare.com', deptIndex: 3, exp: 10, qual: 'MBBS, MD (Pediatrics)' },
        { firstName: 'Jamal', lastName: 'Uddin', email: 'dr.jamal@nexcare.com', deptIndex: 4, exp: 8, qual: 'MBBS' },
    ];

    const doctors = [];
    for (const doc of doctorData) {
        const user = await prisma.user.create({
            data: {
                firstName: doc.firstName,
                lastName: doc.lastName,
                email: doc.email,
                password: hashedPassword,
                role: 'Doctor',
                phone: '+880 1700-' + Math.floor(100000 + Math.random() * 900000),
                gender: doc.firstName === 'Fatima' || doc.firstName === 'Amina' ? 'Female' : 'Male',
            },
        });

        const doctor = await prisma.doctor.create({
            data: {
                userId: user.id,
                departmentId: departments[doc.deptIndex].id,
                qualification: doc.qual,
                experienceYears: doc.exp,
                isApproved: true, // Seeded doctors are pre-approved
                approvedAt: new Date(),
            },
        });

        doctors.push(doctor);
    }

    console.log('👨‍⚕️ Created doctors');

    // Create Patients
    const patientData = [
        { firstName: 'Rahim', lastName: 'Ahmed', email: 'rahim@email.com' },
        { firstName: 'Kamal', lastName: 'Hasan', email: 'kamal@email.com' },
        { firstName: 'Nasreen', lastName: 'Akter', email: 'nasreen@email.com' },
        { firstName: 'Tariq', lastName: 'Rahman', email: 'tariq@email.com' },
        { firstName: 'Shirin', lastName: 'Chowdhury', email: 'shirin@email.com' },
    ];

    const patients = [];
    for (const pat of patientData) {
        const user = await prisma.user.create({
            data: {
                firstName: pat.firstName,
                lastName: pat.lastName,
                email: pat.email,
                password: hashedPassword,
                role: 'Patient',
                phone: '+880 1800-' + Math.floor(100000 + Math.random() * 900000),
                gender: pat.firstName === 'Nasreen' || pat.firstName === 'Shirin' ? 'Female' : 'Male',
            },
        });

        const patient = await prisma.patient.create({
            data: {
                userId: user.id,
                medicalHistory: 'No known allergies. Regular check-ups.',
            },
        });

        patients.push(patient);
    }

    console.log('🏃 Created patients');

    // Create Pathologist
    const pathologistUser = await prisma.user.create({
        data: {
            firstName: 'Samira',
            lastName: 'Islam',
            email: 'pathologist@nexcare.com',
            password: hashedPassword,
            role: 'Pathologist',
            phone: '+880 1900-000001',
            gender: 'Female',
        },
    });

    const pathologist = await prisma.pathologist.create({
        data: {
            userId: pathologistUser.id,
            qualification: 'MBBS, MD (Pathology)',
            specialization: 'Clinical Pathology',
        },
    });

    console.log('🔬 Created pathologist');

    // Create Sample Appointments
    const today = new Date();
    const appointmentDates = [
        new Date(today.setDate(today.getDate() + 1)),
        new Date(today.setDate(today.getDate() + 2)),
        new Date(today.setDate(today.getDate() + 3)),
    ];

    for (let i = 0; i < 5; i++) {
        await prisma.appointment.create({
            data: {
                patientId: patients[i % patients.length].id,
                doctorId: doctors[i % doctors.length].id,
                branchId: branch1.id,
                appointmentDate: appointmentDates[i % 3],
                appointmentTime: ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'][i],
                status: i < 2 ? 'Scheduled' : i < 4 ? 'Completed' : 'Cancelled',
                notes: 'Regular checkup appointment',
            },
        });
    }

    console.log('📅 Created appointments');

    // Create Sample Lab Reports
    for (let i = 0; i < 3; i++) {
        await prisma.labReport.create({
            data: {
                patientId: patients[i].id,
                pathologistId: pathologist.id,
                labId: lab1.id,
                reportName: ['Complete Blood Count', 'Lipid Profile', 'Liver Function Test'][i],
                reportDate: new Date(),
                filePath: `/reports/report-${i + 1}.pdf`,
                status: i < 2 ? 'Completed' : 'Pending',
                notes: 'Sample lab report notes',
            },
        });
    }

    console.log('📋 Created lab reports');

    // Create Diagnostic Tests (for Guest Booking / Public Diagnostic Center)
    await prisma.guestBookingItem.deleteMany();
    await prisma.guestBooking.deleteMany();
    await prisma.diagnosticTest.deleteMany();

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

    console.log('🧪 Created 35 diagnostic tests for guest booking');

    // Create Tests (Master Table)
    await prisma.test.deleteMany();

    // General Tests (available to all departments)
    const generalTests = await Promise.all([
        prisma.test.create({
            data: {
                name: 'Complete Blood Count (CBC)',
                category: 'LAB',
                isGeneral: true,
                isMandatory: false,
                inputType: 'NUMERIC',
                unit: 'cells/mcL',
                referenceRange: 'RBC: 4.5-5.5, WBC: 4000-11000',
                price: 500,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Blood Glucose (Fasting)',
                category: 'LAB',
                isGeneral: true,
                isMandatory: false,
                inputType: 'NUMERIC',
                unit: 'mg/dL',
                referenceRange: '70-100',
                price: 200,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Liver Function Test (LFT)',
                category: 'LAB',
                isGeneral: true,
                isMandatory: false,
                inputType: 'NUMERIC',
                unit: 'U/L',
                referenceRange: 'ALT: 7-56, AST: 10-40',
                price: 1200,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Kidney Function Test (KFT)',
                category: 'LAB',
                isGeneral: true,
                isMandatory: false,
                inputType: 'NUMERIC',
                unit: 'mg/dL',
                referenceRange: 'Creatinine: 0.6-1.2, BUN: 7-20',
                price: 1000,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Urine Routine Examination',
                category: 'LAB',
                isGeneral: true,
                isMandatory: false,
                inputType: 'TEXT',
                price: 300,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Chest X-Ray',
                category: 'IMAGING',
                isGeneral: true,
                isMandatory: false,
                inputType: 'FILE',
                price: 800,
                requiresPathologist: true,
            },
        }),
    ]);

    console.log('🧪 Created general tests');

    // Department-specific Tests (Cardiology)
    const cardiologyDept = departments[0]; // Cardiology
    await Promise.all([
        prisma.test.create({
            data: {
                name: 'ECG (Electrocardiogram)',
                category: 'PROCEDURE',
                isGeneral: false,
                isMandatory: true,
                departmentId: cardiologyDept.id,
                inputType: 'FILE',
                price: 600,
                requiresPathologist: false,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Echocardiography (2D Echo)',
                category: 'IMAGING',
                isGeneral: false,
                isMandatory: false,
                departmentId: cardiologyDept.id,
                inputType: 'FILE',
                price: 2500,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Lipid Profile',
                category: 'LAB',
                isGeneral: false,
                isMandatory: true,
                departmentId: cardiologyDept.id,
                inputType: 'NUMERIC',
                unit: 'mg/dL',
                referenceRange: 'Total: <200, LDL: <100, HDL: >40',
                price: 800,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Troponin T',
                category: 'LAB',
                isGeneral: false,
                isMandatory: false,
                departmentId: cardiologyDept.id,
                inputType: 'NUMERIC',
                unit: 'ng/mL',
                referenceRange: '<0.01',
                price: 1500,
                requiresPathologist: true,
            },
        }),
    ]);

    console.log('❤️ Created cardiology tests');

    // Department-specific Tests (Neurology)
    const neurologyDept = departments[1]; // Neurology
    await Promise.all([
        prisma.test.create({
            data: {
                name: 'MRI Brain',
                category: 'IMAGING',
                isGeneral: false,
                isMandatory: false,
                departmentId: neurologyDept.id,
                inputType: 'FILE',
                price: 8000,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'CT Scan Head',
                category: 'IMAGING',
                isGeneral: false,
                isMandatory: true,
                departmentId: neurologyDept.id,
                inputType: 'FILE',
                price: 4000,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'EEG (Electroencephalogram)',
                category: 'PROCEDURE',
                isGeneral: false,
                isMandatory: false,
                departmentId: neurologyDept.id,
                inputType: 'FILE',
                price: 2000,
                requiresPathologist: false,
            },
        }),
    ]);

    console.log('🧠 Created neurology tests');

    // Department-specific Tests (Orthopedics)
    const orthopedicsDept = departments[2]; // Orthopedics
    await Promise.all([
        prisma.test.create({
            data: {
                name: 'X-Ray Spine',
                category: 'IMAGING',
                isGeneral: false,
                isMandatory: true,
                departmentId: orthopedicsDept.id,
                inputType: 'FILE',
                price: 1000,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'MRI Knee',
                category: 'IMAGING',
                isGeneral: false,
                isMandatory: false,
                departmentId: orthopedicsDept.id,
                inputType: 'FILE',
                price: 6000,
                requiresPathologist: true,
            },
        }),
        prisma.test.create({
            data: {
                name: 'Bone Density Scan (DEXA)',
                category: 'PROCEDURE',
                isGeneral: false,
                isMandatory: false,
                departmentId: orthopedicsDept.id,
                inputType: 'NUMERIC',
                unit: 'T-score',
                referenceRange: '>-1.0 Normal',
                price: 3000,
                requiresPathologist: true,
            },
        }),
    ]);

    console.log('🦴 Created orthopedics tests');

    console.log('✅ Seed completed successfully!');
    console.log('\n📝 Demo Accounts:');
    console.log('   Admin: admin@nexcare.com / Password123!');
    console.log('   Doctor: dr.rahman@nexcare.com / Password123!');
    console.log('   Patient: rahim@email.com / Password123!');
    console.log('   Pathologist: pathologist@nexcare.com / Password123!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
