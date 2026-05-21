import { PrismaClient, AttendanceStatus, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in the environment.");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const CLASSES_DATA = [
  { name: "Class 6", teacher: "Mrs. Zainab Qureshi" },
  { name: "Class 7", teacher: "Mr. Ahmed Khan" },
  { name: "Class 8", teacher: "Mrs. Aisha Bibi" },
  { name: "Class 10", teacher: "Mr. Bilal Malik" },
];

const STUDENT_NAMES_BY_CLASS: Record<string, string[]> = {
  "Class 6": [
    "Muhammad Hamza", "Fatima Bashir", "Ahmed Raza", "Ayesha Siddiqua", "Bilal Khan",
    "Zainab Malik", "Zain Ul Abideen", "Maryam Jamil", "Fawad Ahmed", "Aliza Shah"
  ],
  "Class 7": [
    "Usman Tariq", "Sadia Bibi", "Junaid Iqbal", "Sana Mir", "Fawad Khan",
    "Hina Qureshi", "Asad Mahmood", "Zoya Farooq", "Haris Sohail", "Nadia Khan"
  ],
  "Class 8": [
    "Omer Sheikh", "Anum Fayyaz", "Saad Rehman", "Saba Qamar", "Shahbaz Sharif",
    "Kiran Shehzadi", "Imran Abbasi", "Mahnoor Baloch", "Ali Akbar", "Sara Ahmed"
  ],
  "Class 10": [
    "Hamza Yousaf", "Bushra Bibi", "Mustafa Qadri", "Hiba Fatima", "Waleed Khalid",
    "Amna Sohail", "Danish Ali", "Rimsha Malik", "Tayyab Raza", "Laiba Khan"
  ]
};

const SUBJECTS = ["English", "Mathematics", "Science", "Urdu", "Islamiyat"];

// Helper function to get dates for the last 30 calendar days, excluding Sundays
function getAttendanceDates(count = 30): Date[] {
  const dates: Date[] = [];
  const current = new Date();
  let offset = 1;

  while (dates.length < count) {
    const d = new Date();
    d.setDate(current.getDate() - offset);
    d.setHours(9, 0, 0, 0); // School starts at 9:00 AM
    
    // 0 is Sunday. Let's exclude Sundays to make the school attendance realistic
    if (d.getDay() !== 0) {
      dates.push(d);
    }
    offset++;
  }
  return dates.reverse(); // Return from oldest to newest date
}

// Helper to get random exam dates in the last 15 days
function getRandomExamDate(): Date {
  const date = new Date();
  const daysAgo = Math.floor(Math.random() * 15) + 1;
  date.setDate(date.getDate() - daysAgo);
  date.setHours(10, 0, 0, 0);
  return date;
}

// Helper to determine a status based on realistic probability: 85% Present, 10% Absent, 5% Late
function getRandomAttendanceStatus(): AttendanceStatus {
  const rand = Math.random();
  if (rand < 0.85) return AttendanceStatus.present;
  if (rand < 0.95) return AttendanceStatus.absent;
  return AttendanceStatus.late;
}

async function main() {
  console.log("🧹 Cleaning existing database records...");
  
  // Clean tables in reverse dependency order
  await prisma.fee.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.class.deleteMany();
  await prisma.user.deleteMany();
  await prisma.notice.deleteMany();
  
  console.log("🌱 Database cleaned. Starting fresh seeding...");

  // 0. Create Core Users
  const adminPass = await bcrypt.hash("admin123", 10);
  const teacherPass = await bcrypt.hash("teacher123", 10);
  const studentPass = await bcrypt.hash("student123", 10);
  const parentPass = await bcrypt.hash("parent123", 10);

  await prisma.user.createMany({
    data: [
      { name: "System Admin", email: "admin@edunexus.com", password: adminPass, role: Role.ADMIN },
      { name: "Staff Member", email: "teacher@edunexus.com", password: teacherPass, role: Role.TEACHER },
      { name: "Demo Student", email: "student@edunexus.com", password: studentPass, role: Role.STUDENT },
      { name: "Demo Parent", email: "parent@edunexus.com", password: parentPass, role: Role.PARENT },
    ]
  });
  console.log("👤 Default users created (admin, teacher, student, parent).");

  // 0.5 Create Notices
  await prisma.notice.createMany({
    data: [
      { title: "Exam Schedule Released", content: "The mid-term exam schedule has been released for all classes. Please check the student portal for details.", postedBy: "Admin" },
      { title: "Parent-Teacher Meeting", content: "The monthly PTM will be held next Friday. All parents are requested to attend.", postedBy: "Admin" },
      { title: "Annual Sports Day", content: "Our annual sports day is scheduled for next month. Students interested in participating must submit their names to their class teachers.", postedBy: "Admin" },
      { title: "Fee Submission Deadline", content: "A reminder to all parents to please submit all pending fees by the 10th of this month.", postedBy: "Admin" },
      { title: "Winter Vacations", content: "Winter vacations will officially begin from December 24th.", postedBy: "Admin" },
    ]
  });
  console.log("📢 Notice board populated with 5 records.");

  const attendanceDates = getAttendanceDates(30);
  console.log(`📅 Generated ${attendanceDates.length} school days for attendance tracking.`);

  for (const classInfo of CLASSES_DATA) {
    // 1. Create Class
    const createdClass = await prisma.class.create({
      data: {
        name: classInfo.name,
        teacher: classInfo.teacher,
      },
    });
    console.log(`🏫 Created Class: ${createdClass.name}`);

    // 1.5 Create Teacher mapped to Class
    const cleanTeacherEmail = `${classInfo.teacher.toLowerCase().replace(/[\s.]+/g, "")}@edunexus.com`;
    const createdTeacher = await prisma.teacher.create({
      data: {
        name: classInfo.teacher,
        email: cleanTeacherEmail,
        subject: "General Sciences",
        classId: createdClass.id
      }
    });
    console.log(`👨‍🏫 Assigned Teacher: ${createdTeacher.name} to ${createdClass.name}`);

    const studentNames = STUDENT_NAMES_BY_CLASS[classInfo.name] || [];

    for (const studentName of studentNames) {
      // 2. Create Student with extended profile data
      const student = await prisma.student.create({
        data: {
          name: studentName,
          classId: createdClass.id,
          parentEmail: `parent.of.${studentName.toLowerCase().replace(/\s+/g, "")}@example.com`,
          phone: "+92-300-0000000",
          address: "123 School Lane, Karachi"
        },
      });

      // 3. Generate 30 days of attendance
      const attendanceData = attendanceDates.map((date) => ({
        studentId: student.id,
        date: date,
        status: getRandomAttendanceStatus(),
      }));

      await prisma.attendance.createMany({
        data: attendanceData,
      });

      // 4. Generate 5 subject grades
      let totalScore = 0;
      const gradesData = SUBJECTS.map((subject) => {
        // Realistic Pakistani school grading range: 50 to 100
        const score = Math.floor(Math.random() * 51) + 50; 
        totalScore += score;

        return {
          studentId: student.id,
          subject: subject,
          score: score,
          examDate: getRandomExamDate(),
        };
      });

      await prisma.grade.createMany({
        data: gradesData,
      });

      // 5. Calculate final average and update the student profile
      const average = parseFloat((totalScore / SUBJECTS.length).toFixed(2));
      await prisma.student.update({
        where: { id: student.id },
        data: { gradeAvg: average },
      });

      // 6. Generate Fee Record
      const isPaid = Math.random() > 0.4; // 60% chance of paid
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 10);
      
      await prisma.fee.create({
        data: {
          studentId: student.id,
          amount: 5000.0,
          paid: isPaid,
          dueDate: dueDate,
          paidAt: isPaid ? new Date() : null
        }
      });
    }
    console.log(`👤 Seeded 10 students, profiles, fees, attendance, and grades for ${classInfo.name}.`);
  }

  // Link demo parent account to the first student (Class 6) for testing
  const demoChild = await prisma.student.findFirst({
    where: { class: { name: "Class 6" } },
    orderBy: { id: "asc" },
  });
  if (demoChild) {
    await prisma.student.update({
      where: { id: demoChild.id },
      data: { parentEmail: "parent@edunexus.com" },
    });
    console.log(`🔗 Linked parent@edunexus.com to student: ${demoChild.name}`);
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
