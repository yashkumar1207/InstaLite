const likesService = require('../services/likes.service');
const { parsePagination } = require('../utils/pagination');

async function listLikes(req, res) {
  try {
    const likes = await likesService.getPostLikes(req.params.id);
    return res.status(200).json(likes);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

async function create(req, res) {
  try {
    const { userId } = req.body;
    if (userId === undefined || userId === null || userId === '') {
      return res.status(400).json({ error: 'userId is required' });
    }

    const like = await likesService.likePost(req.params.id, userId);
    return res.status(201).json(like);
  } catch (error) {
    if (error.status === 404 || error.status === 409) {
      return res.status(error.status).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    await likesService.unlikePost(req.params.id, req.params.userId);
    return res.status(204).send();
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

async function getLikedPosts(req, res) {
  try {
    let pagination;
    try {
      pagination = parsePagination(req.query);
    } catch (err) {
      return res.status(err.status || 400).json({ error: err.message });
    }

    const result = await likesService.getLikedPosts(req.params.id, pagination);
    return res.status(200).json(result);
  } catch (error) {
    if (error.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  listLikes,
  create,
  remove,
  getLikedPosts,
};
