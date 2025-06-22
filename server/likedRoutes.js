const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const likedPath = path.join(__dirname, "data", "likedlist.json");

// GET: 찜 목록 불러오기
router.get("/api/liked", (req, res) => {
  fs.readFile(likedPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read liked data." });
    res.json(JSON.parse(data));
  });
});

// POST: 찜 추가/제거
router.post("/api/liked", express.json(), (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Product ID required" });

  fs.readFile(likedPath, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Read error" });

    let likedData = JSON.parse(data);
    const index = likedData.liked.indexOf(id);
    if (index === -1) {
      likedData.liked.push(id); // add
    } else {
      likedData.liked.splice(index, 1); // remove
    }

    fs.writeFile(likedPath, JSON.stringify(likedData, null, 2), (err) => {
      if (err) return res.status(500).json({ error: "Write error" });
      res.json(likedData);
    });
  });
});

module.exports = router;
