// src/components/adModal/FullAdModal.jsx
import ModalWrapper from "./ModalWrapper";
import './Modal.css';

export default function ViewAdModal({ open, onClose, ad }) {
    if (!open) return null;

    return (
        <ModalWrapper onClose={onClose}>
            {/* <div style={{ marginBottom: 15, fontWeight: 600, fontSize: 18, color: "#BE1884" }}> */}
            {/* Ad Post */}
            {/* </div> */}
            <div style={{ whiteSpace: "pre-line", marginBottom: 14 }}>
                {ad.Message}
            </div>
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
        </ModalWrapper>
    );
}
