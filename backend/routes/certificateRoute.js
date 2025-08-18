// routes/certificateRoute.js
const express = require("express");
const { sendCertificate } = require("../controllers/certificateController");

const router = express.Router();

// POST route to send certificate
router.post("/send", sendCertificate);

module.exports = router;
