/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react"; {/* ① React 및 훅 임포트 */}
import Header from "../components/Header"; {/* ② 헤더 컴포넌트 */}
import SearchBar from "../components/SearchBar"; {/* ③ 검색창 컴포넌트 */}
import EventBanner from "../components/EventBanner"; {/* ④ 이벤트 배너 컴포넌트 */}
import ProductCard from "../components/ProductCard"; {/* ⑤ 상품 카드 컴포넌트 */}
import { useUser } from "../context/UserContext";
import { getApiBase } from "../utils/getApiBase";
import { useTitle } from "../context/TitleContext";
import "./MainPage.css"; {/* ⑥ 스타일 임포트 */}

function MainPage() {
  const EVENT_PAGE_SIZE = 3; {/* ⑦ 이벤트 한 페이지당 아이템 수 */}
  const MAX_EVENT_PAGES = 2; {/* ⑧ 이벤트 최대 페이지 수 */}
  const PRODUCT_PAGE_SIZE = 6; {/* ⑨ 상품 한 페이지당 아이템 수 */}
  const MAX_PRODUCT_PAGES = 4; {/* ⑩ 상품 최대 페이지 수 */}
  const { refreshUser } = useUser();
  // 서버로부터 사용자 데이터 갱신 (단순 디버깅 용도)
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ⑫ 카테고리 배열과 상태: 인기상품 추가 (스크립트 위에)
  const categories = ["인기상품", "스크립트", "아이템", "코드", "리소스"];

  // ⑫ 상태: 각 카테고리별 상품 페이지 정보 관리
  const [productsByCategory, setProductsByCategory] = useState(
    categories.reduce((acc, cat) => {
      acc[cat] = { pages: {}, total: 0, hasMore: true };
      return acc;
    }, {})
  );
  const [pagesByCategory, setPagesByCategory] = useState(
    categories.reduce((acc, cat) => {
      acc[cat] = 1;
      return acc;
    }, {})
  );
 const { setTitle } = useTitle(); // context에서 title 설정 가져오기
  useEffect(() => {
    setTitle("메인페이지");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // ⑪ 상태: 이벤트 리스트, 현재 이벤트 페이지
  const [events, setEvents] = useState([]);
  const [eventPage, setEventPage] = useState(0);

  const categoriesRef = useRef(categories); {/* ⑬ 최신 카테고리 참조 유지 */}
  categoriesRef.current = categories;

  // ⑭ 이벤트 데이터 fetch (초기 마운트 시)
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/events`);
        const data = await res.json();

        if (Array.isArray(data)) {
          const result = [];
          const maxCount = EVENT_PAGE_SIZE * MAX_EVENT_PAGES;
          for (let i = 0; i < maxCount; i++) {
            if (i >= data.length) break;
            result.push(data[i]);
          }
          setEvents(result);
        }
      } catch (err) {
        console.error("이벤트 fetch 실패:", err);
        setEvents([]);
      }
    };
    loadEvents();
  }, []);

  // ⑮ 상품 데이터 fetch: 카테고리별, 페이지별로 순차적 로딩 (초기 마운트 시)
  useEffect(() => {
    const loadAllCategoryProducts = async () => {
      const newState = { ...productsByCategory };

      for (const category of categoriesRef.current) {
        let hasMore = true;
        for (let page = 1; page <= MAX_PRODUCT_PAGES; page++) {
          if (!hasMore) break;
          if (newState[category].pages[page]) continue;

          try {
            const res = await fetch(
              `${getApiBase()}/api/data/goods?category=${encodeURIComponent(
                category
              )}&page=${page}&limit=${PRODUCT_PAGE_SIZE}`
            );
            const data = await res.json();
            newState[category].pages[page] = data.products || [];
            newState[category].total = data.total || 0;
            newState[category].hasMore = data.hasMore;
            hasMore = data.hasMore;
          } catch (err) {
            console.error(`상품 fetch 실패 - ${category} 페이지 ${page}`, err);
            newState[category].pages[page] = [];
            newState[category].hasMore = false;
            break;
          }
        }
      }

      setProductsByCategory(newState);
    };

    loadAllCategoryProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⑯ 현재 이벤트 페이지 수 계산 및 현재 페이지 이벤트 데이터 추출
  const eventPageCount = Math.ceil(events.length / EVENT_PAGE_SIZE);
  const currentEvents = events.slice(
    eventPage * EVENT_PAGE_SIZE,
    (eventPage + 1) * EVENT_PAGE_SIZE
  );

  // ⑰ 이벤트 페이지 변경 함수 (페이지 범위 내)
  const changeEventPage = (delta) => {
    setEventPage((prev) =>
      Math.max(0, Math.min(prev + delta, eventPageCount - 1))
    );
  };

  // ⑱ 상품 페이지 변경 함수 (각 카테고리 별 페이지 범위 내)
  const changeProductPage = (category, delta) => {
    setPagesByCategory((prev) => {
      const oldPage = prev[category];
      const total = productsByCategory[category]?.total || 0;
      const maxPage = Math.min(
        Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE)),
        MAX_PRODUCT_PAGES
      );
      const newPage = Math.min(maxPage, Math.max(1, oldPage + delta));
      if (newPage === oldPage) return prev;
      return { ...prev, [category]: newPage };
    });
  };

  // ⑲ 빈자리 채우기 함수: 데이터 부족 시 빈 컴포넌트로 채움 (이벤트, 상품 공통)
  const fillEmpty = (array, size, EmptyComponent) => {
    const filled = [...array];
    while (filled.length < size) {
      filled.push(<EmptyComponent key={`empty-${filled.length}`} />);
    }
    return filled;
  };

  // ⑳ 빈 이벤트 및 빈 상품 컴포넌트 정의
  const EmptyEvent = () => <div className="event-banner empty" />;
  const EmptyProduct = () => <div className="product-card empty" />;

  return (
    <>
      <Header /> {/* ㉑ 상단 헤더 */}
      <SearchBar /> {/* ㉒ 검색창 */}
      <div id="root">
        {/* ㉓ 이벤트 섹션 */}
        <h2>이벤트 배너</h2>
        <div className="carousel-container">
          <button
            className={`carousel-button left-button ${eventPage > 0 ? "active" : ""}`}
            disabled={eventPage === 0}
            onClick={() => changeEventPage(-1)}
            aria-label="이벤트 이전"
          >
            &#10094;
          </button>
          <div className="carousel">
            {fillEmpty(
              currentEvents.map((event, idx) => (
                <EventBanner key={idx} event={event} />
              )),
              EVENT_PAGE_SIZE,
              EmptyEvent
            )}
          </div>
          <button
            className={`carousel-button right-button ${
              eventPage < eventPageCount - 1 ? "active" : ""
            }`}
            disabled={eventPage === eventPageCount - 1}
            onClick={() => changeEventPage(1)}
            aria-label="이벤트 다음"
          >
            &#10095;
          </button>
        </div>

        {/* ㉔ 상품 섹션 (카테고리별 반복) */}
        {categories.map((category) => {
          const page = pagesByCategory[category];
          const { pages, total } = productsByCategory[category] || {};
          const products = (pages && pages[page]) || [];
          const pageCount = Math.min(
            Math.max(1, Math.ceil(total / PRODUCT_PAGE_SIZE)),
            MAX_PRODUCT_PAGES
          );

          return (
            <section key={category}>
              <h2>{category === "인기상품" ? "인기 상품" : category}</h2>
              <div className="carousel-container">
                <button
                  className={`carousel-button left-button ${page > 1 ? "active" : ""}`}
                  disabled={page === 1}
                  onClick={() => changeProductPage(category, -1)}
                  aria-label={`${category} 이전`}
                >
                  &#10094;
                </button>
                <div className="carousel">
                  {fillEmpty(
                    products.map((product, idx) => (
                      <ProductCard key={idx} product={product} />
                    )),
                    PRODUCT_PAGE_SIZE,
                    EmptyProduct
                  )}
                </div>
                <button
                  className={`carousel-button right-button ${page < pageCount ? "active" : ""}`}
                  disabled={page === pageCount}
                  onClick={() => changeProductPage(category, 1)}
                  aria-label={`${category} 다음`}
                >
                  &#10095;
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

export default MainPage;
