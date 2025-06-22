import React from 'react';
import './EventBanner.css';  // [1] 이벤트 배너 전용 스타일 시트 임포트

const EventBanner = ({ event }) => {
  /** [2] EventBanner 컴포넌트
   * - 단일 이벤트 정보를 받아 배너 형태로 보여줌
   * - 배경색, 이미지, 제목, 설명을 포함
   * @param event : {
   *   backgroundColor: string (선택, 배경색),
   *   imageUrl: string (이벤트 이미지 URL),
   *   title: string (이벤트 제목),
   *   description: string (이벤트 설명)
   * }
   */

  // [3] 배경색 동적 적용 (없으면 기본 연한 파란색)
  const bannerStyle = {
    backgroundColor: event.backgroundColor || '#cce4ff'
  };

  return (
    <div className="event-banner" style={bannerStyle}>
      {/* [4] 이벤트 이미지를 담는 영역 */}
      <div className="banner-image-container">
        <img
          src={event.imageUrl}            // 이벤트 이미지 URL
          alt={event.title}               // 접근성 고려, 이미지 대체 텍스트로 제목 사용
          className="banner-image"
        />
      </div>

      {/* [5] 텍스트 정보 영역: 제목과 설명 */}
      <div className="banner-text">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-description">{event.description}</p>
      </div>
    </div>
  );
};

export default EventBanner;  // [6] 컴포넌트 기본 export
