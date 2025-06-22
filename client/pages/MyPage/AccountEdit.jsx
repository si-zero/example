import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import { getApiBase } from "../../utils/getApiBase";
import "./AccountEdit.css";

const AccountEdit = () => {
  const { user, refreshUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    introduction: "",
    password: "",
  });

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        introduction: user.introduction || "",
        password: "",
      });
    }
  }, [user]);

  if (!user) return <p>로딩 중...</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
    if (!isEditing && user) {
      setForm({
        name: user.name || "",
        introduction: user.introduction || "",
        password: "",
      });
    }
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      introduction: form.introduction,
    };
    if (form.password.trim() !== "") {
      payload.password = form.password;
    }

    try {
      const res = await fetch(`${getApiBase()}/api/update-user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...payload }),
      });

      if (res.ok) {
        await refreshUser();
        setForm((prev) => ({ ...prev, password: "" }));
        setIsEditing(false);
      } else {
        const data = await res.json();
        alert(`저장 실패: ${data.message || "알 수 없는 오류"}`);
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      alert("서버 오류 발생");
    }
  };

  return (
    <div className="account-info">
      <h2 className="account-title">나의 회원 정보</h2>
      <p className="account-line">회원등급: {user.role}</p>
      <p className="account-line">이메일: {user.email}</p>

      {isEditing ? (
        <div className="account-form">
          <div className="account-field">
            <label>이름</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="account-field">
            <p className="account-subtitle">소개 문구</p>
            <textarea
              name="introduction"
              value={form.introduction}
              onChange={handleChange}
            />
          </div>
          <div className="account-field">
            <label>새 비밀번호</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="변경할 비밀번호 입력"
            />
          </div>
        </div>
      ) : (
        <>
          <p className="account-line">이름: {user.name} ({user.id})</p>
          {user.introduction && (
            <p className="account-introduction">{user.introduction}</p>
          )}
        </>
      )}

      <p className="account-line">
        찜한 상품 수: {user.likes_product?.length || 0}개
      </p>
      <p className="account-line">
        등록한 상품 수: {user.products?.length || 0}개
      </p>

      <div className="button-group">
        <button onClick={isEditing ? handleSave : handleEditToggle}>
          {isEditing ? "저장" : "정보 수정"}
        </button>
        {isEditing && <button onClick={handleEditToggle}>취소</button>}
      </div>
    </div>
  );
};

export default AccountEdit;
