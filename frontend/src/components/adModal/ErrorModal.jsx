import ModalWrapper from "./ModalWrapper";

export default function ErrorModal({ message, onRetry, onClose }) {
    return (
        <ModalWrapper onClose={onClose}>
            <h3 style={{ color: "#BE1884", marginBottom: 10 }}>Failed to Submit Ad</h3>
            <p style={{ color: "red", marginBottom: 15 }}>{message}</p>
            <button
                className="showcase-view-button"
                onClick={onRetry}
                style={{ marginTop: 10 }}
            >
                Retry
            </button>
        </ModalWrapper>
    );
}
