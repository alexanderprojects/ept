import { useEffect, useRef, useState } from "react";
import './ShowcaseCard.css';
import AdFormModal from "../adModal/AdFormModal";
import FullAdModal from "../adModal/FullAdModal";

export default function ShowcaseAd({ interval = 4000 }) {
    // Grabbing Ads from backend
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showAdFormModal, setShowAdFormModal] = useState(false);
    const [showFullAd, setShowFullAd] = useState(false);

    const [initialShowcaseIndex, setInitialShowcaseIndex] = useState(0);
    const [current, setCurrent] = useState(0);
    const timerRef = useRef();

    // Fetch ads from backend
    useEffect(() => {
        async function fetchAds() {
            try {
                const res = await fetch("http://localhost:4000/ads");
                if (!res.ok) throw new Error("Failed to fetch ads");
                const data = await res.json();
                setAds(data);
                setInitialShowcaseIndex(Math.floor(Math.random() * data.length));
                setCurrent(Math.floor(Math.random() * data.length));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchAds();
    }, []);

    // Auto-rotate Carousel logic
    useEffect(() => {
        if (showFullAd || ads.length === 0) {
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
        setShowFullAd(true);
    };

    // EDGE CASE HANDLING
    if (loading) return <div className="card showcase-wrapper">Loading...</div>;
    if (error) return <div className="card showcase-wrapper">Error: {error}</div>;
    if (!ads.length) return <div className="card showcase-wrapper">No ads available.</div>;

    return (
        <div className="card showcase-wrapper">
            <div className="showcase-top-row">
                <h4 className="showcase-title">Featured Community Ad</h4>
                <div className="showcase-button" onClick={() => setShowAdFormModal(true)}>+</div>
            </div>

            <div className="showcase-ad-message">{ad.Message}</div>

            {ad.Link && (
                <a
                    className="showcase-ad-link"
                    href={typeof ad.Link === "string" ? ad.Link : ad.Link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {typeof ad.Link === "string" ? ad.Link : (ad.Link.text || ad.Link.url)}
                </a>
            )}

            <div className="showcase-view-button" onClick={handleSeeMore}>View Ad</div>

            <button className="showcase-ad-arrow left" onClick={prevAd} aria-label="Previous">&#8592;</button>
            <button className="showcase-ad-arrow right" onClick={nextAd} aria-label="Next">&#8594;</button>

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

            {showAdFormModal && <AdFormModal onClose={() => setShowAdFormModal(false)} />}
            <FullAdModal open={showFullAd} onClose={() => setShowFullAd(false)} ad={ad} />
        </div>
    );
}
