const express = require("express");
const router = express.Router();
const Question = require("../models/questionModel");
const QuizSet = require("../models/setsModel"); // Import the Sets model

router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });


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

router.get("/by-set/:setId", async (req, res) => {
  try {
    const { setId } = req.params;
    const { includeInactive } = req.query;


    const targetSet = await QuizSet.findById(setId);
    if (!targetSet) {
      return res.status(404).json({ message: "Set not found" });
    }


    const questions = await Question.find({ set: targetSet.name }).sort({
      createdAt: -1,
    });


    if (!includeInactive || includeInactive === "false") {
      if (!targetSet.isActive) {
        return res.json([]);
      }
    }


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

router.post("/", async (req, res) => {
  try {
    if (Array.isArray(req.body)) {

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


        let setName = q.set;
        if (q.set.length === 24 && /^[0-9a-fA-F]{24}$/.test(q.set)) {

          const foundSet = await QuizSet.findById(q.set);
          if (!foundSet) {
            return res.status(400).json({
              message: `Set with ID "${q.set}" not found.`,
            });
          }
          setName = foundSet.name;
        } else {

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


      let setName = set;
      if (set.length === 24 && /^[0-9a-fA-F]{24}$/.test(set)) {

        const foundSet = await QuizSet.findById(set);
        if (!foundSet) {
          return res.status(400).json({
            message: `Set with ID "${set}" not found.`,
          });
        }
        setName = foundSet.name;
      } else {

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

    let setName = set;
    if (set.length === 24 && /^[0-9a-fA-F]{24}$/.test(set)) {

      const foundSet = await QuizSet.findById(set);
      if (!foundSet) {
        return res.status(400).json({
          message: `Set with ID "${set}" not found.`,
        });
      }
      setName = foundSet.name;
    } else {

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


    const setInfo = await QuizSet.findOne({ name: question.set });
    if (!setInfo) {
      return res.status(400).json({ message: "Associated set not found" });
    }

    const updatedSet = await QuizSet.findByIdAndUpdate(
      setInfo._id,
      { isActive: !setInfo.isActive },
      { new: true }
    );


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

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Question not found" });
    }


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

router.delete("/by-set/:setId", async (req, res) => {
  try {
    const { setId } = req.params;


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
