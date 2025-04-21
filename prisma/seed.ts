import { PrismaClient, Role  } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = [
        {
            name: 'Amik',
            email: 'lead@example.com',
            password: 'password123',
            role: Role.LEAD, 
        },
        {
            name: 'Ki Agus',
            email: 'team1@example.com',
            password: 'password123',
            role: Role.TEAM,
        },
        {
            name: 'Muh Irsyad',
            email: 'team2@example.com',
            password: 'password123',
            role: Role.TEAM,
        },
    ];

  for (const user of users) {
    const { name, email, password, role } = user;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`User dengan email ${email} sudah ada.`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });
      console.log(`User ${name} dengan email ${email} berhasil ditambahkan!`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
