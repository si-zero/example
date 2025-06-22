import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiBase } from "../../utils/getApiBase";
import { useTitle } from "../../context/TitleContext";

import "./Register.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    checkPassword: "",
  });

  const { setTitle } = useTitle();
  const navigate = useNavigate();

  useEffect(() => {
    setTitle("회원가입 - Pixen");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password, checkPassword } = form;

    if (!name || !email || !password || !checkPassword) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (password !== checkPassword) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`${getApiBase()}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("회원가입 성공!");
        navigate("/login");
      } else {
        alert(result.message || "회원가입 실패");
      }
    } catch (error) {
      console.error("회원가입 요청 중 오류:", error);
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <div className="auth-backdrop">
        <div className="auth-content">
          <div className="auth-group">
            <label className="auth-label">이름</label>
            <input
              className="auth-input"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">아이디</label>
            <input
              className="auth-input"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">비밀번호</label>
            <input
              className="auth-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">비밀번호 확인</label>
            <input
              className="auth-input"
              type="password"
              name="checkPassword"
              value={form.checkPassword}
              onChange={handleChange}
            />
          </div>

          <div className="form-button-group">
            <button
              className="form-button submit-button"
              onClick={handleRegister}
            >
              가입하기
            </button>
            <button
              className="form-button cancel-button"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
