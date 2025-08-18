const express = require("express");
const router = express.Router();
const Question = require("../models/questionModel");
const QuizSet = require("../models/setsModel"); // Import the Sets model

// @route   GET /api/questions
// @desc    Get all questions with set info (active and inactive sets)
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });

    // Manually populate set information
    const populatedQuestions = [];
    for (const question of questions) {
      const setInfo = await QuizSet.findOne({ name: question.set });
      populatedQuestions.push({
        ...question.toObject(),
        set: setInfo
          ? {
              _id: setInfo._id,
              name: setInfo.name,
              isActive: setInfo.isActive,
            }
          : null,
      });
    }
    res.json(populatedQuestions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});

// @route   GET /api/questions/by-set/:setId
// @desc    Get questions by set ID
router.get("/by-set/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const { includeInactive } = req.query;

    // Find the set first to get its name
    const targetSet = await QuizSet.findById(setId);
    if (!targetSet) {
      return res.status(404).json({ message: "Set not found" });
    }

    // Find questions by set name
    const questions = await Question.find({ set: targetSet.name }).sort({
      createdAt: -1,
    });

    // Filter based on active status if needed
    if (!includeInactive || includeInactive === "false") {
      if (!targetSet.isActive) {
        return res.json([]); // Return empty array for inactive sets
      }
    }

    // Populate set information
    const populatedQuestions = questions.map((question) => ({
      ...question.toObject(),
      set: {
        _id: targetSet._id,
        name: targetSet.name,
        isActive: targetSet.isActive,
      },
    }));

    res.json(populatedQuestions);
  } catch (err) {
    console.error("Error fetching questions by set:", err);
    res.status(500).json({ message: "Failed to fetch questions by set" });
  }
});

// @route   POST /api/questions
// @desc    Add one or multiple questions
router.post("/", async (req, res) => {
  try {
    if (Array.isArray(req.body)) {
      // Bulk insert - convert set IDs to set names
      const questionsToSave = [];

      for (const q of req.body) {
        if (!q.question || !q.options || !q.correctAnswer || !q.set) {
          return res.status(400).json({
            message:
              "Each question must include question, options, correctAnswer, and set",
          });
        }

        if (!Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({
            message: "Each question must have at least two options",
          });
        }

        if (!q.options.includes(q.correctAnswer)) {
          return res.status(400).json({
            message: "Correct answer must be one of the options",
          });
        }

        // Convert set ID to set name if needed
        let setName = q.set;
        if (q.set.length === 24 && /^[0-9a-fA-F]{24}$/.test(q.set)) {
          // It's an ObjectId, convert to name
          const foundSet = await QuizSet.findById(q.set);
          if (!foundSet) {
            return res.status(400).json({
              message: `Set with ID "${q.set}" not found.`,
            });
          }
          setName = foundSet.name;
        } else {
          // It's already a name, verify it exists
          const foundSet = await QuizSet.findOne({ name: q.set });
          if (!foundSet) {
            return res.status(400).json({
              message: `Set "${q.set}" not found. Please create the set first.`,
            });
          }
        }

        questionsToSave.push({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          set: setName,
        });
      }

      const saved = await Question.insertMany(questionsToSave, {
        ordered: false,
      });

      // Manually populate the saved questions
      const populatedQuestions = [];
      for (const savedQuestion of saved) {
        const setInfo = await QuizSet.findOne({ name: savedQuestion.set });
        populatedQuestions.push({
          ...savedQuestion.toObject(),
          set: setInfo
            ? {
                _id: setInfo._id,
                name: setInfo.name,
                isActive: setInfo.isActive,
              }
            : null,
        });
      }

      return res.status(201).json({
        message: "Questions added",
        questions: populatedQuestions,
      });
    } else {
      // Single insert
      const { question, options, correctAnswer, set } = req.body;

      if (!question || !options || !correctAnswer || !set) {
        return res
          .status(400)
          .json({ message: "All fields (including set) are required" });
      }

      if (!Array.isArray(options) || options.length < 2) {
        return res
          .status(400)
          .json({ message: "At least two options are required" });
      }

      if (!options.includes(correctAnswer)) {
        return res
          .status(400)
          .json({ message: "Correct answer must be one of the options" });
      }

      // Convert set ID to set name if needed
      let setName = set;
      if (set.length === 24 && /^[0-9a-fA-F]{24}$/.test(set)) {
        // It's an ObjectId, convert to name
        const foundSet = await QuizSet.findById(set);
        if (!foundSet) {
          return res.status(400).json({
            message: `Set with ID "${set}" not found.`,
          });
        }
        setName = foundSet.name;
      } else {
        // It's already a name, verify it exists
        const foundSet = await QuizSet.findOne({ name: set });
        if (!foundSet) {
          return res.status(400).json({
            message: `Set "${set}" not found. Please create the set first.`,
          });
        }
      }

      const newQuestion = new Question({
        question,
        options,
        correctAnswer,
        set: setName,
      });

      const saved = await newQuestion.save();

      // Manually populate the saved question
      const setInfo = await QuizSet.findOne({ name: saved.set });
      const populatedQuestion = {
        ...saved.toObject(),
        set: setInfo
          ? {
              _id: setInfo._id,
              name: setInfo.name,
              isActive: setInfo.isActive,
            }
          : null,
      };

      return res.status(201).json({
        message: "Question added",
        question: populatedQuestion,
      });
    }
  } catch (err) {
    console.error("Error saving question(s):", err);
    res
      .status(500)
      .json({ message: "Error saving question(s)", error: err.message });
  }
});

// @route   PUT /api/questions/:id
// @desc    Edit a question
router.put("/:id", async (req, res) => {
  const { question, options, correctAnswer, set } = req.body;

  if (!question || !options || !correctAnswer || !set) {
    return res
      .status(400)
      .json({ message: "All fields (including set) are required" });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res
      .status(400)
      .json({ message: "At least two options are required" });
  }

  if (!options.includes(correctAnswer)) {
    return res
      .status(400)
      .json({ message: "Correct answer must be one of the options" });
  }

  try {
    // Convert set ID to set name if needed
    let setName = set;
    if (set.length === 24 && /^[0-9a-fA-F]{24}$/.test(set)) {
      // It's an ObjectId, convert to name
      const foundSet = await QuizSet.findById(set);
      if (!foundSet) {
        return res.status(400).json({
          message: `Set with ID "${set}" not found.`,
        });
      }
      setName = foundSet.name;
    } else {
      // It's already a name, verify it exists
      const foundSet = await QuizSet.findOne({ name: set });
      if (!foundSet) {
        return res.status(400).json({
          message: `Set "${set}" not found.`,
        });
      }
    }

    const updated = await Question.findByIdAndUpdate(
      req.params.id,
      { question, options, correctAnswer, set: setName },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Manually populate the updated question
    const setInfo = await QuizSet.findOne({ name: updated.set });
    const populatedQuestion = {
      ...updated.toObject(),
      set: setInfo
        ? {
            _id: setInfo._id,
            name: setInfo.name,
            isActive: setInfo.isActive,
          }
        : null,
    };

    res.json({ message: "Question updated", question: populatedQuestion });
  } catch (err) {
    console.error("Error updating question:", err);
    res
      .status(500)
      .json({ message: "Error updating question", error: err.message });
  }
});

// @route   PUT /api/questions/:id/toggle-set-status
// @desc    Toggle the active status of the set associated with a question
router.put("/:id/toggle-set-status", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (!question.set) {
      return res
        .status(400)
        .json({ message: "Question has no associated set" });
    }

    // Find set by name and toggle its status
    const setInfo = await QuizSet.findOne({ name: question.set });
    if (!setInfo) {
      return res.status(400).json({ message: "Associated set not found" });
    }

    const updatedSet = await QuizSet.findByIdAndUpdate(
      setInfo._id,
      { isActive: !setInfo.isActive },
      { new: true }
    );

    // Return updated question with set info
    const populatedQuestion = {
      ...question.toObject(),
      set: {
        _id: updatedSet._id,
        name: updatedSet.name,
        isActive: updatedSet.isActive,
      },
    };

    res.json({
      message: `Set ${updatedSet.isActive ? "activated" : "deactivated"}`,
      question: populatedQuestion,
      set: updatedSet,
    });
  } catch (err) {
    console.error("Error toggling set status:", err);
    res
      .status(500)
      .json({ message: "Error toggling set status", error: err.message });
  }
});

// @route   DELETE /api/questions/:id
// @desc    Delete a question
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Manually populate the deleted question
    const setInfo = await QuizSet.findOne({ name: deleted.set });
    const populatedQuestion = {
      ...deleted.toObject(),
      set: setInfo
        ? {
            _id: setInfo._id,
            name: setInfo.name,
            isActive: setInfo.isActive,
          }
        : null,
    };

    res.json({ message: "Question deleted", question: populatedQuestion });
  } catch (err) {
    console.error("Error deleting question:", err);
    res
      .status(500)
      .json({ message: "Error deleting question", error: err.message });
  }
});

// @route   DELETE /api/questions/by-set/:setId
// @desc    Delete all questions belonging to a specific set
router.delete("/by-set/:setId", async (req, res) => {
  try {
    const { setId } = req.params;

    // Find the set to get its name
    const targetSet = await QuizSet.findById(setId);
    if (!targetSet) {
      return res.status(404).json({ message: "Set not found" });
    }

    const result = await Question.deleteMany({ set: targetSet.name });

    res.json({
      message: `Deleted ${result.deletedCount} questions from set`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("Error deleting questions by set:", err);
    res
      .status(500)
      .json({ message: "Error deleting questions by set", error: err.message });
  }
});

module.exports = router;
