import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in the environment.");
}
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Linking Demo Accounts to existing data...");
  
  // Update the Demo Student user's name to match a real student in the DB
  await prisma.user.update({
    where: { email: 'student@edunexus.com' },
    data: { name: 'Muhammad Hamza' }
  });
  
  // Update that student's parentEmail to match the Demo Parent
  const students = await prisma.student.findMany({ where: { name: 'Muhammad Hamza' } });
  if (students.length > 0) {
    await prisma.student.update({
      where: { id: students[0].id },
      data: { parentEmail: 'parent@edunexus.com' }
    });
    console.log("Successfully linked Demo Student and Demo Parent to 'Muhammad Hamza'!");
  } else {
    console.log("Could not find student 'Muhammad Hamza'.");
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
