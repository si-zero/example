import React from "react";
/** [1] React 임포트 */

import "./Pagination.css";
/** [2] 컴포넌트 전용 CSS 임포트 */

const Pagination = ({ currentPage, pageCount, onPageChange }) => {
  /** [3] 컴포넌트 props
   * - currentPage: 현재 선택된 페이지 (0-based index)
   * - pageCount: 전체 페이지 수
   * - onPageChange: 페이지 변경 콜백 함수 (인덱스 전달)
   */

  const totalButtons = 5;
  /** [4] 한 번에 보여줄 최대 페이지 버튼 개수 */

  const half = Math.floor(totalButtons / 2);
  /** [5] currentPage 기준으로 양쪽에 보여줄 페이지 버튼 개수 */

  // [6] 시작과 끝 페이지 버튼 인덱스 초기 계산
  let start = Math.max(0, currentPage - half);
  let end = Math.min(pageCount - 1, currentPage + half);

  // [7] 현재 페이지가 앞쪽 가까우면 시작은 0, 끝을 totalButtons-1까지 늘림
  if (currentPage <= half) {
    end = Math.min(pageCount - 1, totalButtons - 1);
  }
  // [8] 현재 페이지가 뒤쪽 가까우면 끝은 마지막 페이지, 시작은 끝에서 totalButtons 개만큼 뺌
  if (currentPage + half >= pageCount - 1) {
    start = Math.max(0, pageCount - totalButtons);
  }

  // [9] 페이지 버튼 배열 생성 (start부터 end까지)
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(
      <button
        key={i}
        className={`page-number-button ${i === currentPage ? "active" : ""}`}
        onClick={() => onPageChange(i)}
        aria-label={`${i + 1} 페이지로 이동`}
      >
        {i + 1}
      </button>
    );
  }

  // [10] JSX 반환: 처음 페이지, 페이지 버튼들, 마지막 페이지 버튼 렌더링
  return (
    <div className="pagination">
      {/* 처음 페이지 버튼 - currentPage가 0이면 비활성화 */}
      <button
        className="page-nav-button"
        onClick={() => onPageChange(0)}
        disabled={currentPage === 0}
        aria-label="처음 페이지로 이동"
      >
        &laquo;
      </button>

      {/* 페이지 번호 버튼들 */}
      {pages}

      {/* 마지막 페이지 버튼 - currentPage가 마지막이면 비활성화 */}
      <button
        className="page-nav-button"
        onClick={() => onPageChange(pageCount - 1)}
        disabled={currentPage === pageCount - 1}
        aria-label="마지막 페이지로 이동"
      >
        &raquo;
      </button>
    </div>
  );
};

export default Pagination;
/** [11] Pagination 컴포넌트 기본 export */
