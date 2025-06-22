// client/context/LikedStore.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserContext";
import { getApiBase } from "../utils/getApiBase";
const LikedContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useLikedStore = () => useContext(LikedContext);

export const LikedStoreProvider = ({ children }) => {
  const { user } = useUser(); // UserContext의 user 상태 구독
  const [likedIds, setLikedIds] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      // 로그인 상태일 때
      axios
        .post(`${getApiBase()}/api/liked-products`, { userId: user.id })
        .then((res) => {
          const ids = res.data.map((product) => product.id);
          setLikedIds(ids);
        })
        .catch((err) => {
          console.error("찜 목록 불러오기 실패:", err);
          setLikedIds([]);
        });
    } else {
      // 로그아웃 상태(비로그인)일 때 로컬스토리지에서 읽기
      const storedLiked = localStorage.getItem("likedlist");
      if (storedLiked) {
        try {
          const parsed = JSON.parse(storedLiked);
          if (Array.isArray(parsed)) {
            setLikedIds(parsed);
          } else {
            setLikedIds([]);
          }
        } catch {
          setLikedIds([]);
        }
      } else {
        localStorage.setItem("likedlist", JSON.stringify([]));
        setLikedIds([]);
      }
    }
  }, [user]); // user가 변할 때마다 실행

  const toggleLike = async (id) => {
    if (user && user.id) {
      try {
        const res = await axios.post(`${getApiBase()}/api/liked`, {
          id,
          liked: !likedIds.includes(id),
          userId: user.id,
        });
        setLikedIds(res.data.liked);
      } catch (err) {
        console.error("찜 상태 업데이트 실패:", err);
      }
    } else {
      // 비로그인 상태 로컬스토리지 관리
      let updatedLiked = [...likedIds];
      if (likedIds.includes(id)) {
        updatedLiked = updatedLiked.filter((item) => item !== id);
      } else {
        updatedLiked.push(id);
      }
      setLikedIds(updatedLiked);
      localStorage.setItem("likedlist", JSON.stringify(updatedLiked));
    }
  };

  return (
    <LikedContext.Provider value={{ likedIds, toggleLike }}>
      {children}
    </LikedContext.Provider>
  );
};
