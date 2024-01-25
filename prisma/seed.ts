import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const seedResult = await prisma.user.upsert({
    where: { email: 'test@gmail.com' },
    update: {},
    create: {
      email: 'test@gmail.com',
      firstName: 'Tim',
      lastName: 'Noorlander',
      password: '$2b$10$raBO1MpXZt2kGnODdEeAUOR1MBDwlwmrkUnM0Y8m4o0fyR27ijhOS',
      activities: {
        create: {
          title: 'Gravel bike ride around the lakes',
          category: 'Cycling',
          description:
            'Hey all, join me for a nice ride around the lakes. All levels are welcome',
          startTime: '2023-10-01T08:00:00Z',
          address: '',
          longitude: 55.612666,
          latitude: 12.512721,
          city: 'Dragør',
          postcode: '2791',
          country: 'Denmark',
        },
      },
    },
  });
  console.log(seedResult);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
