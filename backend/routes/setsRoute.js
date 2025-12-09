const express = require("express");
const router = express.Router();
const Set = require("../models/setsModel");

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

router.post("/", async (req, res) => {
  try {
    let setsData = req.body;


    if (!Array.isArray(setsData)) {
      setsData = [setsData];
    }


    const invalid = setsData.find((s) => !s.name || !s.name.trim());
    if (invalid) {
      return res.status(400).json({ message: "Each set must have a name" });
    }


    const setNames = setsData.map((s) => s.name.trim());


    const existing = await Set.find({ name: { $in: setNames } });
    if (existing.length > 0) {
      return res.status(400).json({
        message: `Duplicate set names: ${existing
          .map((s) => s.name)
          .join(", ")}`,
      });
    }


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

router.put("/:id", async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ message: "Set name is required" });
  }

  try {

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

router.put("/:id/activate", async (req, res) => {
  try {

    await Set.updateMany({}, { isActive: false });


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
