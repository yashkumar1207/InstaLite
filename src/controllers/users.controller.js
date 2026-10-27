const usersService = require('../services/users.service');

function isPositiveInteger(val) {
  if (typeof val === 'number') {
    return Number.isInteger(val) && val > 0;
  }
  if (typeof val === 'string') {
    return /^[1-9]\d*$/.test(val.trim());
  }
  return false;
}

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
    const { page, limit, sortBy, order, isPrivate, search } = req.query;

    if (page !== undefined && !isPositiveInteger(page)) {
      return res.status(400).json({ error: 'page and limit must be positive integers' });
    }
    if (limit !== undefined && !isPositiveInteger(limit)) {
      return res.status(400).json({ error: 'page and limit must be positive integers' });
    }

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

    const result = await usersService.listUsers({ page, limit, sortBy, order, isPrivate, search });
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
