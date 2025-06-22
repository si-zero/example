const express = require("express");
const path = require("path");
const router = express.Router();
const { loadJSON, saveJSON, log } = require("../utils/helpers");

const USERS_PATH = path.join(__dirname, "../data/users.json");
const GOODS_PATH = path.join(__dirname, "../data/goods.json");

// 상품 구매
router.post("/purchase", (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || typeof productId !== "number") {
    return res.status(400).json({ message: "userId와 숫자형 productId가 필요합니다." });
  }

  try {
    const users = loadJSON(USERS_PATH);
    const goodsData = loadJSON(GOODS_PATH);

    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const allProducts = Object.values(goodsData).flat();
    const product = allProducts.find(p => p.id === productId);
    if (!product) return res.status(404).json({ message: "상품을 찾을 수 없습니다." });

    if (!Array.isArray(user.purchased_products)) user.purchased_products = [];

    if (user.purchased_products.includes(productId)) {
      return res.status(409).json({ message: "이미 구매한 상품입니다." });
    }

    user.purchased_products.push(productId);
    saveJSON(USERS_PATH, users);

    log(`POST /purchase - 유저 ${userId}가 상품 ${productId} 구매 완료`);
    res.json({ success: true, message: "구매 완료", purchased_products: user.purchased_products });
  } catch (e) {
    log("POST /purchase - 오류: " + e.message);
    res.status(500).json({ message: "구매 실패" });
  }
});

// 유저 구매 목록 조회
router.post("/purchased-products", (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    log("POST /purchased-products - userId 누락");
    return res.status(400).json({ message: "userId가 필요합니다." });
  }

  try {
    const users = loadJSON(USERS_PATH);
    const user = users.find(u => u.id === userId);
    if (!user) {
      log(`POST /purchased-products - userId ${userId} 없음`);
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }

    const goodsData = loadJSON(GOODS_PATH);
    const allProducts = Object.values(goodsData).flat();

    const purchasedIds = Array.isArray(user.purchased_products) ? user.purchased_products : [];
    const purchasedProducts = allProducts.filter(p => purchasedIds.includes(p.id));

    log(`POST /purchased-products - 유저 ${userId} 구매 상품 ${purchasedProducts.length}개 반환`);
    res.json(purchasedProducts);
  } catch (e) {
    log("POST /purchased-products - 오류: " + e.message);
    res.status(500).json({ message: "구매 상품 조회 실패" });
  }
});

// 구매 취소
router.post("/remove-purchased-product", (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || typeof productId !== "number") {
    return res.status(400).json({ message: "userId와 숫자형 productId가 필요합니다." });
  }

  try {
    const users = loadJSON(USERS_PATH);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const user = users[userIndex];
    if (!Array.isArray(user.purchased_products)) {
      return res.status(400).json({ message: "유저의 구매 목록이 없습니다." });
    }

    const beforeCount = user.purchased_products.length;
    user.purchased_products = user.purchased_products.filter(id => id !== productId);

    if (user.purchased_products.length === beforeCount) {
      return res.status(404).json({ message: "구매 목록에 해당 상품이 없습니다." });
    }

    users[userIndex] = user;
    saveJSON(USERS_PATH, users);

    res.json({ message: "구매 상품에서 삭제되었습니다.", purchased_products: user.purchased_products });
  } catch (e) {
    log("POST /remove-purchased-product - 오류: " + e.message);
    res.status(500).json({ message: "구매 상품 삭제 실패" });
  }
});

module.exports = router;
