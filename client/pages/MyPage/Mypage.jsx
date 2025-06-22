/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { useLoading } from "../../context/LoadingContext";
import { useNavigate } from "react-router-dom";
import ProductInfo from "./ProductInfo";
import PurchaseHistory from "./PurchaseHistory";
import AccountEdit from "./AccountEdit";
import Header from "../../components/Header";
import SearchBar from "../../components/SearchBar";
import { getApiBase } from "../../utils/getApiBase";
import { useTitle } from "../../context/TitleContext";
import "./MyPage.css";
const MyPage = () => {
  const [activeTab, setActiveTab] = useState("AccountEdit");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { user, logout } = useUser();
  const { startLoading, stopLoading } = useLoading();
  const { setTitle } = useTitle(); // context에서 title 설정 가져오기
  useEffect(() => {
    setTitle("마이페이지");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const navigate = useNavigate();

  const handleAccountDelete = async () => {
    if (!user?.id) {
      alert("유저 정보가 없습니다.");
      setShowDeleteConfirm(false);
      return;
    }

    startLoading(); // 로딩 시작

    try {
      const res = await fetch(`${getApiBase()}/api/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (res.ok) {
        alert("계정이 성공적으로 삭제되었습니다.");
        setDeleteSuccess(true);
        setShowDeleteConfirm(false);
        logout();

        setTimeout(() => {
          stopLoading(); // 로딩 종료
          navigate("/main");
        }, 2500);
      } else {
        const data = await res.json();
        alert(data.message || "회원 탈퇴에 실패했습니다.");
        setShowDeleteConfirm(false);
        stopLoading();
      }
    } catch (error) {
      alert("서버 오류로 회원 탈퇴에 실패했습니다.");
      setShowDeleteConfirm(false);
      stopLoading();
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "ProductInfo":
        return <ProductInfo />;
      case "PurchaseHistory":
        return <PurchaseHistory />;
      case "AccountEdit":
        return <AccountEdit />;
      default:
        return <div>존재하지 않는 탭입니다.</div>;
    }
  };

  return (
    <>
      <Header />
      <SearchBar />
      <div className="mypage-container">
        <h1 className="mypage-title">마이페이지</h1>
        <div className="mypage-tabs">
          <button onClick={() => setActiveTab("PurchaseHistory")}>
            주문내역
          </button>
          <button onClick={() => setActiveTab("ProductInfo")}>상품관리</button>
          <button onClick={() => setActiveTab("AccountEdit")}>회원정보</button>
          <button
            onClick={() => {
              setShowDeleteConfirm(true);
              setDeleteResult(null);
            }}
          >
            회원탈퇴
          </button>
        </div>

        <div className="mypage-content">{renderTabContent()}</div>

        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <p>정말로 회원 탈퇴를 진행하시겠습니까?</p>
              <div className="modal-buttons">
                <button onClick={handleAccountDelete}>예</button>
                <button onClick={() => setShowDeleteConfirm(false)}>
                  아니오
                </button>
              </div>
            </div>
          </div>
        )}

        {/* alert 로 대체하여 UI 메시지창 제거 */}
      </div>
    </>
  );
};

export default MyPage;
