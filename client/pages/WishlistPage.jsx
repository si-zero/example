import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import { useLoading } from "../context/LoadingContext";
import { useLikedStore } from "../context/LikedStore";
import { useUser } from "../context/UserContext";
import LikedProductCard from "../components/LikedProductCard";
import { getApiBase } from "../utils/getApiBase";
import { useTitle } from "../context/TitleContext";
import "./WishlistPage.css";

const WishlistPage = () => {
  const [likedProducts, setLikedProducts] = useState([]);
  const { likedIds, toggleLike } = useLikedStore();
  const { startLoading, stopLoading } = useLoading();
  const { purchaseProduct, refreshUser } = useUser();

  // 서버로부터 사용자 데이터 갱신 (단순 디버깅 용도)
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
   const { setTitle } = useTitle(); // context에서 title 설정 가져오기
    useEffect(() => {
      setTitle("찜목록");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  useEffect(() => {
    const fetchLikedProducts = async () => {
      if (likedIds.length === 0) {
        setLikedProducts([]);
        return;
      }

      try {
        startLoading();
        const res = await fetch(`${getApiBase()}/api/liked-products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ likedIds }),
        });

        const data = await res.json();
        setLikedProducts(data);
      } catch {
        // 에러 무시
      } finally {
        stopLoading();
      }
    };

    fetchLikedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedIds]);

  return (
    <>
      <Header />
      <SearchBar />
      <div className="wishlist-page">
        <h2 className="wishlist-title">찜한 상품 목록</h2>
        {likedIds.length === 0 ? (
          <p>찜한 상품이 없습니다.</p>
        ) : (
          <div className="wishlist-list">
            {likedProducts.map((product) => (
              <LikedProductCard
                key={product.id}
                product={product}
                onPrimaryClick={() => purchaseProduct(product.id)}
                onSecondaryClick={() => toggleLike(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistPage;
