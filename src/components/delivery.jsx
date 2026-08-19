import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { NavLink } from "react-router";

export default function Delivery() {
  const [delivery, setDelivery] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetch("https://rest.sergosht-api.uz/api/order", {
      method: "GET",
      headers: {
        Authorization: user.token,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setDelivery(Array.isArray(data) ? data : data.results || []);
      })
      .catch((error) => console.log(error));
  }, []);

  const getItems = (order) => {
    return (
      order.items ||
      order.products ||
      order.order_items ||
      order.orderItems ||
      order.details ||
      []
    );
  };

  const getProduct = (item) => {
    return item.product || item.product_data || item;
  };

  const getImage = (item) => {
    const product = getProduct(item);

    const image =
      product.image ||
      product.photo ||
      product.picture ||
      product.img ||
      item.image ||
      item.photo;

    if (!image) {
      return "https://via.placeholder.com/100x100?text=No+Image";
    }

    if (image.startsWith("http")) {
      return image;
    }

    return `https://rest.sergosht-api.uz${image}`;
  };

  const getTitle = (item) => {
    const product = getProduct(item);

    return (
      product.title ||
      product.name ||
      product.product_name ||
      item.title ||
      item.name ||
      "Товар"
    );
  };

  const getPrice = (item) => {
    const product = getProduct(item);

    return Number(
      item.price ||
        product.price ||
        item.product_price ||
        0
    );
  };

  const getCount = (item) => {
    return Number(
      item.count ||
        item.quantity ||
        item.qty ||
        1
    );
  };


  const getProductsTotal = (order) => {
    const items = getItems(order);

    if (items.length > 0) {
      return items.reduce((total, item) => {
        return total + getPrice(item) * getCount(item);
      }, 0);
    }

    return Number(order.total || 0);
  };

  // Доставка:
  // меньше 100 000 сум -> 10 000 сум
  // 100 000 сум и больше -> бесплатно
  const getDeliveryPrice = (order) => {
    const productsTotal = getProductsTotal(order);

    return productsTotal < 100000 ? 10000 : 0;
  };

  // Итоговая сумма вместе с доставкой
  const getFinalTotal = (order) => {
    const productsTotal = getProductsTotal(order);
    const deliveryPrice = getDeliveryPrice(order);

    return productsTotal + deliveryPrice;
  };

  return (
    <div>
      <Navbar />

      <div className="container mt-5">
        <div className="columns">
          <div className="column">

            <nav className="breadcrumb" aria-label="breadcrumbs">
              <ul>
                <li>
                  <NavLink to="/">Bosh sahifa</NavLink>
                </li>

                <li className="is-active">
                  <a href="#">Buyurtmalar</a>
                </li>
              </ul>
            </nav>

            <div className="content">
              <h1 className="title">Buyurtmalar</h1>

              {delivery.length === 0 ? (
                <div className="notification is-light">
                  У вас пока нет заказов.
                </div>
              ) : (
                <div className="columns is-multiline">

                  {delivery.map((order) => (
                    <div
                      className="column is-6"
                      key={order.id}
                    >
                      <div
                        className="card"
                        onClick={() => setSelectedOrder(order)}
                        style={{
                          borderRadius: "12px",
                          boxShadow:
                            "0 4px 15px rgba(187, 14, 14, 0.08)",
                          cursor: "pointer",
                        }}
                      >
                        <div className="card-content">

                          <div className="is-flex is-justify-content-space-between is-align-items-center mb-4">

                            <p className="title is-5 mb-0 has-text-link">
                              Номер заказа: {order.id}
                            </p>

                            <span className="tag is-primary">
                              {order.status}
                            </span>

                          </div>

                          <p className="mb-3">
                            <strong>Адрес:</strong>{" "}
                            {order.address}
                          </p>

                          <p className="mb-4">
                            <strong>Состояние:</strong>{" "}
                            {order.status}
                          </p>

                          <hr />

                          <div className="is-flex is-justify-content-space-between is-align-items-center">

                            <p className="mb-0">
                              <strong>Итого:</strong>
                            </p>

                            <p className="title is-5 has-text-primary mb-0">
                              {getFinalTotal(order).toLocaleString()} сум
                            </p>

                          </div>

                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО */}
      {selectedOrder && (
        <div
          className="modal is-active"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="modal-background"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.65)",
            }}
          ></div>

          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "750px",
              maxWidth: "95%",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          >

            <header className="modal-card-head">

              <p className="modal-card-title">
                Заказ №{selectedOrder.id}
              </p>

              <button
                className="delete"
                aria-label="close"
                onClick={() => setSelectedOrder(null)}
              ></button>

            </header>

            <section className="modal-card-body">

              <div className="mb-4">

                <p className="mb-2">
                  <strong>Адрес:</strong>{" "}
                  {selectedOrder.address}
                </p>

                <p>
                  <strong>Статус:</strong>{" "}
                  {selectedOrder.status}
                </p>

              </div>

              <h3 className="title is-5">
                Товары заказа
              </h3>

              {getItems(selectedOrder).length > 0 ? (

                getItems(selectedOrder).map((item, index) => {
                  const price = getPrice(item);
                  const count = getCount(item);

                  return (
                    <div
                      key={item.id || index}
                      className="box mb-3"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        borderRadius: "12px",
                      }}
                    >

                      <img
                        src={getImage(item)}
                        alt={getTitle(item)}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "contain",
                          borderRadius: "10px",
                          background: "#f5f5f5",
                        }}
                      />

                      <div style={{ flex: 1 }}>

                        <p className="title is-6 mb-3">
                          {getTitle(item)}
                        </p>

                        <p className="mb-2">
                          <strong>Цена:</strong>{" "}
                          {price.toLocaleString()} сум
                        </p>

                        <p className="mb-2">
                          <strong>Количество:</strong>{" "}
                          {count} шт.
                        </p>

                        <p>
                          <strong>Сумма:</strong>{" "}
                          {(price * count).toLocaleString()} сум
                        </p>

                      </div>

                    </div>
                  );
                })

              ) : (

                <div className="notification is-light">
                  В этом заказе информация о товарах отсутствует.
                </div>

              )}

              <hr />

              {/* РАСЧЁТ */}
              <div className="mb-2 is-flex is-justify-content-space-between">
                <span>
                  <strong>Товары:</strong>
                </span>

                <span>
                  {getProductsTotal(selectedOrder).toLocaleString()} сум
                </span>
              </div>

              <div className="mb-3 is-flex is-justify-content-space-between">
                <span>
                  <strong>Доставка:</strong>
                </span>

                <span
                  className={
                    getDeliveryPrice(selectedOrder) === 0
                      ? "has-text-success"
                      : ""
                  }
                >
                  {getDeliveryPrice(selectedOrder) === 0
                    ? "Бесплатно"
                    : `${getDeliveryPrice(
                        selectedOrder
                      ).toLocaleString()} сум`}
                </span>
              </div>

              <hr />

              <div className="is-flex is-justify-content-space-between is-align-items-center">

                <strong className="is-size-5">
                  Итого:
                </strong>

                <strong className="is-size-5 has-text-primary">
                  {getFinalTotal(
                    selectedOrder
                  ).toLocaleString()}{" "}
                  сум
                </strong>

              </div>

            </section>

            <footer className="modal-card-foot is-justify-content-flex-end">

              <button
                className="button"
                onClick={() => setSelectedOrder(null)}
              >
                Закрыть
              </button>

            </footer>

          </div>
        </div>
      )}

    </div>
  );
}