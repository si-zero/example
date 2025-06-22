const express = require("express");
const router = express.Router();
const path = require("path");
const { loadJSON, saveJSON, log } = require("../utils/helpers");

const USERS_PATH = path.join(__dirname, "../data/users.json");

// 로그인
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  try {
    const users = loadJSON(USERS_PATH);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      log(`POST /login - 실패 (email: ${email})`);
      return res.status(401).json({ success: false, message: "이메일 또는 비밀번호가 틀렸습니다." });
    }
    const { password: _, ...safeUser } = user;
    log(`POST /login - 성공 (email: ${email})`);
    res.json({ success: true, user: safeUser });
  } catch (e) {
    log("POST /login - 오류: " + e.message);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 회원가입
router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "모든 필드를 입력해주세요." });
  }

  try {
    const users = loadJSON(USERS_PATH);
    const exists = users.some(u => u.email === email && u.password === password);
    if (exists) {
      return res.status(409).json({ success: false, message: "이미 존재하는 이메일과 비밀번호 조합입니다." });
    }

    const newUser = {
      id: "u" + (users.length + 1),
      name,
      email,
      password,
      role: "user",
      products: [],
      introduction: "",
      likes_product: [],
      purchased_products: []
    };

    users.push(newUser);
    saveJSON(USERS_PATH, users);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, user: safeUser });
  } catch (e) {
    log("POST /register - 오류: " + e.message);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

module.exports = router;
