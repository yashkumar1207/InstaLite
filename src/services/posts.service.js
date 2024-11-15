const prisma = require('../db');
const { buildMeta } = require('../utils/pagination');

async function createPost(data) {
  const { imageUrl, authorId, caption, location } = data;

  const author = await prisma.user.findUnique({
    where: { id: authorId },
  });

  if (!author) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  return await prisma.post.create({
    data: {
      imageUrl,
      authorId,
      caption: caption !== undefined ? caption : null,
      location: location !== undefined ? location : null,
    },
  });
}

async function listPosts(query = {}, pagination) {
  const { page, limit, skip, take } = pagination;
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

  let orderBy;
  if (sortBy === 'likes') {
    orderBy = [{ likes: { _count: order } }, { createdAt: 'desc' }];
  } else {
    orderBy = { [sortBy]: order };
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: buildMeta(page, limit, total),
  };
}

async function getPostById(id) {
  const postId = parseInt(id, 10);
  if (isNaN(postId)) return null;

  return await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
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

async function listUserPosts(userId, pagination) {
  const id = parseInt(userId, 10);
  if (isNaN(id)) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const { page, limit, skip, take } = pagination;
  const where = { authorId: id };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: posts,
    meta: buildMeta(page, limit, total),
  };
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  listUserPosts,
};
