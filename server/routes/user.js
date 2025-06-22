const express = require("express");
const path = require("path");
const router = express.Router();
const { loadJSON, saveJSON, log } = require("../utils/helpers");

const USERS_PATH = path.join(__dirname, "../data/users.json");
const GOODS_PATH = path.join(__dirname, "../data/goods.json");

// 유저 정보 조회
router.post("/get-user", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId가 필요합니다." });

  try {
    const users = loadJSON(USERS_PATH);
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });

    const { password: _, ...safeUser } = user;
    log(`POST /api/get-user - 유저 ${userId} 조회 성공`);
    res.json({ success: true, user: safeUser });
  } catch (e) {
    log("POST /api/get-user - 오류: " + e.message);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 유저 정보 수정
router.patch("/update-user", (req, res) => {
  const { userId, email, name, introduction, password } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: "userId가 필요합니다." });

  try {
    const users = loadJSON(USERS_PATH);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return res.status(404).json({ success: false, message: "유저를 찾을 수 없습니다." });

    const isDuplicate = users.some((u, i) =>
      i !== idx &&
      (email ? u.email === email : false) &&
      (password && password.trim() !== "" ? u.password === password : false)
    );
    if (isDuplicate) {
      return res.status(409).json({ success: false, message: "이미 존재하는 이메일+비밀번호 조합입니다." });
    }

    const user = users[idx];
    if (email) user.email = email;
    if (name) user.name = name;
    if (introduction !== undefined) user.introduction = introduction;
    if (password && password.trim() !== "") user.password = password;

    saveJSON(USERS_PATH, users);
    log(`PATCH /api/update-user - 유저 ${userId} 수정 완료`);
    res.json({ success: true, message: "회원정보가 수정되었습니다." });
  } catch (e) {
    log("PATCH /api/update-user - 오류: " + e.message);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 유저 보유 상품 조회
router.post("/user-products", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId가 필요합니다." });

  try {
    const users = loadJSON(USERS_PATH);
    const goods = Object.values(loadJSON(GOODS_PATH)).flat();
    const user = users.find(u => u.id === userId);
    if (!user) {
      log(`POST /api/user-products - 유저 ${userId} 없음`);
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    const userProducts = goods.filter(p => (user.products || []).includes(p.id));
    log(`POST /api/user-products - 유저 ${userId} 보유 상품 ${userProducts.length}개 반환`);
    res.json(userProducts);
  } catch (e) {
    log("POST /api/user-products - 오류: " + e.message);
    res.status(500).json({ message: "조회 실패" });
  }
});

// 회원 탈퇴
router.delete("/delete-account", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    log("DELETE /api/delete-account - userId 누락");
    return res.status(400).json({ message: "userId가 필요합니다." });
  }

  try {
    const users = loadJSON(USERS_PATH);
    const goodsData = loadJSON(GOODS_PATH);

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      log(`DELETE /api/delete-account - userId ${userId} 없음`);
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    // 유저가 만든 상품 삭제
    const deletedProductIds = [];
    for (const category in goodsData) {
      const userProducts = goodsData[category].filter(p => p.developer === userId);
      deletedProductIds.push(...userProducts.map(p => p.id));
      goodsData[category] = goodsData[category].filter(p => p.developer !== userId);
    }

    // 유저 삭제
    users.splice(userIndex, 1);

    // 다른 유저 찜/보유/구매 목록에서도 삭제된 상품 제거
    users.forEach(user => {
      user.products = (user.products || [])
        .filter(pid => Number.isInteger(pid) && !deletedProductIds.includes(pid));
      user.likes_product = (user.likes_product || [])
        .filter(pid => Number.isInteger(pid) && !deletedProductIds.includes(pid));
      user.purchased_products = (user.purchased_products || [])
        .filter(pid => Number.isInteger(pid) && !deletedProductIds.includes(pid));
    });

    saveJSON(USERS_PATH, users);
    saveJSON(GOODS_PATH, goodsData);

    log(`DELETE /api/delete-account - userId ${userId} 탈퇴 및 상품 ${deletedProductIds.length}개 삭제`);
    res.json({ message: "회원 탈퇴 및 상품 삭제 완료" });
  } catch (e) {
    log("DELETE /api/delete-account - 오류: " + e.message);
    res.status(500).json({ message: "회원 탈퇴 실패" });
  }
});

module.exports = router;
