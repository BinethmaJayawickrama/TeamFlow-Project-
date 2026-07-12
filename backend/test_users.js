const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const users = await prisma.user.findMany();
    console.log("USERS IN DB:", users.map(u => ({ id: u.id, email: u.email, role: u.role, isActive: u.isActive })));
  } catch (err) {
    console.error("ERROR FETCHING USERS:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
