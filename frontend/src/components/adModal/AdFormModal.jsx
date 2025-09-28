import './Modal.css';

export default function AdFormModal({ onClose }) {
    return (
        <div className="ad-modal-overlay" onClick={onClose}>
            <div className="ad-modal" onClick={e => e.stopPropagation()}>
                <button className="ad-modal-close" onClick={onClose} aria-label="Close">&times;</button>
                <h3 style={{ color: "#BE1884", marginBottom: 10 }}>Advertise on the Community Board</h3>

                <p style={{ marginBottom: 15 }}>
                    <b>

                        Want to  shoutout your e-love, promote your profile or have a general message to the e-dating community?
                    </b>
                </p>
                <p style={{ marginBottom: 15 }}>
                    With over 80k+ site visits and counting weekly,
                    a chance to get your message seen by the whole e-dating community.
                </p>

                <div style={{ backgroundColor: "#FFE4EC", padding: 15, borderRadius: 8, marginBottom: 15, textAlign: "center" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#BE1884", fontSize: 16 }}>Pricing</h4>
                    <div style={{ marginBottom: 5 }}>
                        <strong>General Message - $3 </strong>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <strong>Message with a Link - $5 </strong>
                    </div>
                    <p style={{ fontSize: 13, color: "#e39dd2ff", margin: 0, fontStyle: "italic" }}>
                        First come, first serve basis
                    </p>
                </div>

                <p style={{ textAlign: "left" }}>
                    Email <b>alexander@gmail.com</b> to create an advertisement.

                </p>
                <br />
                <p style={{ fontSize: 13, color: "#e39dd2ff", textAlign: "left" }}>
                    After payment confirmation, ads go live in 1-2 business days.
                    <br />
                    We reserve the right to decline submissions if deemed irrelevant or inappropriate.
                    <br />
                </p>
            </div>
        </div >
    )
}