import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ navigate 훅 가져오기
import "./LikedProductCard.css";

const LikedProductCard = ({
  product,
  onPrimaryClick,
  onSecondaryClick,
  primaryLabel = "구매하기",
  secondaryLabel = "찜 해제"
}) => {
  const navigate = useNavigate(); // ✅ navigate 함수 준비

  const formatDate = (dateString) => {
    if (!dateString) return "정보 없음";
    const d = new Date(dateString);
    if (isNaN(d)) return "정보 없음";
    return d.toISOString().slice(0, 10);
  };

  const handlePurchaseClick = () => {
    if (typeof onPrimaryClick === "function") {
      onPrimaryClick(product);
    }
  };

  const handleImageClick = () => {
    navigate("/product", { state: product }); // ✅ 상세 페이지 이동
  };

  return (
    <div className="wishlist-item">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="wishlist-image"
        onClick={handleImageClick} // ✅ 이미지 클릭 시 이동
        style={{ cursor: "pointer" }}
      />
      <div className="wishlist-info">
        <h3>{product.name}</h3>
        <p className="wishlist-description">{product.description}</p>
        <p style={{ fontSize: "12px", color: "#888", marginTop: "6px" }}>
          인기도: {typeof product.popularity === "number" ? product.popularity : "정보 없음"} | 등록일자: {formatDate(product.createdAt)}
        </p>
        <p className="wishlist-price">
          {product.price.toLocaleString()}원
        </p>
      </div>
      <div className="wishlist-actions">
        <button className="wishlist-button" onClick={handlePurchaseClick}>
          {primaryLabel}
        </button>
        <button
          className="wishlist-button"
          onClick={() => onSecondaryClick?.(product)}
          style={{ marginTop: "8px" }}
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
};

export default LikedProductCard;
