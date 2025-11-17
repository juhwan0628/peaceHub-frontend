const express = require('express');
const router = express.Router();
const roomController = require('../controllers/rooms.controller'); // require room controller

// 방 생성
/**
 * Method: POST
 * path: /api/rooms/
 */
router.post('/', roomController.createRoom);

// 방 참여
/**
 * Method: POST
 * path: /api/rooms/join
 */
router.post('/join', roomController.joinRoom);

// router exports
module.exports = router;