import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const roommateNames = ['Alex (Manager)', 'Taylor', 'Jordan', 'Sam'];
  const inviteCode = 'ROOM-DEMO';
  const demoPassword = 'password';

  // Find or create a single demo room
  let room = await prisma.room.findFirst({ where: { inviteCode } });
  if (!room) {
    room = await prisma.room.create({
      data: {
        name: 'Roomie Bill Buddy Demo Room',
        inviteCode,
      },
    });
  }

  const existingRoommates = await prisma.roommate.findMany({
    where: {
      roomId: room.id,
      name: { in: roommateNames },
    },
  });
  const existingNames = new Set(existingRoommates.map(r => r.name));

  const roommatesToCreate = roommateNames
    .filter(name => !existingNames.has(name))
    .map((name, index) => ({
      name,
      email: `${name.split(' ')[0].toLowerCase()}@demo.local`,
      password: demoPassword,
      isManager: index === 0,
      roomId: room.id,
    }));

  if (roommatesToCreate.length > 0) {
    await prisma.roommate.createMany({ data: roommatesToCreate });
  }

  const roommates = await prisma.roommate.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: 'asc' },
  });

  if (roommates.length === 0) {
    throw new Error('Seed requires at least one roommate to create expenses.');
  }

  const manager = roommates.find(r => r.isManager) ?? roommates[0];
  const fallback = roommates[1] ?? manager;

  const expenseCount = await prisma.expense.count({
    where: { roomId: room.id },
  });
  if (expenseCount === 0) {
    await prisma.expense.createMany({
      data: [
        {
          description: 'Groceries run',
          amount: 120.5,
          category: 'Food',
          date: new Date('2024-11-05'),
          status: 'approved',
          roomId: room.id,
          addedById: manager.id,
          approvedById: manager.id,
          approvedAt: new Date('2024-11-06'),
        },
        {
          description: 'Internet bill',
          amount: 75.0,
          category: 'Internet',
          date: new Date('2024-11-02'),
          status: 'approved',
          roomId: room.id,
          addedById: fallback.id,
          approvedById: manager.id,
          approvedAt: new Date('2024-11-03'),
        },
        {
          description: 'Apartment cleaning',
          amount: 95.25,
          category: 'Cleaning Supplies',
          date: new Date('2024-11-10'),
          status: 'pending',
          roomId: room.id,
          addedById: fallback.id,
        },
      ],
    });
  }

  console.log(`✅ Seed completed for room "${room.name}" (${room.inviteCode}) with id ${room.id}`);
}

main()
  .catch(err => {
    console.error('Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
