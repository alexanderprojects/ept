import './Modal.css';

export default function ModalWrapper({ onClose, children }) {
    return (
        <div className="ad-modal-overlay" onClick={onClose}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
                <button className="ad-modal-close" onClick={onClose} aria-label="Close">&times;</button>
                {children}
            </div>
        </div>
    );
}
