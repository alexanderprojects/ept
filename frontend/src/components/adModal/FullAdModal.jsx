// src/components/adModal/FullAdModal.jsx
import './Modal.css';
export default function FullAdModal({ open, onClose, ad }) {
    if (!open) return null;

    return (
        <div className="ad-modal-overlay" onClick={onClose}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
                <button className="ad-modal-close" onClick={onClose} aria-label="Close">&times;</button>
                <div style={{ marginBottom: 15, fontWeight: 600, fontSize: 18, color: "#BE1884" }}>
                    Ad Post
                </div>
                <div style={{ whiteSpace: "pre-line", marginBottom: 14 }}>{ad.Message}</div>
                {ad.Link && (
                    <a
                        className="showcase-ad-link"
                        href={ad.Link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 16 }}
                    >
                        {ad.Link}
                    </a>
                )}
            </div>
        </div>
    );
}
