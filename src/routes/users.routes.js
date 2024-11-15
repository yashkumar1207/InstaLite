const express = require('express');
const usersController = require('../controllers/users.controller');
const postsController = require('../controllers/posts.controller');
const likesController = require('../controllers/likes.controller');

const router = express.Router();

router.post('/', usersController.create);
router.get('/', usersController.list);
router.get('/:id', usersController.getOne);
router.patch('/:id', usersController.update);
router.delete('/:id', usersController.remove);

router.get('/:id/posts', postsController.getUserPosts);
router.get('/:id/liked-posts', likesController.getLikedPosts);

module.exports = router;
