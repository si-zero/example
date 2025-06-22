import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getApiBase } from "../utils/getApiBase";
import { useTitle } from "../context/TitleContext";
import "./AddOrEditProductPage.css";

const AddOrEditProductPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const editingProduct = location.state?.product;
  const isEdit = !!editingProduct;
  const { setTitle } = useTitle();

  useEffect(() => {
    setTitle("상품관리 - Pixen");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [form, setForm] = useState({
    imageUrl: "/images/default.png",
    category: "스크립트",
    name: "",
    description: "",
    price: 0,
    picnum: 5,
  });

  useEffect(() => {
    if (isEdit) {
      setForm({
        imageUrl: editingProduct.imageUrl,
        category: editingProduct.category,
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        picnum: editingProduct.picnum || 5,
      });
    }
  }, [isEdit, editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "price" || name === "picnum" ? Number(value) : value,
    }));
  };

  const adjustPrice = (amount) => {
    setForm((prev) => {
      let newPrice = (prev.price || 0) + amount;
      if (newPrice < 0) newPrice = 0;
      return { ...prev, price: newPrice };
    });
  };

  const adjustPicnum = (amount) => {
    setForm((prev) => {
      let newPicnum = (prev.picnum || 5) + amount;
      if (newPicnum < 1) newPicnum = 1;
      if (newPicnum > 5) newPicnum = 5;
      return { ...prev, picnum: newPicnum };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = `${getApiBase()}/api/add-product`;
    const method = "POST";

    const bodyData = {
      ...form,
      userId: user.id,
    };

    if (isEdit) {
      bodyData.id = editingProduct.id;
    }

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    });

    if (res.ok) {
      alert(isEdit ? "상품이 수정되었습니다." : "상품이 등록되었습니다.");
      navigate("/Mypage");
    } else {
      alert("상품 저장 실패");
    }
  };

  return (
    <div className="container">
      <h2 className="product_set_title">{isEdit ? "상품 수정" : "상품 등록"}</h2>
      <form onSubmit={handleSubmit}>
        <label>
          이미지 주소:
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
          />
        </label>
        <label>
          카테고리:
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="스크립트">스크립트</option>
            <option value="아이템">아이템</option>
            <option value="코드">코드</option>
            <option value="리소스">리소스</option>
          </select>
        </label>
        <label>
          이름:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          설명:
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          가격:
          <div>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min={0}
              required
            />
            <button type="button" onClick={() => adjustPrice(1000)}>
              +1000
            </button>
            <button type="button" onClick={() => adjustPrice(-1000)}>
              -1000
            </button>
          </div>
        </label>
        <label>
          picnum:
          <div>
            <input
              type="number"
              name="picnum"
              value={form.picnum}
              onChange={handleChange}
              min={1}
              max={5}
              required
            />
            <button type="button" onClick={() => adjustPicnum(1)}>
              +1
            </button>
            <button type="button" onClick={() => adjustPicnum(-1)}>
              -1
            </button>
          </div>
        </label>

        <div className="form-button-group">
          <button type="submit">{isEdit ? "수정 완료" : "등록"}</button>
          <button type="button" onClick={() => navigate(-1)}>취소</button>
        </div>
      </form>
    </div>
  );
};

export default AddOrEditProductPage;
