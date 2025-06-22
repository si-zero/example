import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import LikedProductCard from "../../components/LikedProductCard";
import { getApiBase } from "../../utils/getApiBase";
import "./ProductInfo.css";
const PurchaseHistory = () => {
  const { user } = useUser();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchPurchasedProducts = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/purchased-products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (!res.ok) throw new Error("구매한 상품 불러오기 실패");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      }
    };

    fetchPurchasedProducts();
  }, [user]);

  // 구매 상품 제거 함수
  const handleRemoveProduct = async (productId) => {
    if (!user) return;

    try {
      const res = await fetch(`${getApiBase()}/api/remove-purchased-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "구매 상품 제거 실패");
      }

      // 제거 성공 시 로컬 상태도 갱신
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error(error);
      alert("상품 제거 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="productinfo-page">
      <div className="productinfo-header">
        <h2 className="productinfo-title">구매한 상품 목록</h2>
      </div>

      {products.length === 0 ? (
        <p className="productinfo-empty">구매한 상품이 없습니다.</p>
      ) : (
        <div className="productinfo-list">
          {products.map((product) => (
            <LikedProductCard
              key={product.id}
              product={product}
              primaryLabel="다운로드"
              secondaryLabel="제거하기"
              onPrimaryClick={() => {              }}
              onSecondaryClick={() => handleRemoveProduct(product.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
