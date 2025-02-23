const Task = require('../models/Task');

// Récupérer les tâches de l'utilisateur connecté
exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.userId });
  res.json(tasks);
};

// Ajouter une tâche
exports.createTask = async (req, res) => {
  const task = new Task({ ...req.body, user: req.userId });
  await task.save();
  req.io.emit('taskAdded', task);
  res.status(201).json(task);
};

// Mettre à jour une tâche
exports.updateTask = async (req, res) => {
  const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
  req.io.emit('taskUpdated', task);
  res.json({ message: 'Tâche mise à jour' });
};

// Supprimer une tâche
exports.deleteTask = async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  req.io.emit('taskDeleted', req.params.id);
  res.json({ message: 'Tâche supprimée' });
};

// Statistiques des tâches
exports.getTaskStats = async (req, res) => {
  const stats = await Task.aggregate([
    { $match: { user: req.userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);
  res.json(stats);
};
