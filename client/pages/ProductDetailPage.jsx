import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ProductDetailPage.css";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import ProductCard from "../components/ProductCard";
import { useLikedStore } from "../context/LikedStore";
import { useUser } from "../context/UserContext";
import { getApiBase } from "../utils/getApiBase";
import { useTitle } from "../context/TitleContext";

const ProductDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state;
  const { setTitle } = useTitle();

  const [selectedImage, setSelectedImage] = useState(product?.imageUrl);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [developerName, setDeveloperName] = useState("정보 없음"); // ✅ 개발자 이름 상태 추가

  const { likedIds, toggleLike } = useLikedStore();
  const isLiked = product ? likedIds.includes(product.id) : false;

  const { purchaseProduct } = useUser();

  useEffect(() => {
    setTitle("상품상세");
  }, [setTitle]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!product) {
      navigate("/");
      return;
    }

    // ✅ 개발자 이름 비동기로 가져오기
    if (product.developer) {
      fetch(`${getApiBase()}/api/get-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: product.developer }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user?.name) {
            setDeveloperName(data.user.name);
          }
        })
        .catch(() => setDeveloperName("정보 없음"));
    }

    fetch(
      `${getApiBase()}/api/products-by-category?category=${encodeURIComponent(
        product.category
      )}&count=4&id=${encodeURIComponent(product.id)}`
    )
      .then((res) => res.json())
      .then((data) => {
        const products = data.products || [];
        setRelatedProducts(products);
      })
      .catch(() => {
        setRelatedProducts([]);
      });
  }, [product, navigate]);

  if (!product) return null;

  const handleAddToWishlist = () => {
    toggleLike(product.id);
  };

  const handleBuyNow = async () => {
    await purchaseProduct(product.id);
  };

  const handleCancel = () => {
    if (document.referrer.includes("/search")) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const getAdditionalImages = () => {
    if (!product || !product.picnum) return [];

    const match = product.imageUrl.match(/(.*)(\.[\w\d_-]+)$/i);
    if (!match) return [];

    const baseUrl = match[1];
    const ext = match[2];

    const images = [];
    for (let i = 1; i <= product.picnum; i++) {
      images.push(`${baseUrl}_${i}${ext}`);
    }
    return images;
  };

  const additionalImages = getAdditionalImages();

  return (
    <>
      <Header />
      <SearchBar />
      <div className="product-detail-container">
        <h3 style={{ fontSize: "30px" }}>{product.name}</h3>

        <div className="product-main-section">
          <div className="product-image-gallery">
            <img
              src={selectedImage}
              alt="선택된 이미지"
              className="main-image"
            />
            <div className="thumbnail-list">
              {[product.imageUrl, ...additionalImages].map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`썸네일 ${index + 1}`}
                  className={`thumbnail ${
                    selectedImage === img ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(img)}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ))}
            </div>
          </div>

          <div className="product-purchase-section">
            <p className="product-category">카테고리: {product.category}</p>
            <p className="product-developer">
              개발자: {developerName} ({product.developer})
            </p>
            <p className="product-price">{product.price.toLocaleString()}원</p>

            <button className="common-button" onClick={handleAddToWishlist}>
              {isLiked ? "찜 해제" : "찜 하기"}
            </button>

            <button className="common-button" onClick={handleBuyNow}>
              바로 구매하기
            </button>

            <button className="common-button" onClick={handleCancel}>
              취소
            </button>
          </div>
        </div>

        <div className="product-description-section">
          <h3>상품 설명</h3>
          <p>{product.description}</p>
        </div>

        <div className="related-products-section">
          <h3>연관 상품</h3>
          <div className="related-products-grid">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))
            ) : (
              <p>연관 상품이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
