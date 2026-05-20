const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const totalStudents = await prisma.student.count();
    console.log("Students:", totalStudents);
    const totalTeachers = await prisma.teacher.count();
    console.log("Teachers:", totalTeachers);
    const totalClasses = await prisma.class.count();
    console.log("Classes:", totalClasses);

    // Calculate Fees
    const fees = await prisma.fee.findMany();
    console.log("Fees count:", fees.length);
    
    // Today's boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Absent students today
    const absentToday = await prisma.attendance.count({
      where: {
        date: { gte: startOfToday, lte: endOfToday },
        status: 'absent'
      }
    });
    console.log("Absent:", absentToday);

    // Top 5 students
    const topStudentsData = await prisma.student.findMany({
      orderBy: { gradeAvg: 'desc' },
      take: 5,
      include: { class: true }
    });
    console.log("Top Students:", topStudentsData.length);

    // Recent notices
    const recentNotices = await prisma.notice.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    console.log("Notices:", recentNotices.length);

  } catch (e) {
    console.error("PRISMA ERROR:");
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
