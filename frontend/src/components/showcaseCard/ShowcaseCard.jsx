import { useEffect, useRef, useState } from "react";
import './ShowcaseCard.css';
import CreateAdModal from "../adModal/CreateAdModal";
import ViewAdModal from "../adModal/ViewAdModal";

// Backend URL from .env
const backendUrl = import.meta.env.VITE_BACKEND_URL;

// Cache constants
const CACHE_KEY = "adsCache";
const CACHE_TTL = 1000 * 60 * 10; // 10 minutes


export default function ShowcaseAd({ interval = 3000 }) {
    // Grabbing Ads from backend
    const [ads, setAds] = useState([]); //fetched ads
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal states
    const [showCreateAdModal, setShowCreateAdModal] = useState(false);
    const [showFullAd, setShowFullAd] = useState(false);

    // Showcase carousel state
    const [current, setCurrent] = useState(0);  //index of currently displayed ad
    const timerRef = useRef(); //stores timer id so we can clear it

    // Fetch ads from backend
    useEffect(() => {
        async function fetchAds() {
            try {
                // Check if we have  cache first
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    // validate cache format
                    try {
                        const parsed = JSON.parse(cached);
                        const now = Date.now();

                        // Validate that it has the expected format
                        if (
                            parsed &&
                            Array.isArray(parsed.data) &&
                            parsed.data.every(ad => typeof ad.Message === "string") &&
                            typeof parsed.timestamp === "number" &&
                            now - parsed.timestamp < CACHE_TTL
                        ) {
                            setAds(parsed.data);
                            setCurrent(Math.floor(Math.random() * parsed.data.length));
                            setLoading(false);
                            return; // valid cache, stop here
                        } else {
                            console.warn("Invalid ads cache, ignoring");
                        }
                    } catch (err) {
                        console.warn("Malformed ads cache, ignoring", err);
                    }
                }

                // Otherwise fetch from backend
                const res = await fetch(`${backendUrl}/ads`);
                if (!res.ok) throw new Error("Failed to fetch ads");
                const data = await res.json();
                setAds(data);
                // Pick random starting ad
                if (data.length > 0) {
                    setCurrent(Math.floor(Math.random() * data.length));
                }

                // Save to cache
                localStorage.setItem(
                    CACHE_KEY,
                    JSON.stringify({ data, timestamp: Date.now() })
                );
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
        if (showFullAd || showCreateAdModal || ads.length === 0) {
            clearTimeout(timerRef.current);
            return;
        }

        timerRef.current = setTimeout(() => {
            setCurrent((prev) => (prev + 1) % ads.length);
        }, interval);

        return () => clearTimeout(timerRef.current);
    }, [current, ads.length, interval, showFullAd, showCreateAdModal]);

    // Manual navigation (arrow buttons and clicking any dot)
    const goTo = idx => {
        setCurrent(idx);
        clearTimeout(timerRef.current);
    };
    const prevAd = () => goTo((current - 1 + ads.length) % ads.length);
    const nextAd = () => goTo((current + 1) % ads.length);


    // Displays current Ad. 
    const ad = ads[current];

    // Clicking "View Ad" button
    const handleSeeMore = () => {
        setShowFullAd(true);
    };


    // handle ad create from CreateAdModal
    // When a new ad is created, update both state and cache
    const handleAdCreated = (newAd) => {
        setAds(prev => {
            const updated = [newAd, ...prev];     // adds to start of ad list
            localStorage.setItem(                 // adds to cache in localstorage
                CACHE_KEY,
                JSON.stringify({ data: updated, timestamp: Date.now() })
            );
            return updated;
        });
        setCurrent(0);                     // jumps showcase to the new ad (start)
        setShowFullAd(false);              // open full view (optional)

    };

    return (
        <div className="card showcase-wrapper">
            <div className="showcase-top-row">
                <h4 className="showcase-title">Featured Community Ad</h4>
                <div className="showcase-button" onClick={() => setShowCreateAdModal(true)}>+</div>
            </div>

            {/* CONDITIONAL STATES */}
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>
                    There was an error showing ads. Email at{" "}
                    <b>
                        <a href="mailto:edaterlovetest@gmail.com" style={{ cursor: "pointer" }}>
                            edaterlovetest@gmail.com
                        </a>
                    </b>
                </div>
            ) : !ads.length ? (
                <div>No ads available.</div>
            ) : (
                <>
                    {/* AD SECTION */}
                    <div className="showcase-middle-row">
                        <div className="showcase-ad-message clamp">{ad.Message}</div>
                        {ad.Link ? (
                            <a
                                className="showcase-ad-link clamp"
                                href={typeof ad.Link === "string" ? ad.Link : ad.Link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {typeof ad.Link === "string" ? ad.Link : (ad.Link.text || ad.Link.url)}
                            </a>
                        ) : (
                            <span className="showcase-ad-link-anonymous clamp">Anonymous</span>
                        )}
                    </div>

                    <div className="showcase-view-button" onClick={handleSeeMore}>View Post</div>

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
                </>)
            }

            {
                showCreateAdModal && <CreateAdModal onClose={() => setShowCreateAdModal(false)}
                    onAdCreated={handleAdCreated}   // when function called by child (only on success) -> add new ad on top (takes in new ad as param)
                />
            }
            <ViewAdModal open={showFullAd} onClose={() => setShowFullAd(false)} ad={ad} />
        </div >
    );
}