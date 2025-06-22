import React from "react";
import { useLoading } from "../context/LoadingContext";
import "./GlobalLoading.css"; // 아래 스타일 참고

const GlobalLoading = () => {
  const { loading } = useLoading();

  if (!loading) return null;

  return (
    <div className="global-loading-backdrop">
      <div className="spinner" />
    </div>
  );
};

export default GlobalLoading;
