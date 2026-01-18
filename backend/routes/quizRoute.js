const express = require("express");
const router = express.Router();
const Quiz = require("../models/quizModel");
const Round = require("../models/roundModel");
const Set = require("../models/setsModel");

// Get the currently published quiz
router.get("/published", async (req, res) => {
    try {
        const publishedQuiz = await Quiz.findOne({ isPublished: true });
        if (!publishedQuiz) {
            return res.status(200).json({ published: false });
        }
        return res.status(200).json({ published: true, quiz: publishedQuiz });
    } catch (err) {
        console.error("Get published quiz error:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

// Get rounds for a specific quiz part
router.get("/rounds/:part", async (req, res) => {
    try {
        const { part } = req.params;
        const publishedQuiz = await Quiz.findOne({ isPublished: true });

        if (!publishedQuiz) {
            return res.status(404).json({ message: "No published quiz found" });
        }

        const rounds = await Round.find({
            quiz: publishedQuiz._id,
            assignedParts: part
        }).populate("selectedSets");

        res.json({
            quizName: publishedQuiz.name,
            part,
            rounds
        });
    } catch (err) {
        console.error("Get rounds error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
