const express = require("express");
const path = require("path");
const router = express.Router();
const {
  loadJSON,
  saveJSON,
  log,
  sanitizeProductList
} = require("../utils/helpers");

const GOODS_PATH = path.join(__dirname, "../data/goods.json");
const USERS_PATH = path.join(__dirname, "../data/users.json");

function filterProductsBySearch(query, products) {
  if (!query || query.trim() === "") return products;

  let current = "";
  let inQuotes = false;
  for (let ch of query) {
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (!inQuotes && ch === " ") {
    } else {
      current += ch;
    }
  }

  const unionParts = current.split("+").map(p => p.trim()).filter(Boolean);

  const getProductSet = (expr) => {
    if (expr.includes("-")) {
      const [left, right] = expr.split("-").map(e => e.trim());
      return getProductSet(left).filter(p => !getProductSet(right).includes(p));
    }
    if (expr.includes("&")) {
      const parts = expr.split("&").map(e => e.trim());
      return parts.reduce(
        (acc, part, idx) =>
          idx === 0 ? getProductSet(part) : acc.filter(p => getProductSet(part).includes(p)),
        []
      );
    }
    if (expr.startsWith('"') && expr.endsWith('"')) {
      const term = expr.slice(1, -1);
      return products.filter(p => p.name.includes(term) || p.category.includes(term));
    }
    if (expr.startsWith("#")) {
      const cat = expr.slice(1);
      return products.filter(p => p.category.includes(cat));
    }
    return products.filter(p => p.name.includes(expr));
  };

  return unionParts.reduce((acc, part) => [...new Set([...acc, ...getProductSet(part)])], []);
}

function filterAllCategories(goodsData, query) {
  const categories = Object.keys(goodsData).filter(c => c !== "인기상품");
  return categories
    .map(cat => filterProductsBySearch(query, goodsData[cat]))
    .flat();
}

router.get("/data/goods", (req, res) => {
  try {
    const { category, page = 1, limit = 5 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const goodsData = loadJSON(GOODS_PATH);

    let products = category && category !== "전체"
      ? goodsData[category] || []
      : Object.entries(goodsData)
          .filter(([key]) => key !== "인기상품")
          .map(([, value]) => value)
          .flat();

    const total = products.length;
    const start = (pageNum - 1) * limitNum;
    const paged = products.slice(start, start + limitNum);

    log(`GET /data/goods - cat:${category || "전체"} page:${pageNum} limit:${limitNum}`);
    res.json({
      products: sanitizeProductList(paged),
      page: pageNum,
      limit: limitNum,
      total,
      hasMore: start + limitNum < total
    });
  } catch (e) {
    log("GET /data/goods - 오류: " + e.message);
    res.status(500).json({ message: "상품 조회 실패" });
  }
});

router.get("/products-by-category", (req, res) => {
  const { category, count = 5, id } = req.query;
  if (!category) return res.status(400).json({ error: "category is required" });

  try {
    const goods = loadJSON(GOODS_PATH)[category];
    if (!goods) return res.status(404).json({ error: "Category not found" });

    const limit = parseInt(count, 10);
    const slice = goods.slice(0, limit + 1);
    const result = id && slice.some(p => p.id === +id)
      ? slice.filter(p => p.id !== +id).slice(0, limit)
      : slice.slice(0, limit);

    log(`GET /products-by-category - cat:${category} limit:${limit} exclude:${id || "none"}`);
    res.json({ products: sanitizeProductList(result) });
  } catch (e) {
    log("GET /products-by-category - 오류: " + e.message);
    res.status(500).json({ error: "상품 조회 실패" });
  }
});

router.post("/add-product", (req, res) => {
  const { userId, id, name, description, category, imageUrl, price, picnum } = req.body;
  if (!userId || !name || !description || !category || !imageUrl || price === undefined) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  try {
    const goodsData = loadJSON(GOODS_PATH);
    const users = loadJSON(USERS_PATH);
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ message: "유저를 찾을 수 없습니다." });

    const finalPicnum = typeof picnum === "number" ? picnum : 5;

    if (id) {
      const pid = +id;
      let oldCategory = null, oldProduct = null;

      Object.keys(goodsData).forEach(cat => {
        if (cat === "인기상품") return;
        const found = goodsData[cat].find(p => p.id === pid);
        if (found) { oldCategory = cat; oldProduct = found; }
      });

      if (!oldProduct) return res.status(404).json({ message: "수정할 상품을 찾을 수 없습니다." });

      goodsData[oldCategory] = goodsData[oldCategory].filter(p => p.id !== pid);

      const updated = {
        ...oldProduct,
        name, description, category, imageUrl,
        price: Number(price), picnum: finalPicnum
      };

      if (!goodsData[category]) goodsData[category] = [];
      goodsData[category].push(updated);
      if (!user.products.includes(pid)) user.products.push(pid);

      saveJSON(GOODS_PATH, goodsData);
      saveJSON(USERS_PATH, users);
      log(`POST /add-product - 상품 ${pid} 수정`);
      return res.json({ message: "상품 수정 완료", updated: true });
    }

    const all = Object.entries(goodsData)
      .filter(([k]) => k !== "인기상품")
      .map(([, list]) => list)
      .flat();

    const newId = all.length ? Math.max(...all.map(p => p.id)) + 1 : 1;

    const newProduct = {
      id: newId,
      developer: userId,
      name,
      description,
      category,
      imageUrl,
      price: Number(price),
      picnum: finalPicnum,
      createdAt: new Date().toISOString(),
      popularity: 0
    };

    if (!goodsData[category]) goodsData[category] = [];
    goodsData[category].push(newProduct);
    user.products.push(newId);

    saveJSON(GOODS_PATH, goodsData);
    saveJSON(USERS_PATH, users);

    log(`POST /add-product - 상품 ${newId} 등록`);
    res.status(201).json({ message: "상품 등록 완료", product: newProduct });
  } catch (e) {
    log("POST /add-product - 오류: " + e.message);
    res.status(500).json({ message: "등록 실패" });
  }
});

router.delete("/delete-product/:id", (req, res) => {
  const pid = +req.params.id;
  if (isNaN(pid)) return res.status(400).json({ message: "유효한 상품 ID가 필요합니다." });

  try {
    const goods = loadJSON(GOODS_PATH);
    const users = loadJSON(USERS_PATH);
    let found = false;

    for (const cat in goods) {
      if (cat === "인기상품") continue;
      const before = goods[cat].length;
      goods[cat] = goods[cat].filter(p => p.id !== pid);
      if (before !== goods[cat].length) found = true;
    }
    if (!found) return res.status(404).json({ message: "상품을 찾을 수 없습니다." });

    users.forEach(u => {
      u.products = (u.products || []).filter(id => id !== pid);
      u.likes_product = (u.likes_product || []).filter(id => id !== pid);
    });

    saveJSON(GOODS_PATH, goods);
    saveJSON(USERS_PATH, users);
    log(`DELETE /delete-product - 상품 ${pid} 삭제`);
    res.json({ success: true, message: "상품이 삭제되었습니다." });
  } catch (e) {
    log("DELETE /delete-product - 오류: " + e.message);
    res.status(500).json({ message: "삭제 실패" });
  }
});

router.get("/search-ids", (req, res) => {
  try {
    const { query = "" } = req.query;
    const goodsData = loadJSON(GOODS_PATH);
    const ids = filterAllCategories(goodsData, query).map(p => p.originalId ?? p.id);

    log(`GET /search-ids - query:"${query}" matched:${ids.length}`);
    res.json({ ids });
  } catch (e) {
    log("GET /search-ids - 오류: " + e.message);
    res.status(500).json({ message: "검색 실패" });
  }
});

router.post("/products-by-ids", (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) return res.status(400).json({ message: "ids 배열이 필요합니다." });

  try {
    const goods = loadJSON(GOODS_PATH);
    const all = Object.entries(goods)
      .filter(([key]) => key !== "인기상품")
      .map(([, list]) => list)
      .flat();
    const result = all.filter(p => ids.includes(p.id));
    res.json(sanitizeProductList(result));
  } catch (e) {
    log("POST /products-by-ids - 오류: " + e.message);
    res.status(500).json({ message: "상품 조회 실패" });
  }
});

module.exports = router;
