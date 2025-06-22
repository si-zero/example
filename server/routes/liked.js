const express = require("express");
const path = require("path");
const router = express.Router();
const { loadJSON, saveJSON, log } = require("../utils/helpers");

const USERS_PATH = path.join(__dirname, "../data/users.json");
const GOODS_PATH = path.join(__dirname, "../data/goods.json");

// 찜 상태 업데이트 (추가/제거)
router.post("/liked", (req, res) => {
  const { id, liked, userId } = req.body;

  if (typeof id === "undefined" || typeof liked === "undefined" || !userId) {
    log("POST /liked - 잘못된 요청: id, liked, userId 모두 필요");
    return res.status(400).json({ message: "id, liked, userId 모두 필요합니다." });
  }

  try {
    const users = loadJSON(USERS_PATH);
    const user = users.find(u => u.id === userId);
    if (!user) {
      log(`POST /liked - userId ${userId} 없음`);
      return res.status(404).json({ message: `userId ${userId} 를 가진 유저가 없습니다.` });
    }

    if (liked && !user.likes_product.includes(id)) {
      user.likes_product.push(id);
      log(`POST /liked - ${userId} 유저의 찜목록에 ${id} 추가`);
    } else if (!liked) {
      user.likes_product = user.likes_product.filter(pid => pid !== id);
      log(`POST /liked - ${userId} 유저의 찜목록에서 ${id} 제거`);
    }

    saveJSON(USERS_PATH, users);
    res.json({ liked: user.likes_product });
  } catch (e) {
    log("POST /liked - 오류: " + e.message);
    res.status(500).json({ message: "찜 상태 업데이트 실패" });
  }
});

// 찜한 상품 목록 조회
router.post("/liked-products", (req, res) => {
  const { userId, likedIds } = req.body;

  try {
    const goods = loadJSON(GOODS_PATH);
    const allProducts = Object.values(goods).flat();
    let filtered = [];

    if (userId) {
      const users = loadJSON(USERS_PATH);
      const user = users.find(u => u.id === userId);
      if (!user) {
        log(`POST /liked-products - userId ${userId} 없음`);
        return res.status(404).json({ message: `userId ${userId} 를 가진 유저가 없습니다.` });
      }
      filtered = allProducts.filter(p => user.likes_product.includes(p.id));
    } else if (Array.isArray(likedIds)) {
      filtered = allProducts.filter(p => likedIds.includes(p.id));
    } else {
      return res.status(400).json({ message: "userId 또는 likedIds 필요" });
    }

    log(`POST /liked-products - 조회 성공`);
    res.json(filtered);
  } catch (e) {
    log("POST /liked-products - 오류: " + e.message);
    res.status(500).json({ message: "찜한 상품 조회 실패" });
  }
});

module.exports = router;
