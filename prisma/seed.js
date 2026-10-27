const prisma = require('../src/db');
const { users, posts } = require('./seed-data');

async function main() {
  try {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const usersCreated = await prisma.user.createMany({
      data: users,
    });

    const postsCreated = await prisma.post.createMany({
      data: posts,
    });

    console.log(`🌱 Seeded ${usersCreated.count} users and ${postsCreated.count} posts`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
