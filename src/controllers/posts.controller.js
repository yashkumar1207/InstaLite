const postsService = require('../services/posts.service');

function isPositiveInteger(val) {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val > 0;
  }
  if (typeof val === 'string') {
    return /^[1-9]\d*$/.test(val.trim());
  }
  return false;
}

function isValidDate(val) {
  const d = new Date(val);
  return !isNaN(d.getTime());
}

async function create(req, res) {
  try {
    const { imageUrl, caption, location } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const post = await postsService.createPost({ imageUrl, caption, location });
    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function list(req, res) {
  try {
    const { page, limit, sortBy, order, location, search, from, to } = req.query;

    if (page !== undefined && !isPositiveInteger(page)) {
      return res.status(400).json({ error: 'page and limit must be positive integers' });
    }
    if (limit !== undefined && !isPositiveInteger(limit)) {
      return res.status(400).json({ error: 'page and limit must be positive integers' });
    }

    const allowedSortBy = ['createdAt', 'updatedAt'];
    if (sortBy !== undefined && !allowedSortBy.includes(sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, updatedAt' });
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

    const result = await postsService.listPosts({ page, limit, sortBy, order, location, search, from, to });
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

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
