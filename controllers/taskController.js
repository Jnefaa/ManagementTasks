const Task = require('../models/Task');
const mongoose = require('mongoose');

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

    { $match: { user: req.user} },
    { $group: { _id: "$status", count: { $sum: 1 } } }

  ]); 
  console.log("User ID from request:", req.user); // Debugging log

  console.log("Aggregation result:", stats,);
  res.json(stats);
};

exports.getAllTaskStatuses = async (req, res) => {
  try {
    const statuses = await Task.find({}, "status -_id"); // Only return the status field
    res.json(statuses);
  } catch (error) {
    console.error("Error fetching task statuses:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTaskStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Requested Task ID:", id); // Debugging log

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID" });
    }

    const task = await Task.findById(id, "status -_id");
    console.log("Fetched Task:", task); // Debugging log

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteTasksByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    console.log("Deleting tasks with status:", status); // Debugging log

    const result = await Task.deleteMany({ status });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No tasks found with this status" });
    }

    res.json({ message: `${result.deletedCount} tasks deleted successfully` });
  } catch (error) {
    console.error("Error deleting tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // New status from request body

    console.log("Updating task ID:", id, "to status:", status); // Debugging log

    const updatedTask = await Task.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task status updated", task: updatedTask });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
