const express = require("express");
const router = express.Router();
const Set = require("../models/setsModel");

// @route   GET /api/sets
// @desc    Get all sets
router.get("/", async (req, res) => {
  try {
    const sets = await Set.find().sort({ createdAt: -1 });
    res.json(sets);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch sets",
      error: err.message,
    });
  }
});

// @route   GET /api/sets/active
// @desc    Get the active set
router.get("/active", async (req, res) => {
  try {
    const activeSet = await Set.findOne({ isActive: true });

    if (!activeSet) {
      return res.status(404).json({ message: "No active set found" });
    }

    res.json(activeSet);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch active set",
      error: err.message,
    });
  }
});

// @route   POST /api/sets
// @desc    Add a new set (single or bulk)
router.post("/", async (req, res) => {
  try {
    let setsData = req.body;

    // Ensure it's an array
    if (!Array.isArray(setsData)) {
      setsData = [setsData];
    }

    // Validate input
    const invalid = setsData.find((s) => !s.name || !s.name.trim());
    if (invalid) {
      return res.status(400).json({ message: "Each set must have a name" });
    }

    // Extract set names
    const setNames = setsData.map((s) => s.name.trim());

    // Check duplicates in DB
    const existing = await Set.find({ name: { $in: setNames } });
    if (existing.length > 0) {
      return res.status(400).json({
        message: `Duplicate set names: ${existing
          .map((s) => s.name)
          .join(", ")}`,
      });
    }

    // Save (with isActive defaulting to false)
    const savedSets = await Set.insertMany(
      setsData.map((s) => ({
        name: s.name.trim(),
        isActive: false,
      }))
    );

    res.status(201).json(savedSets);
  } catch (err) {
    res.status(500).json({
      message: "Error saving set(s)",
      error: err.message,
    });
  }
});

// @route   PUT /api/sets/:id
// @desc    Edit a set name
router.put("/:id", async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Set name is required" });
  }

  try {
    // Check for duplicate name (excluding current set)
    const duplicate = await Set.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      return res.status(400).json({
        message: "A set with this name already exists",
      });
    }

    const updated = await Set.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Set not found" });
    }

    res.json({ message: "Set updated", set: updated });
  } catch (err) {
    res.status(500).json({
      message: "Error updating set",
      error: err.message,
    });
  }
});

// @route   PUT /api/sets/:id/activate
// @desc    Set a set as active
router.put("/:id/activate", async (req, res) => {
  try {
    // First, deactivate all sets
    await Set.updateMany({}, { isActive: false });

    // Then activate the specified set
    const activatedSet = await Set.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true, runValidators: true }
    );

    if (!activatedSet) {
      return res.status(404).json({ message: "Set not found" });
    }

    res.json({
      message: "Set activated successfully",
      set: activatedSet,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error activating set",
      error: err.message,
    });
  }
});

// @route   PUT /api/sets/deactivate
// @desc    Deactivate all sets (no active set)
router.put("/deactivate", async (req, res) => {
  try {
    await Set.updateMany({}, { isActive: false });

    res.json({ message: "All sets deactivated successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error deactivating sets",
      error: err.message,
    });
  }
});

// @route   DELETE /api/sets/:id
// @desc    Delete a set
router.delete("/:id", async (req, res) => {
  try {
    const setToDelete = await Set.findById(req.params.id);

    if (!setToDelete) {
      return res.status(404).json({ message: "Set not found" });
    }

    const deleted = await Set.findByIdAndDelete(req.params.id);

    res.json({
      message: "Set deleted",
      set: deleted,
      wasActive: setToDelete.isActive,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting set",
      error: err.message,
    });
  }
});

module.exports = router;
