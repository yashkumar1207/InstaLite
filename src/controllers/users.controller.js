const usersService = require('../services/users.service');
const { parsePagination } = require('../utils/pagination');

async function create(req, res) {
  try {
    const { username, email, fullname, bio } = req.body;
    if (!username || !email || !fullname) {
      return res.status(400).json({ error: 'username, email and fullname are required' });
    }

    const user = await usersService.createUser({ username, email, fullname, bio });
    return res.status(201).json(user);
  } catch (error) {
    if (error.status === 409 || error.code === 'P2002') {
      return res.status(409).json({ error: 'username or email already taken' });
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

    const { sortBy, order, isPrivate, search, hasPosts } = req.query;

    const allowedSortBy = ['createdAt', 'username', 'fullname'];
    if (sortBy !== undefined && !allowedSortBy.includes(sortBy)) {
      return res.status(400).json({ error: 'sortBy must be one of: createdAt, username, fullname' });
    }

    const allowedOrder = ['asc', 'desc'];
    if (order !== undefined && !allowedOrder.includes(order)) {
      return res.status(400).json({ error: 'order must be asc or desc' });
    }

    if (isPrivate !== undefined && isPrivate !== 'true' && isPrivate !== 'false') {
      return res.status(400).json({ error: 'isPrivate must be true or false' });
    }

    if (hasPosts !== undefined && hasPosts !== 'true' && hasPosts !== 'false') {
      return res.status(400).json({ error: 'hasPosts must be true or false' });
    }

    const result = await usersService.listUsers({ sortBy, order, isPrivate, search, hasPosts }, pagination);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getOne(req, res) {
  try {
    const user = await usersService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function update(req, res) {
  try {
    const { fullname, bio, isPrivate } = req.body;
    const updated = await usersService.updateUser(req.params.id, { fullname, bio, isPrivate });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function remove(req, res) {
  try {
    const deleted = await usersService.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
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
