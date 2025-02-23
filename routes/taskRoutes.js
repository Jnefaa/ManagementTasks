const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middleware/auth');

router.use((req, res, next) => {
  req.io = req.app.get('io');
  next();
});

router.get('/', auth, taskController.getTasks);
router.post('/', auth, taskController.createTask);
router.put('/:id', auth, taskController.updateTask);
router.delete('/:id', auth, taskController.deleteTask);
router.get('/stats', auth, taskController.getTaskStats);

module.exports = router;
