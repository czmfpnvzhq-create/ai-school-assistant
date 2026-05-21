"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in the environment.");
}
const pool = new pg_1.Pool({ connectionString });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    console.log("Linking Demo Accounts to existing data...");
    await prisma.user.update({
        where: { email: 'student@edunexus.com' },
        data: { name: 'Muhammad Hamza' }
    });
    const demoTeacherRecord = await prisma.teacher.findFirst({
        where: { classId: { not: null } },
        orderBy: { id: 'asc' },
    });
    if (demoTeacherRecord) {
        await prisma.teacher.update({
            where: { id: demoTeacherRecord.id },
            data: { email: 'teacher@edunexus.com' },
        });
        console.log(`Linked teacher@edunexus.com to ${demoTeacherRecord.name} (${demoTeacherRecord.subject})`);
    }
    const students = await prisma.student.findMany({ where: { name: 'Muhammad Hamza' } });
    if (students.length > 0) {
        await prisma.student.update({
            where: { id: students[0].id },
            data: { parentEmail: 'parent@edunexus.com' }
        });
        console.log("Successfully linked Demo Student and Demo Parent to 'Muhammad Hamza'!");
    }
    else {
        console.log("Could not find student 'Muhammad Hamza'.");
    }
}
main()
    .catch(console.error)
    .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
});
//# sourceMappingURL=update-demo.js.map