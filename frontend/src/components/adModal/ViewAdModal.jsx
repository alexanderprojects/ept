// src/components/adModal/FullAdModal.jsx
import ModalWrapper from "./ModalWrapper";
import './Modal.css';

export default function ViewAdModal({ open, onClose, ad }) {
    if (!open) return null;

    return (
        <ModalWrapper onClose={onClose}>
            <h3 className="showcase-title" style={{ marginBottom: 15 }}>Post</h3>
            {/* Ad Post */}
            <div style={{ whiteSpace: "pre-line", marginBottom: 14, overflowWrap: "break-word" }}>
                {ad.Message}
            </div>
            {ad.Link ? (
                <a
                    className="showcase-ad-link"
                    href={ad.Link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 16, overflowWrap: "break-word" }}
                >
                    {ad.Link}
                </a>
            ) : (
                <span className="showcase-ad-link-anonymous clamp">Anonymous</span>
            )}
        </ModalWrapper>
    );
}
