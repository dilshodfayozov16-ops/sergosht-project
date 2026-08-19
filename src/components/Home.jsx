import { useState, useEffect } from "react";
import Menu from "./menu";
import Navbar from "./Navbar";
import ProductList from "./ProductList";
import { Swiper, SwiperSlide } from "swiper/react";
import { ToastContainer } from "react-toastify";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { Navigation, Autoplay } from "swiper/modules";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(null);

  useEffect(() => {
    fetch("https://rest.sergosht-api.uz/api/categories/?with_products=1")
      .then((res) => res.json())
      .then((data) => setCategories(data));
  }, []);

  useEffect(() => {
    fetch("https://rest.sergosht-api.uz/api/slider/")
      .then((res) => res.json())
      .then((data) => setSlides(data))
      .catch((err) => console.error(err));
  }, []);

  const openModal = (slide) => {
    setActiveSlide(slide);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveSlide(null);
  };

  return (
    <>
      <Navbar />

      <div className={`modal ${isModalOpen ? "is-active" : ""}`}>
        <div className="modal-background" onClick={closeModal}></div>

        <div
          className="modal-content"
          style={{
            maxWidth: "520px",
            borderRadius: "18px",
            overflow: "hidden",
            background: "#fff",
          }}
        >
          {activeSlide && (
            <>
              <img
                src={activeSlide.image}
                alt={activeSlide.title || "promo"}
                style={{
                  width: "100%",
                  display: "block",
                }}
              />

              <div style={{ padding: "20px" }}>
                {activeSlide.title && (
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      marginBottom: "10px",
                    }}
                  >
                    {activeSlide.title}
                  </h2>
                )}

                {activeSlide.text && (
                  <p
                    style={{
                      color: "#666",
                      marginBottom: "20px",
                    }}
                  >
                    {activeSlide.text}
                  </p>
                )}

                <button
                  className="button is-danger is-fullwidth"
                  style={{
                    height: "50px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    fontSize: "17px",
                  }}
                  onClick={() => {}}
                >
                  🎁 Получить промокод
                </button>
              </div>
            </>
          )}
        </div>

        <button
          className="modal-close is-large"
          aria-label="close"
          onClick={closeModal}
        ></button>
      </div>
            <div className="container mt-5">
        <div className="columns">
          <div className="column is-2">
            <Menu categories={categories} />
          </div>

          <div className="column is-10">
            <div className="row mb-6">
              <Swiper
                modules={[Navigation, Autoplay]}
                navigation
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                loop={true}
              >
                {slides.map((slide) => (
                  <SwiperSlide key={slide.id}>
                    <img
                      src={slide.image}
                      alt={`Slide ${slide.id}`}
                      onClick={() => openModal(slide)}
                      style={{
                        width: "100%",
                        height: "auto",
                        cursor: "pointer",
                        borderRadius: "12px",
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
                
              {categories.map((category) => (
                <ProductList
                  key={category.id}
                  products={category.products}
                  title={category.title}
                  slug={category.slug}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </>
  );
}