const express = require("express");
const path = require("path");
const router = express.Router();
const { loadJSON, log } = require("../utils/helpers");

const EVENTS_PATH = path.join(__dirname, "../data/event.json");

// 이벤트 전체 조회
router.get("/events", (req, res) => {
  try {
    const events = loadJSON(EVENTS_PATH);
    log("GET /events - 이벤트 조회 성공");
    res.json(events);
  } catch (error) {
    log("GET /events - 오류: " + error.message);
    res.status(500).json({ message: "이벤트 조회 실패" });
  }
});

module.exports = router;
