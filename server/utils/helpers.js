const fs = require("fs");
const path = require("path");

// JSON 파일 경로 상수 (유저, 상품)
const USERS_PATH = path.join(__dirname, "../data/users.json");
const GOODS_PATH = path.join(__dirname, "../data/goods.json");

// 로그 출력
function log(message) {
  const now = new Date().toISOString();
  console.log(`[${now}] ${message}`);
}

// JSON 동기 로드
function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// 경로별 쓰기 큐 (쓰기 충돌 방지)
const writeQueues = new Map();

// JSON 안전 저장 (비동기 큐)
function saveJSON(filePath, data) {
  if (!writeQueues.has(filePath)) {
    writeQueues.set(filePath, Promise.resolve());
  }

  const queue = writeQueues.get(filePath);
  const newQueue = queue.then(() => {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
          console.error(`파일 저장 오류: ${filePath}`, err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });

  writeQueues.set(filePath, newQueue);
  return newQueue;
}

// 인기상품 계산 및 저장
function calculateAndSavePopularity() {
  const users = loadJSON(USERS_PATH);
  const goodsData = loadJSON(GOODS_PATH);

  const updatedGoods = {};

  for (const category in goodsData) {
    if (category === "인기상품") continue;

    updatedGoods[category] = goodsData[category].map(product => {
      const likeCount = users.filter(u => u.likes_product?.includes(product.id)).length;
      const purchaseCount = users.filter(u => u.purchased_products?.includes(product.id)).length;
      const both = users.filter(
        u => u.likes_product?.includes(product.id) && u.purchased_products?.includes(product.id)
      ).length;
      const popularity = likeCount + purchaseCount * 2 - both;

      return { ...product, popularity };
    }).sort((a, b) => b.popularity - a.popularity || a.id - b.id);
  }

  const allProducts = Object.values(updatedGoods).flat();

  const seen = new Set();
  const top10 = allProducts
    .filter(p => typeof p.popularity === "number")
    .sort((a, b) => b.popularity - a.popularity || a.id - b.id)
    .filter(p => {
      const baseId = getRootId(p);
      if (seen.has(baseId)) return false;
      seen.add(baseId);
      return true;
    })
    .slice(0, 10)
    .map(p => ({
      ...p,
      originalId: getRootId(p),
      id: `item${getRootId(p)}`
    }));

  goodsData["인기상품"] = top10;
  saveJSON(GOODS_PATH, { ...updatedGoods, 인기상품: top10 });
  log("🔁 인기상품 갱신 완료");
}

// 중첩된 originalId 제거 → 숫자 ID 추출
function getRootId(product) {
  let id = product.originalId ?? product.id;
  while (typeof id === "string" && id.startsWith("item")) {
    id = id.replace(/^item/, "");
  }
  return Number(id);
}

// originalId → 원래 id로 복원
function sanitizeProductList(products) {
  return products.map(({ originalId, ...rest }) => ({
    ...rest,
    id: originalId ?? rest.id
  }));
}

// export
module.exports = {
  USERS_PATH,
  GOODS_PATH,
  log,
  loadJSON,
  saveJSON,
  calculateAndSavePopularity,
  sanitizeProductList
};
