const prisma = require('../db');

async function createPost(data) {
  const { imageUrl, caption, location } = data;
  return await prisma.post.create({
    data: {
      imageUrl,
      caption: caption !== undefined ? caption : null,
      location: location !== undefined ? location : null,
    },
  });
}

async function listPosts(query = {}) {
  const page = query.page ? parseInt(query.page, 10) : 1;
  let limit = query.limit ? parseInt(query.limit, 10) : 10;
  if (limit > 50) limit = 50;

  const sortBy = query.sortBy || 'createdAt';
  const order = query.order || 'desc';

  const where = {};
  if (query.location) {
    where.location = { equals: query.location, mode: 'insensitive' };
  }
  if (query.search) {
    where.caption = { contains: query.search, mode: 'insensitive' };
  }
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lt = new Date(query.to);
  }

  const skip = (page - 1) * limit;
  const take = limit;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take,
    }),
    prisma.post.count({ where }),
  ]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    data: posts,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

async function getPostById(id) {
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return null;

  return await prisma.post.findUnique({
    where: { id: postId },
  });
}

async function updatePost(id, data) {
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return null;

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) {
    return null;
  }

  const updateFields = {};
  if (data.caption !== undefined) updateFields.caption = data.caption;
  if (data.location !== undefined) updateFields.location = data.location;

  return await prisma.post.update({
    where: { id: postId },
    data: updateFields,
  });
}

async function deletePost(id) {
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return null;

  const existing = await prisma.post.findUnique({ where: { id: postId } });
  if (!existing) {
    return null;
  }

  return await prisma.post.delete({
    where: { id: postId },
  });
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
