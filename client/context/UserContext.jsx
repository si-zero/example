/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBase } from "../utils/getApiBase";

const UserContext = createContext();

// 훅으로 간편하게 사용 가능하게
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 앱 시작 시 localStorage에 저장된 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 유저 정보 최신화 함수
  const refreshUser = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`${getApiBase()}/api/get-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("유저 정보 최신화 실패:", err);
    }
  };

  // 로그아웃 함수: 상태 초기화 + localStorage에서 제거
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // === 구매 처리 함수 ===
  const purchaseProduct = async (productId) => {
    if (!user?.id) {
      alert("구매하려면 로그인이 필요합니다. 로그인 후 다시 시도해주세요.");
      return false;
    }

    const confirmPurchase = window.confirm("상품을 구매하시겠습니까?");
    if (!confirmPurchase) return false;

    try {
      const res = await fetch(`${getApiBase()}/api/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, productId }),
      });

      const data = await res.json();

      if (res.ok) {
        await refreshUser();
        alert("구매가 완료되었습니다. 감사합니다!");
        return true;
      } else {
        alert("구매 실패: " + (data.message || "알 수 없는 오류"));
        return false;
      }
    } catch (err) {
      alert("서버 오류: " + err.message);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, refreshUser, purchaseProduct }}>
      {children}
    </UserContext.Provider>
  );
};
