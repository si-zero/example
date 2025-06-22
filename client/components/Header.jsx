import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLoading } from "../context/LoadingContext";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { loading } = useLoading();

  const handleMyInfoClick = () => {
    if (loading) return;
      if (!user) {
    alert("로그인 후 이용 가능합니다.");
    return;
  }
    navigate("/Mypage");
  };

  const handleHomeClick = () => {
    if (loading) return;
    navigate("/");
  };

  const handleMyCartClick = () => {
    if (loading) {
      alert("처리 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    navigate("/wishlist");
  };
  const handleLoginClick = () => {
    if (loading) {
      alert("데이터 처리 중입니다. 잠시만 기다려 주세요.");
      return;
    }

    if (user) {
      const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
      if (confirmLogout) {
        logout();
        alert("로그아웃 되었습니다.");
        navigate("/main");
      }
    } else {
      navigate("/login");
    }
  };
  return (
    <>
      <div className="title">
        <div className="logo" onClick={handleHomeClick}></div>
        <div className="sideBar">
          <div className="cart" onClick={handleMyCartClick}></div>
          <div className="menu" onClick={handleLoginClick}></div>
          <div className="myInfo"onClick={handleMyInfoClick}></div>
        </div>
      </div>

      <div className="greeting-message">
        {user ? (
          <p>{user.name} 님 안녕하세요</p>
        ) : (
          <p>로그인하여 다양한 기능을 사용하세요</p>
        )}
      </div>
    </>
  );
};

export default Header;
