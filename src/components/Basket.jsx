import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Basket() {
  const [cart, setCart] = useState([]);

  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    setCart(savedCart);
  }, []);

  function deleteProduct(productId) {
    const product = cart.find(
      (item) => item.id === productId
    );

    const newCart = cart.filter(
      (item) => item.id !== productId
    );

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    setCart(newCart);

    toast.error(
      `${product?.title || "Mahsulot"} savatdan o'chirildi`,
      {
        position: "bottom-right",
        autoClose: 5000,
        theme: "dark",
      }
    );
  }

  function plusCount(productId) {
    const newCart = cart.map((product) => {
      if (product.id === productId) {
        const newCount = product.count + 1;

        toast.success(
          `${product.title} savatda ${newCount} ta mavjud`,
          {
            position: "bottom-right",
            autoClose: 5000,
            theme: "dark",
          }
        );

        return {
          ...product,
          count: newCount,
        };
      }

      return product;
    });

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    setCart(newCart);
  }

  function minusCount(productId) {
    const product = cart.find(
      (item) => item.id === productId
    );

    if (!product) return;

    if (product.count === 1) {
      deleteProduct(productId);
      return;
    }

    const newCount = product.count - 1;

    const newCart = cart.map((item) => {
      if (item.id === productId) {
        return {
          ...item,
          count: newCount,
        };
      }

      return item;
    });

    localStorage.setItem(
      "cart",
      JSON.stringify(newCart)
    );

    setCart(newCart);

    toast.success(
      `${product.title} savatda ${newCount} ta qoldi`,
      {
        position: "bottom-right",
        autoClose: 5000,
        theme: "dark",
      }
    );
  }

  function openCheckoutForm() {
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (!user.id || !user.token) {
      toast.error(
        "Сначала войдите в аккаунт",
        {
          position: "bottom-right",
          autoClose: 5000,
          theme: "dark",
        }
      );

      return;
    }

    if (cart.length === 0) {
      toast.error(
        "Savatcha bo'sh",
        {
          position: "bottom-right",
          autoClose: 5000,
          theme: "dark",
        }
      );

      return;
    }

    setShowCheckoutForm(true);
  }

  async function checkout() {
    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    if (!user.id || !user.token) {
      toast.error(
        "Сначала войдите в аккаунт",
        {
          position: "bottom-right",
          autoClose: 5000,
          theme: "dark",
        }
      );

      return;
    }

    if (!firstName.trim()) {
      toast.error(
        "Введите имя",
        {
          position: "bottom-right",
          autoClose: 5000,
          theme: "dark",
        }
      );

      return;
    }

    if (!lastName.trim()) {
      toast.error(
        "Введите фамилию",
        {
          position: "bottom-right",
          autoClose: 5000,
          theme: "dark",
        }
      );

      return;
    }

    if (!address.trim()) {
      toast.error(
        "Введите адрес доставки",
        {
          position: "bottom-right",
          autoClose: 5000,
          theme: "dark",
        }
      );

      return;
    }

    /*
      Backend требует:
      id
      quantity
      price
    */

    const products = cart.map((product) => ({
      id: product.id,
      quantity: product.count,
      price: Number(product.price),
    }));

    // Проверка перед отправкой
    const invalidProduct = products.find(
      (product) =>
        !product.id ||
        !product.quantity ||
        product.price === undefined ||
        product.price === null ||
        Number.isNaN(product.price)
    );

    if (invalidProduct) {
      console.error(
        "Неверный товар:",
        invalidProduct
      );

      toast.error(
        "У товара отсутствует цена. Добавьте товар в корзину заново.",
        {
          position: "bottom-right",
          autoClose: 7000,
          theme: "dark",
        }
      );

      return;
    }

    const fullAddress =
      `${firstName.trim()} ${lastName.trim()}, ${address.trim()}`;

    setLoading(true);

    try {
      const response = await fetch(
        "https://rest.sergosht-api.uz/api/order",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: user.token,
          },

          body: JSON.stringify({
            user,

            order: {
              user: user.id,
              products: products,
              address: fullAddress,
            },
          }),
        }
      );

      if (response.ok) {
        // Очищаем корзину
        localStorage.setItem(
          "cart",
          JSON.stringify([])
        );

        setCart([]);

        // Закрываем форму
        setShowCheckoutForm(false);

        // Очищаем поля
        setFirstName("");
        setLastName("");
        setAddress("");

        // Успешное уведомление
        toast.success(
          "Ваш заказ успешно оформлен! ✓",
          {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          }
        );

        return;
      }

      const errorText =
        await response.text();

      console.error(
        "Ошибка backend:",
        response.status,
        errorText
      );

      toast.error(
        `Не удалось оформить заказ (${response.status})`,
        {
          position: "bottom-right",
          autoClose: 7000,
          theme: "dark",
        }
      );

    } catch (error) {
      console.error(
        "Ошибка соединения:",
        error
      );

      toast.error(
        "Ошибка соединения с сервером",
        {
          position: "bottom-right",
          autoClose: 5000,
          theme: "dark",
        }
      );

    } finally {
      setLoading(false);
    }
  }

  const total = cart.reduce(
    (sum, product) =>
      sum +
      (Number(product.price) || 0) *
        product.count,
    0
  );

  const delivery =
    total >= 100000 ? 0 : 10000;

  const finalTotal =
    total + delivery;

  return (
    <div>
      <Navbar />

      <div className="container mt-5">
        <div className="content">

          <h1 className="title">
            Savatcha
          </h1>

          {cart.length === 0 ? (

            <h2 className="title is-4 has-text-centered">
              Savatcha bo'sh
            </h2>

          ) : (

            <>
              {cart.map((product) => (
                <div
                  className="card mb-5"
                  key={product.id}
                >
                  <div className="card-content">

                    <div className="media">

                      <div className="media-left">
                        <figure className="image is-64x64">
                          <img
                            src={product.photo}
                            alt={product.title}
                          />
                        </figure>
                      </div>

                      <div className="media-content">

                        <p className="title is-4">
                          {product.title}
                        </p>

                        <p className="subtitle is-6">
                          {product.count} ×{" "}
                          {(Number(product.price) || 0)
                            .toLocaleString()}{" "}
                          so'm
                        </p>

                        <div className="is-flex is-align-items-center">

                          <button
                            onClick={() =>
                              deleteProduct(product.id)
                            }
                            className="button is-danger mr-2"
                          >
                            🗑
                          </button>

                          <button
                            onClick={() =>
                              minusCount(product.id)
                            }
                            className="button is-danger"
                          >
                            −
                          </button>

                          <input
                            disabled
                            readOnly
                            value={product.count}
                            style={{
                              width: "50px",
                              height: "40px",
                              textAlign: "center",
                              margin: "0 10px",
                              border: "1px solid #dbdbdb",
                              borderRadius: "4px",
                              fontSize: "18px",
                            }}
                          />

                          <button
                            onClick={() =>
                              plusCount(product.id)
                            }
                            className="button is-danger"
                          >
                            +
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>
                </div>
              ))}

              <div
                className="mt-5"
                style={{
                  maxWidth: "400px",
                  marginLeft: "auto",
                  fontSize: "22px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span>
                    Mahsulotlar:
                  </span>

                  <span>
                    {total.toLocaleString()} so'm
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span>
                    Dostavka:
                  </span>

                  <span>
                    {delivery.toLocaleString()} so'm
                  </span>
                </div>

                <hr />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "34px",
                    fontWeight: "700",
                  }}
                >
                  <span>
                    Jami:
                  </span>

                  <span>
                    {finalTotal.toLocaleString()} so'm
                  </span>
                </div>

                {delivery === 0 && (
                  <p
                    style={{
                      color: "green",
                      marginTop: "10px",
                      fontWeight: "600",
                    }}
                  >
                    Yetkazib berish bepul!
                  </p>
                )}

              </div>
            </>
          )}

          {cart.length > 0 && (
            <button
              className="button is-danger mt-5"
              onClick={openCheckoutForm}
            >
              Оформить заказ
            </button>
          )}

        </div>
      </div>

      {/* Форма оформления */}

      {showCheckoutForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >

          <div
            className="box"
            style={{
              width: "100%",
              maxWidth: "500px",
              borderRadius: "12px",
            }}
          >

            <h2 className="title is-3">
              Оформление заказа
            </h2>

            {/* Имя */}

            <div className="field">

              <label className="label">
                Имя
              </label>

              <div className="control">

                <input
                  className="input"
                  type="text"
                  placeholder="Введите имя"
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                />

              </div>

            </div>

            {/* Фамилия */}

            <div className="field">

              <label className="label">
                Фамилия
              </label>

              <div className="control">

                <input
                  className="input"
                  type="text"
                  placeholder="Введите фамилию"
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                />

              </div>

            </div>

            {/* Адрес */}

            <div className="field">

              <label className="label">
                Адрес доставки
              </label>

              <div className="control">

                <textarea
                  className="textarea"
                  placeholder="Введите полный адрес"
                  value={address}
                  onChange={(e) =>
                    setAddress(e.target.value)
                  }
                  rows="3"
                />

              </div>

            </div>

            {/* Кнопки */}

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >

              <button
                className="button"
                style={{
                  flex: 1,
                }}
                onClick={() =>
                  setShowCheckoutForm(false)
                }
                disabled={loading}
              >
                Отмена
              </button>

              <button
                className="button is-danger"
                style={{
                  flex: 1,
                }}
                onClick={checkout}
                disabled={loading}
              >
                {loading
                  ? "Оформление..."
                  : "Подтвердить заказ"}
              </button>

            </div>

          </div>

        </div>
      )}

      <ToastContainer />
    </div>
  );
}