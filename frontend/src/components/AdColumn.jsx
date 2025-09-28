import { useState } from "react";
import { ads, renderAdMessage } from "../data/ads";
import AdModal from "./adModal/AdModal";

export default function AdColumn() {
    const [showAdModal, setShowAdModal] = useState(false);

    return (
        <div className="ad-column">
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <h3 className="section-header" style={{ flex: 1, textAlign: 'center', borderRadius: '6px', marginBottom: '13px' }}>Community</h3>
                <h3 className="section-header-button" style={{ textAlign: 'center', borderRadius: '6px', marginBottom: '13px' }}
                    onClick={() => setShowAdModal(true)}
                >+ </h3>
            </div>

            <div className="ad-list">
                {ads.map((ad, index) => (
                    <div key={index} className="ad-item">
                        <div className="ad-message-section">{renderAdMessage(ad)}</div>
                        {ad.username ? (
                            <a
                                href={ad.authorDetails.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: 'none', fontWeight: 'normal' }}
                            >
                                <div className="ad-author-section clickable">
                                    @{ad.author} on {ad.authorDetails.type}
                                </div>
                            </a>
                        ) : (
                            <div className="ad-author-section">{ad.author}</div>
                        )}
                    </div>
                ))}

                <div
                    className="ad-item advertise-here-card"
                    role="button"
                    onClick={() => setShowAdModal(true)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setShowAdModal(false); }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', alignItems: 'center' }}
                >
                    <div style={{ fontWeight: 500, color: "#BE1884" }}>+ Advertise Here</div>
                    <div style={{ color: "#EC83A8", fontSize: "12px" }}>Your message or link</div>
                </div>
            </div>

            {showAdModal && <AdModal onClose={() => setShowAdModal(false)} />}
        </div>
    )
}
