import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"


import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export default function PromoModal({ isOpen, onClose }) {
  const [slides, setSlides] = useState([])

  useEffect(() => {
    if (!isOpen) return

    fetch("https://rest.sergosht-api.uz/api/promo/")
      .then(res => res.json())
      .then(data => setSlides(data))
      .catch(err => console.error(err))
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="modal is-active">
      <div className="modal-background" onClick={onClose}></div>

      <div className="modal-content" style={{ maxWidth: "900px" }}>
        <Swiper
          navigation
          pagination={{ clickable: true }}
          modules={[Navigation, Pagination]}
        >
          {slides.map(item => (
            <SwiperSlide key={item.id}>
              <div className="card">
                <div className="card-image">
                  <figure className="image is-16by9">
                    <img
                      src={"https://rest.sergosht-api.uz" + item.image}
                      alt={item.title}
                    />
                  </figure>
                </div>

                <div className="card-content">
                  <p className="title is-4">{item.title}</p>
                  <p className="content">{item.description}</p>

                  {item.promo_code && (
                    <div className="buttons mt-4">
                      <button className="button is-dark">
                        Применить промокод
                      </button>

                      <button className="button is-outlined is-primary">
                        {item.promo_code}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <button
        className="modal-close is-large"
        aria-label="close"
        onClick={onClose}
      ></button>
    </div>
  )
}