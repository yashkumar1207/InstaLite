const prisma = require('../db');

async function createUser(data) {
  const { username, email, fullname, bio } = data;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email },
      ],
    },
  });

  if (existing) {
    const error = new Error('username or email already taken');
    error.status = 409;
    throw error;
  }

  return await prisma.user.create({
    data: {
      username,
      email,
      fullname,
      bio: bio !== undefined ? bio : null,
    },
  });
}

async function listUsers(query = {}) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  let limit = query.limit ? parseInt(query.limit, 10) : 10;
  if (limit > 50) limit = 50;

  const sortBy = query.sortBy || 'createdAt';
  const order = query.order || 'desc';

  const where = {};
  if (query.isPrivate !== undefined) {
    where.isPrivate = query.isPrivate === 'true';
  }
  if (query.search) {
    where.OR = [
      { username: { contains: query.search, mode: 'insensitive' } },
      { fullname: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async function getUserById(id) {
  const userId = parseInt(id, 10);
  if (isNaN(userId)) return null;

  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

async function updateUser(id, data) {
  const userId = parseInt(id, 10);
  if (isNaN(userId)) return null;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return null;
  }

  const updateFields = {};
  if (data.fullname !== undefined) updateFields.fullname = data.fullname;
  if (data.bio !== undefined) updateFields.bio = data.bio;
  if (data.isPrivate !== undefined) updateFields.isPrivate = data.isPrivate;

  return await prisma.user.update({
    where: { id: userId },
    data: updateFields,
  });
}

async function deleteUser(id) {
  const userId = parseInt(id, 10);
  if (isNaN(userId)) return null;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    return null;
  }

  return await prisma.user.delete({
    where: { id: userId },
  });
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
