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

async function listPosts() {
  return await prisma.post.findMany();
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
