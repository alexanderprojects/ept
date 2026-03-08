import React from "react";
import "./BenefitCard.css";

export default function BenefitCard() {
    const benefits = ["shown to everyone", "wide-reaching", "permanent", "share a link"];

    return (
        <div className="benefit-card">
            <div className="benefit-card-title"><b>All posts are:</b></div>
            <div className="benefit-card-list">
                {benefits.map((benefit, idx) => (
                    <span key={idx} className="benefit-item">
                        <span className="benefit-dot">
                            <span className="benefit-check">✓</span>
                        </span>
                        {benefit === "anonymous" ? <i>{benefit}</i> : benefit}
                    </span>
                ))}
            </div>
        </div>
    );
}
