const prisma = require('../db');
const { buildMeta } = require('../utils/pagination');

async function getPostLikes(postId) {
  const id = parseInt(postId, 10);
  if (isNaN(id)) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  const post = await prisma.post.findUnique({
    where: { id },
  });
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  const users = await prisma.user.findMany({
    where: {
      likes: {
        some: { postId: id },
      },
    },
    select: {
      id: true,
      username: true,
      fullname: true,
    },
    orderBy: {
      username: 'asc',
    },
  });

  return users;
}

async function likePost(postId, userId) {
  const pId = parseInt(postId, 10);
  const uId = parseInt(userId, 10);

  if (isNaN(pId)) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }
  if (isNaN(uId)) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const post = await prisma.post.findUnique({ where: { id: pId } });
  if (!post) {
    const error = new Error('Post not found');
    error.status = 404;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id: uId } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  try {
    return await prisma.like.create({
      data: {
        postId: pId,
        userId: uId,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      const error = new Error('Already liked');
      error.status = 409;
      throw error;
    }
    throw err;
  }
}

async function unlikePost(postId, userId) {
  const pId = parseInt(postId, 10);
  const uId = parseInt(userId, 10);

  if (isNaN(pId) || isNaN(uId)) {
    const error = new Error('Like not found');
    error.status = 404;
    throw error;
  }

  try {
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: uId,
          postId: pId,
        },
      },
    });
  } catch (err) {
    if (err.code === 'P2025') {
      const error = new Error('Like not found');
      error.status = 404;
      throw error;
    }
    throw err;
  }
}

async function getLikedPosts(userId, pagination) {
  const id = parseInt(userId, 10);
  if (isNaN(id)) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const { page, limit, skip, take } = pagination;
  const where = {
    likes: {
      some: { userId: id },
    },
  };

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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

module.exports = {
  getPostLikes,
  likePost,
  unlikePost,
  getLikedPosts,
};
