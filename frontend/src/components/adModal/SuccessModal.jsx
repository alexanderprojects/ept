import ModalWrapper from "./ModalWrapper";

export default function SuccessModal({ ad, onClose, onAdCreated }) {
    const handleViewOnSite = () => {
        onAdCreated?.(ad); // notify ShowcaseCard about new ad
        onClose();
    };

    return (
        <ModalWrapper onClose={onClose}>
            <h3 style={{ color: "#BE1884", marginBottom: 10 }}>Your Ad is Live!</h3>
            <p style={{ marginBottom: 15 }}>
                Your ad is now featured at the very top of the community board!
            </p>
            {/* AD PREVIEW */}
            <div className="card" style={{ marginBottom: 10 }}>
                <div className="showcase-ad-message">{ad.Message}</div>

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
                    <span style={{ fontStyle: "italic", color: "#dca8c8" }}>Anonymous</span>
                )}
            </div>

            <div
                className="showcase-button"
                style={{ display: "inline-block", marginTop: 10 }}
                onClick={handleViewOnSite}
            >
                View on Site
            </div>
        </ModalWrapper>
    );
}
