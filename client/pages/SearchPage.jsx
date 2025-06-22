import React, { useState, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import "./SearchPage.css";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiBase } from "../utils/getApiBase";
import { useTitle } from "../context/TitleContext";
const ITEMS_PER_ROW = 6;
const ROWS_PER_PAGE = 3;
const ITEMS_PER_PAGE = ITEMS_PER_ROW * ROWS_PER_PAGE;
const MAX_ITEMS_TO_FETCH = 180; 

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
  const query = useQuery();
  const searchQuery = query.get("query") || "";
  const navigate = useNavigate();
 const { setTitle } = useTitle(); // context에서 title 설정 가져오기
  useEffect(() => {
    setTitle("상품검색");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [productIds, setProductIds] = useState([]); // id 목록
  const [products, setProducts] = useState([]); // 실제 상품 데이터
  const [currentPage, setCurrentPage] = useState(1);

  // 1) 검색어 바뀔 때 상품 ID 목록 불러오기
  useEffect(() => {
    if (!searchQuery) {
      setProductIds([]);
      setProducts([]);
      setCurrentPage(1);
      return;
    }
    fetch(`${getApiBase()}/api/search-ids?query=${encodeURIComponent(searchQuery)}`)
      .then(res => res.json())
      .then(data => {
        const ids = data.ids || [];
        setProductIds(ids.slice(0, MAX_ITEMS_TO_FETCH));
        setCurrentPage(1);
      })
      .catch(err => {
        console.error("검색 ID 불러오기 실패:", err);
        setProductIds([]);
        setProducts([]);
      });
  }, [searchQuery]);

  // 2) 현재 페이지에 해당하는 id 목록으로 상품 데이터 요청
  useEffect(() => {
    if (productIds.length === 0) {
      setProducts([]);
      return;
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const idsForPage = productIds.slice(startIndex, endIndex);

    if (idsForPage.length === 0) {
      setProducts([]);
      return;
    }

    fetch(`${getApiBase()}/api/products-by-ids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: idsForPage }),
    })
      .then(res => res.json())
      .then(data => {
        setProducts(data || []);
      })
      .catch(err => {
        console.error("상품 데이터 불러오기 실패:", err);
        setProducts([]);
      });
  }, [productIds, currentPage]);

  const totalPages = Math.max(1, Math.ceil(productIds.length / ITEMS_PER_PAGE));

  // 페이지 범위 보정
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  // 결과가 없으면 3초 뒤 뒤로가기
  useEffect(() => {
    if (productIds.length === 0 && searchQuery) {
      const timer = setTimeout(() => {
        navigate(-1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [productIds.length, searchQuery, navigate]);

  // 상품 부족시 빈칸 채우기
  const placeholdersNeeded = (ITEMS_PER_ROW - (products.length % ITEMS_PER_ROW)) % ITEMS_PER_ROW;
  const totalProducts = [...products];
  for (let i = 0; i < placeholdersNeeded; i++) {
    totalProducts.push({ id: `placeholder-${i}`, placeholder: true });
  }

  return (
    <div className="search-page-container">
      <Header />
      <SearchBar />
      <h2>검색 결과: {searchQuery}</h2>

      {productIds.length === 0 ? (
        <p className="no-results-message">검색 결과가 없습니다. 이전 화면으로 돌아갑니다...</p>
      ) : (
        <>
          <div className="product-grid">
            {totalProducts.map((product) =>
              product.placeholder ? (
                <ProductCard key={product.id} placeholder />
              ) : (
                <ProductCard key={product.id} product={product} />
              )
            )}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage - 1}
              pageCount={totalPages}
              onPageChange={(page) => setCurrentPage(page + 1)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default SearchPage;
