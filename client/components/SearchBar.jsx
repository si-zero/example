import React, { useState } from "react";
/** [1] React와 useState 훅 임포트 */

import { useNavigate, useLocation } from "react-router-dom";
/** [2] react-router-dom에서 페이지 이동과 현재 URL 정보 조회용 훅 임포트 */

import './SearchBar.css';
/** [3] 컴포넌트 전용 CSS 임포트 */

const SearchBar = () => {
  /**
   * [4] navigate: 페이지 강제 이동을 위한 함수
   * location: 현재 URL 정보(쿼리스트링 등)를 가져오기 위한 객체
   */
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * [5] 현재 URL 쿼리스트링에서 'query' 파라미터 값을 추출하여
   * 초기 검색어 상태로 설정.
   * 없으면 빈 문자열("")로 초기화.
   */
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get("query") || "";

  /**
   * [6] input: 검색어 상태 변수
   * setInput: input 상태 변경 함수
   * 초기값은 URL에서 가져온 initialQuery
   */
  const [input, setInput] = useState(initialQuery);

  /**
   * [7] handleSearch 함수:
   * - input이 공백이 아니면 검색어를 인코딩하여
   *   /search 경로에 쿼리 파라미터로 붙여 페이지 이동
   */
  const handleSearch = () => {
    if (input.trim()) {
      navigate(`/search?query=${encodeURIComponent(input.trim())}`);
    }
  };

  /**
   * [8] onKeyDown 이벤트 핸들러:
   * - 사용자가 입력창에서 엔터키를 누르면 handleSearch 호출
   */
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  /**
   * [9] JSX 반환부:
   * - 텍스트 입력창: 검색어 입력용
   * - 검색 버튼: 클릭 시 handleSearch 호출
   * - placeholder에 다중 조건 검색 가능하다는 안내 문구 포함
   * - 입력값은 input 상태와 연동되어 있고, 변경 시 상태 업데이트
   */
  return (
    <div className="search-wrapper">
      <input
        type="text"
        placeholder="이름, 카테고리로 검색 가능하며, + - & 연산자를 사용하여 다중 조건 검색이 가능합니다"
        className="search-input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button onClick={handleSearch}>검색</button>
    </div>
  );
};

export default SearchBar;
/** [10] SearchBar 컴포넌트 기본 export */
