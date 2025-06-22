const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 📌 라우터 등록
app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/user"));
app.use("/api", require("./routes/product"));
app.use("/api", require("./routes/liked"));
app.use("/api", require("./routes/purchase"));
app.use("/api", require("./routes/event"));

// 🔁 인기 상품 갱신 타이머
const { calculateAndSavePopularity } = require("./utils/helpers");
setInterval(calculateAndSavePopularity, 10 * 1000); // 10초마다

// ✅ 서버 실행
const { log } = require("./utils/helpers");
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
