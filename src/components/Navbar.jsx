import { NavLink } from "react-router";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  useEffect(() => {
    if (!localStorage.getItem("cart")) {
      localStorage.setItem("cart", "[]");
    }
  }, []);

  async function authenticate(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        "https://rest.sergosht-api.uz/api/send-verification-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phone }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShowCode(true);
      } else {
        setMessage(data.message || "Не удалось отправить код.");
        setMessageType("danger");
      }
    } catch (error) {
      console.error(error);
      setMessage("Ошибка сети.");
      setMessageType("danger");
    }
  }

  async function checkCode(e) {
    e.preventDefault();

    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        "https://rest.sergosht-api.uz/api/check-verification-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            code,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        const savedUser = {
          ...data,
          phone,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        };

        localStorage.setItem("user", JSON.stringify(savedUser));
        setUser(savedUser);

        setMessage("Вы успешно вошли.");
        setMessageType("success");

        setTimeout(() => {
          setIsModalOpen(false);
          setShowCode(false);
          setPhone("");
          setCode("");
          setFirstName("");
          setLastName("");
          setMessage("");
          setMessageType("");

          window.location.reload();
        }, 1500);
      } else {
        setMessage(data.message || "Неверный код.");
        setMessageType("danger");
      }
    } catch (error) {
      console.error(error);
      setMessage("Ошибка сети.");
      setMessageType("danger");
    }
  }

  function logout() {
    localStorage.removeItem("user");

    setUser(null);
    setShowProfile(false);

    window.location.reload();
  }

  function openProfile() {
    const currentUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    setFirstName(currentUser.first_name || "");
    setLastName(currentUser.last_name || "");

    setMessage("");
    setMessageType("");

    setShowProfile(true);
  }

  function saveProfile() {
    if (!firstName.trim()) {
      setMessage("Введите имя.");
      setMessageType("danger");
      return;
    }

    if (!lastName.trim()) {
      setMessage("Введите фамилию.");
      setMessageType("danger");
      return;
    }

    const updatedUser = {
      ...user,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    setMessage("Данные профиля сохранены.");
    setMessageType("success");

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 1500);
  }

  function closeLoginModal() {
    setIsModalOpen(false);
    setShowCode(false);
    setPhone("");
    setCode("");
    setFirstName("");
    setLastName("");
    setMessage("");
    setMessageType("");
  }

  function closeProfile() {
    setShowProfile(false);
    setMessage("");
    setMessageType("");
  }

  return (
    <>
      

      <nav
        className="navbar"
        role="navigation"
        aria-label="main navigation"
        style={{
          backgroundColor: "#e60000",
        }}
      >
        <div className="navbar-brand">
          <NavLink
            className="navbar-item"
            to="/"
            style={{
              backgroundColor: "transparent",
            }}
          >
            <img
              src="https://cdn.foodpicasso.com/assets/2023/07/06/eb22f9d7023be861993888ee788ed89d---png_original_919c8_convert.webp"
              alt="Logo"
            />
          </NavLink>
        </div>

        <div className="navbar-menu">
          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                {user ? (
                  <button
                    className="button"
                    onClick={openProfile}
                    style={{
                      backgroundColor: "white",
                      color: "#e60000",
                      border: "none",
                    }}
                  >
                    <strong>Профиль</strong>
                  </button>
                ) : (
                  <button
                    className="button"
                    onClick={() => {
                      setIsModalOpen(true);
                      setShowCode(false);
                      setMessage("");
                      setMessageType("");
                    }}
                    style={{
                      backgroundColor: "white",
                      color: "#e60000",
                      border: "none",
                    }}
                  >
                    <strong>Войти</strong>
                  </button>
                )}

                <NavLink
                  className="button"
                  to="/Basket"
                  style={{
                    backgroundColor: "white",
                    color: "#e60000",
                    border: "none",
                  }}
                >
                  <strong>Корзина</strong>
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      

      <div className={`modal ${isModalOpen ? "is-active" : ""}`}>
        <div
          className="modal-background"
          onClick={closeLoginModal}
        ></div>

        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">
              Авторизация
            </p>

            <button
              className="delete"
              aria-label="close"
              onClick={closeLoginModal}
            ></button>
          </header>

          <form onSubmit={showCode ? checkCode : authenticate}>
            <section className="modal-card-body">

              
              <div className="field">
                <label className="label">Имя</label>

                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Введите имя"
                    value={firstName}
                    onChange={(e) =>
                      setFirstName(e.target.value)
                    }
                    disabled={!showCode}
                    required
                  />
                </div>
              </div>

              
              <div className="field">
                <label className="label">Фамилия</label>

                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="Введите фамилию"
                    value={lastName}
                    onChange={(e) =>
                      setLastName(e.target.value)
                    }
                    disabled={!showCode}
                    required
                  />
                </div>
              </div>

             
              <div className="field">
                <label className="label">
                  Номер телефона
                </label>

                <div className="control">
                  <input
                    className="input"
                    type="text"
                    placeholder="+998901234567"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    disabled={showCode}
                    required
                  />
                </div>
              </div>

              
              {showCode && (
                <div className="field">
                  <label className="label">
                    Код подтверждения
                  </label>

                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Введите код"
                      value={code}
                      onChange={(e) =>
                        setCode(e.target.value)
                      }
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              )}

             
              {message && (
                <div
                  className={`notification ${
                    messageType === "success"
                      ? "is-success"
                      : "is-danger"
                  }`}
                >
                  {message}
                </div>
              )}
            </section>

            <footer className="modal-card-foot">
              {!showCode ? (
                <button
                  type="submit"
                  className="button is-success"
                >
                  Получить код
                </button>
              ) : (
                <button
                  type="submit"
                  className="button is-success"
                >
                  Войти
                </button>
              )}

              <button
                type="button"
                className="button"
                onClick={closeLoginModal}
              >
                Отмена
              </button>
            </footer>
          </form>
        </div>
      </div>

      

      <div className={`modal ${showProfile ? "is-active" : ""}`}>
        <div
          className="modal-background"
          onClick={closeProfile}
        ></div>

        <div
          className="modal-card"
          style={{
            maxWidth: "500px",
            width: "100%",
          }}
        >
          <header className="modal-card-head">
            <p className="modal-card-title">
              Мой профиль
            </p>

            <button
              className="delete"
              aria-label="close"
              onClick={closeProfile}
            ></button>
          </header>

          <section className="modal-card-body">

            
            <div className="field">
              <label className="label">Имя</label>

              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                  placeholder="Имя"
                />
              </div>
            </div>

           
            <div className="field">
              <label className="label">Фамилия</label>

              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  placeholder="Фамилия"
                />
              </div>
            </div>

            <div className="field">
              <label className="label">
                Номер телефона
              </label>

              <div className="control">
                <input
                  className="input"
                  type="text"
                  value={user?.phone || ""}
                  disabled
                />
              </div>
            </div>

            {message && (
              <div
                className={`notification ${
                  messageType === "success"
                    ? "is-success"
                    : "is-danger"
                }`}
              >
                {message}
              </div>
            )}
          </section>

          <footer
            className="modal-card-foot"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              gap: "10px",
            }}
          >
            <button
              className="button is-success"
              onClick={saveProfile}
            >
              Сохранить изменения
            </button>

            <button
              className="button is-danger"
              onClick={logout}
            >
              <strong>Выйти с аккаунта</strong>
            </button>

            <button
              className="button"
              onClick={closeProfile}
            >
              Закрыть
            </button>
          </footer>
        </div>
      </div>
    </>
  );
} 