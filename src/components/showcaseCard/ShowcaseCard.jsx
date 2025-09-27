import { useEffect, useRef, useState } from "react";
import './ShowcaseCard.css';
import AdModal from "../adModal/AdModal";
import ads from '../../data/ads';

function FullAdModal({ open, onClose, ad }) {
    if (!open) return null;
    return (
        <div className="ad-modal-overlay" onClick={onClose}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
                <button className="ad-modal-close" onClick={onClose} aria-label="Close">&times;</button>
                <div style={{ marginBottom: 15, fontWeight: 600, fontSize: 18, color: "#BE1884" }}>
                    Ad Post
                </div>
                <div style={{ whiteSpace: "pre-line", marginBottom: 14 }}>{ad.message}</div>
                {ad.link && (
                    <a
                        className="showcase-ad-link"
                        href={ad.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 16 }}
                    >
                        {ad.link.text}
                    </a>
                )}
            </div>
        </div>
    );
}

export default function ShowcaseAd({ interval = 4000 }) {
    const [showAdModal, setShowAdModal] = useState(false);
    const [showFullAd, setShowFullAd] = useState(false);
    const [modalAd, setModalAd] = useState(null);

    const [initialShowcaseIndex] = useState(() => Math.floor(Math.random() * ads.length));
    const [current, setCurrent] = useState(initialShowcaseIndex);
    const timerRef = useRef();

    useEffect(() => {
        if (showFullAd) {
            clearTimeout(timerRef.current);
            return;
        }
        timerRef.current = setTimeout(() => {
            setCurrent((prev) => (prev + 1) % ads.length);
        }, interval);
        return () => clearTimeout(timerRef.current);
    }, [current, ads.length, interval, showFullAd]);

    const goTo = idx => {
        setCurrent(idx);
        clearTimeout(timerRef.current);
    };

    const prevAd = () => goTo((current - 1 + ads.length) % ads.length);
    const nextAd = () => goTo((current + 1) % ads.length);

    const ad = ads[current];

    const handleSeeMore = () => {
        setModalAd(ad);
        setShowFullAd(true);
    };

    return (
        <div className="card showcase-wrapper">
            <div className="showcase-top-row">
                <h4 className="showcase-title">Featured Community Ad</h4>
                <div className="showcase-button" onClick={() => setShowAdModal(true)}>+</div>
            </div>

            {/* Truncated clickable message */}
            <div
                className="showcase-ad-message"
            >
                {ad.message}
            </div>

            {
                ad.link && (
                    <a
                        className="showcase-ad-link"
                        href={ad.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {ad.link.text}
                    </a>
                )
            }
            <div className="showcase-view-button"
                onClick={handleSeeMore}
            >View Ad</div>

            {/* Navigation arrows */}
            <button className="showcase-ad-arrow left" onClick={prevAd} aria-label="Previous">&#8592;</button>
            <button className="showcase-ad-arrow right" onClick={nextAd} aria-label="Next">&#8594;</button>

            {/* Dots */}
            <div className="showcase-ad-dots">
                {ads.map((_, idx) => (
                    <button
                        key={idx}
                        className={`showcase-ad-dot${idx === current ? " active" : ""}`}
                        onClick={() => goTo(idx)}
                        aria-label={`Go to ad ${idx + 1}`}
                    />
                ))}
            </div>

            {showAdModal && <AdModal onClose={() => setShowAdModal(false)} />}
            <FullAdModal open={showFullAd} onClose={() => setShowFullAd(false)} ad={modalAd || ad} />
        </div >
    );
}
