const postsService = require('../services/posts.service');
const { parsePagination } = require('../utils/pagination');

function isValidDate(val) {
  const d = new Date(val);
  return !isNaN(d.getTime());
}

async function create(req, res) {
  try {
    const { imageUrl, authorId, caption, location } = req.body;
    if (!imageUrl || !authorId) {
      return res.status(400).json({ error: 'imageUrl and authorId are required' });
    }

    const parsedAuthorId = parseInt(authorId, 10);
    if (isNaN(parsedAuthorId)) {
      return res.status(404).json({ error: 'User not found' });
    }

    const post = await postsService.createPost({
      imageUrl,
      authorId: parsedAuthorId,
      caption,
      location,
    });
    return res.status(201).json(post);
  } catch (error) {
    if (error.status === 404 || error.code === 'P2003' || error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(500).json({ error: error.message });
  }
}

async function list(req, res) {
  try {
    let pagination;
    try {
      pagination = parsePagination(req.query);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    const { sortBy, order, location, search, from, to } = req.query;

    const allowedSortBy = ['createdAt', 'updatedAt', 'likes'];
    if (sortBy !== undefined && !allowedSortBy.includes(sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, updatedAt, likes' });
    }

    const allowedOrder = ['asc', 'desc'];
    if (order !== undefined && !allowedOrder.includes(order)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }

    if (from !== undefined && !isValidDate(from)) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }
    if (to !== undefined && !isValidDate(to)) {
      return res.status(400).json({ error: 'from and to must be valid dates' });
    }

    const result = await postsService.listPosts({ sortBy, order, location, search, from, to }, pagination);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getOne(req, res) {
  try {
    const post = await postsService.getPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const { caption, location } = req.body;
    const updated = await postsService.updatePost(req.params.id, { caption, location });
    if (!updated) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const deleted = await postsService.deletePost(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getUserPosts(req, res) {
  try {
    let pagination;
    try {
      pagination = parsePagination(req.query);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    const result = await postsService.listUserPosts(req.params.id, pagination);
    return res.status(200).json(result);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  getUserPosts,
};
