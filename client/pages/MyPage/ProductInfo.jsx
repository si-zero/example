// src/pages/ProductInfo.jsx
import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import LikedProductCard from "../../components/LikedProductCard";
import { useNavigate } from "react-router-dom";
import { getApiBase } from "../../utils/getApiBase";
import "./ProductInfo.css";

const ProductInfo = () => {
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const fetchUserProducts = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/user-products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        });
        if (!res.ok) throw new Error("상품 불러오기 실패");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
        setProducts([]);
      }
    };

    fetchUserProducts();
  }, [user]);

  // 상품 수정 페이지로 상품 객체(state) 전달
  const handleEdit = (product) => {
    navigate("/edit-product", { state: { product } });
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`'${product.name}' 상품을 삭제하시겠습니까?`)) return;

    const res = await fetch(`${getApiBase()}/api/delete-product/${product.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      alert("삭제 실패");
    }
  };

  const handleAddProduct = () => {
    navigate("/add-product");
  };

  return (
    <div className="productinfo-page">
      <div className="productinfo-header">
        <h2 className="productinfo-title">내가 등록한 상품</h2>
        <button onClick={handleAddProduct} className="productinfo-add-button">
          상품 등록
        </button>
      </div>

      {products.length === 0 ? (
        <p className="productinfo-empty">등록된 상품이 없습니다.</p>
      ) : (
        <div className="productinfo-list">
          {products.map((product) => (
            <LikedProductCard
              key={product.id}
              product={product}
              onPrimaryClick={handleEdit}
              onSecondaryClick={handleDelete}
              primaryLabel="상품 수정"
              secondaryLabel="상품 삭제"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
