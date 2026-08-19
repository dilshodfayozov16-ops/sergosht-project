import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { NavLink } from "react-router";

const CATEGORIES = [
    { key: "kitchen", label: "Oshxona" },
    { key: "service", label: "Xizmat" },
    { key: "delivery", label: "Yetkazib berish" },
];

function StarPicker({ value, onChange }) {
    return (
        <span className="star-picker">
            {[1, 2, 3, 4, 5].map(n => (
                <span
                    key={n}
                    className={`star ${n <= value ? "star-filled" : ""}`}
                    onClick={() => onChange(n)}
                    role="button"
                    aria-label={`${n} ball`}
                >
                    ★
                </span>
            ))}
        </span>
    );
}

function StarDisplay({ value }) {
    return (
        <span className="star-picker star-picker--readonly">
            {[1, 2, 3, 4, 5].map(n => (
                <span
                    key={n}
                    className={`star ${n <= value ? "star-filled" : ""}`}
                >
                    ★
                </span>
            ))}
        </span>
    );
}

export default function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [comment, setComment] = useState("");
    const [ratings, setRatings] = useState({
        kitchen: 0,
        service: 0,
        delivery: 0
    });

    useEffect(() => {
        fetch("https://rest.sergosht-api.uz/api/review")
            .then(response => response.json())
            .then(data => setReviews(data));
    }, []);

    function openModal() {
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
        setComment("");
        setRatings({
            kitchen: 0,
            service: 0,
            delivery: 0
        });
    }

    function handleSubmit() {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user || !comment.trim())
            return;

        fetch("https://rest.sergosht-api.uz/api/review", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": user.token
            },
            body: JSON.stringify({
                text: comment,
                delivery_rating: ratings.delivery,
                kitchen_rating: ratings.kitchen,
                service_rating: ratings.service
            })
        });
    }

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
                            </ul>
                        </nav>

                        <div className="content">
                            <div className="reviews-header">
                                <h1 className="title">Fikrlar</h1>

                                <button
                                    className="button is-primary add-review-btn"
                                    onClick={openModal}
                                >
                                    Fikr qoldirish
                                </button>
                            </div>

                            {reviews.map(review => (
                                <div className="card mb-6" key={review.id}>
                                    <div className="card-content">
                                        <div className="media">
                                            <div className="media-left">
                                                <figure className="image is-48x48">
                                                    <img
                                                        src={
                                                            review.user.photo
                                                                ? "https://rest.sergosht-api.uz" +
                                                                  review.user.photo
                                                                : "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png"
                                                        }
                                                        alt="Placeholder image"
                                                    />
                                                </figure>
                                            </div>

                                            <div className="media-content">
                                                <p className="title is-4">
                                                    {review.user.first_name ||
                                                        `user${review.user.id}`}{" "}
                                                    {review.user.last_name}
                                                </p>

                                                {review.user.email && (
                                                    <p className="subtitle is-6">
                                                        {review.user.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {review.ratings && (
                                            <div className="review-ratings">
                                                {CATEGORIES.map(cat => (
                                                    <div
                                                        className="review-ratings__row"
                                                        key={cat.key}
                                                    >
                                                        <span className="review-ratings__label">
                                                            {cat.label}
                                                        </span>

                                                        <StarDisplay
                                                            value={
                                                                review.ratings[
                                                                    cat.key
                                                                ] || 0
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="content">
                                            {review.text}
                                            <br />

                                            <time
                                                dateTime={review.created_at}
                                            >
                                                {new Date(
                                                    review.created_at
                                                ).toLocaleString()}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div
                className={`modal ${modalOpen ? "is-active" : ""}`}
            >
                <div
                    className="modal-background"
                    onClick={closeModal}
                ></div>

                <div className="modal-card">
                    <header className="modal-card-head">
                        <p className="modal-card-title">
                            Fikr qoldirish
                        </p>

                        <button
                            className="delete"
                            aria-label="close"
                            onClick={closeModal}
                        ></button>
                    </header>

                    <section className="modal-card-body">
                        {CATEGORIES.map(cat => (
                            <div className="field" key={cat.key}>
                                <label className="label">
                                    {cat.label}
                                </label>

                                <StarPicker
                                    value={ratings[cat.key]}
                                    onChange={n =>
                                        setRatings(prev => ({
                                            ...prev,
                                            [cat.key]: n
                                        }))
                                    }
                                />
                            </div>
                        ))}

                        <div className="field">
                            <label className="label">
                                Fikringiz
                            </label>

                            <div className="control">
                                <textarea
                                    className="textarea"
                                    value={comment}
                                    onChange={e =>
                                        setComment(e.target.value)
                                    }
                                    placeholder="Ovqat, xizmat va yetkazib berish haqida fikringizni yozing..."
                                />
                            </div>
                        </div>
                    </section>

                    <footer className="modal-card-foot">
                        <button
                            className="button is-primary"
                            onClick={handleSubmit}
                        >
                            Yuborish
                        </button>

                        <button
                            className="button"
                            onClick={closeModal}
                        >
                            Bekor qilish
                        </button>
                    </footer>
                </div>
            </div>

            <style>{`
                .reviews-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .add-review-btn {
                    white-space: nowrap;
                }

                .star-picker {
                    display: inline-flex;
                    gap: 4px;
                    font-size: 1.4rem;
                    line-height: 1;
                }

                .star-picker--readonly {
                    font-size: 1.1rem;
                }

                .star {
                    color: #dbdbdb;
                    cursor: pointer;
                    transition: color 0.15s ease;
                }

                .star-picker--readonly .star {
                    cursor: default;
                }

                .star-filled {
                    color: #ffb400;
                }

                .review-ratings {
                    margin-top: 0.75rem;
                }

                .review-ratings__row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-bottom: 2px;
                }

                .review-ratings__label {
                    min-width: 140px;
                    font-size: 0.9rem;
                    color: #4a4a4a;
                }
            `}</style>
        </div>
    );
}