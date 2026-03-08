import React from "react";
import "./ContactCard.css";

export default function ContactCard() {

    return (
        <div className="contact-card">

            <p className="contact-card-title">
                Contact us at{" "}
                <b>
                    <a href="mailto:edaterlovetest@gmail.com">
                        edaterlovetest@gmail.com
                    </a>
                </b>
            </p>
            {/* Disclaimer text under the form */}
            <p className="contact-card-note">
                We reserve the right to remove submissions if deemed inappropriate.
                We will contact you to give you an opportunity to modify it.
            </p>
        </div>
    );
}
