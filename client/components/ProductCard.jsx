import React from "react";
/** [1] React 임포트 */

import { useNavigate } from "react-router-dom";
/** [2] 상품 상세 페이지로 이동하기 위한 useNavigate 훅 임포트 */

import { useLikedStore } from "../context/LikedStore";
/** [3] 찜하기 상태 관리 context에서 좋아요 목록과 토글 함수 가져오기 */

import { useUser } from "../context/UserContext";
/** [3-1] 구매 기능 및 사용자 정보 관리를 위한 UserContext 가져오기 */

import "./ProductCard.css";
/** [4] 컴포넌트 전용 CSS 임포트 */

const ProductCard = ({ product, placeholder = false }) => {
  /** [5] 컴포넌트 인자
   * - product: 표시할 상품 데이터 객체
   * - placeholder: 빈 카드 렌더링 여부, 기본 false
   */

  const navigate = useNavigate();
  /** [6] 상세 페이지 이동 함수 */

  const { likedIds, toggleLike } = useLikedStore();
  /** [7] 찜한 상품 ID 목록과 토글 함수 추출 */

  const { purchaseProduct } = useUser();
  /** [7-1] 유저 정보와 구매 함수 가져오기 */

  // [8] 상품 데이터 없거나 placeholder면 빈 카드 렌더링
  if (placeholder || !product) {
    return <div className="product-card placeholder" />;
  }

  // [9] 현재 상품이 찜 목록에 있는지 확인
  const isLiked = likedIds.includes(product.id);

  // [10] 카드 클릭 시 상세 페이지로 이동 (상품 데이터 state 전달)
  const handleCardClick = () => {
    navigate("/product", { state: product });
  };

  // [11] 좋아요 버튼 클릭 시 클릭 이벤트 버블링 방지 후 찜 상태 토글
  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(product.id);
  };

  // [12] 장바구니 버튼 클릭 이벤트 (구매 처리)
  const handleCartClick = async (e) => {
    e.stopPropagation();
    await purchaseProduct(product.id); // 알림 포함된 purchaseProduct에 위임
  };

  // [13] JSX 반환부: 카드 전체, 좋아요/장바구니 버튼, 이미지, 상품 정보 렌더링
  return (
    <div className="product-card" onClick={handleCardClick} style={{ cursor: "pointer" }}>
      <button
        className="like-button"
        onClick={handleLikeClick}
        style={{
          color: isLiked ? "#e60000" : "#888888", // 찜한 경우 빨간색, 아니면 회색
          backgroundColor: "white",
        }}
        aria-label="좋아요"
      >
        ♥
      </button>
      <button
        className="cart-button"
        onClick={handleCartClick}
        aria-label="장바구니"
      >
        🛒
      </button>

      <div className="image-section">
        <img src={product.imageUrl} alt={product.name} className="product-image" />
      </div>

      <div className="product-info">
        <p className="product-tag">#{product.category}</p>
        <p className="product-name">{product.name}</p>
        <p className="product-description">{product.description}</p>

        <div className="product-popularity-price">
          <p className="product-popularity">인기도: {product.popularity ?? 0}</p>
          <p className="product-price">{product.price.toLocaleString()}원</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
/** [14] ProductCard 컴포넌트 기본 export */
