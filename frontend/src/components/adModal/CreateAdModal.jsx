import { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import ErrorModal from "./ErrorModal";
import Form from "./form/Form";
import BenefitCard from "./benefitCard/BenefitCard";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function CreateAdModal({ onClose, onAdCreated }) {
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorModal, setErrorModal] = useState(null);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!email.trim()) newErrors.email = "Email is required.";
        if (!message.trim()) newErrors.message = "Message is required.";

        if (email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = "Email must be a valid email address.";
            }
        }

        if (link.trim()) {
            try {
                new URL(link);
            } catch {
                newErrors.link = "Link must be a valid URL, it must start with https://";
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Run validation before submitting
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            // Create checkout session with Lemon Squeezy
            const res = await fetch(`${backendUrl}/create-checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    email,
                    link: link.trim() || null
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create checkout");

            // Redirect to Lemon Squeezy checkout
            window.location.href = data.checkoutUrl;

        } catch (err) {
            setErrorModal(err.message);
            setLoading(false);
        }
    };


    if (errorModal) return <ErrorModal message={errorModal} onRetry={() => setErrorModal(null)} onClose={onClose} />;

    return (
        <ModalWrapper onClose={onClose}>
            <h3 style={{ color: "#BE1884", marginBottom: 10 }}>
                Advertise on the Community Board for $8.99
            </h3>
            <p>
                <b>
                    Want to shoutout your e-love, promote your profile or have a general message to the e-dating community?
                </b>
            </p>

            <BenefitCard />
            <Form
                message={message}
                setMessage={setMessage}
                link={link}
                setLink={setLink}
                email={email}
                setEmail={setEmail}
                handleSubmit={handleSubmit}
                loading={loading}
                errors={errors}
                setErrors={setErrors}
            />
            <p style={{ fontSize: "12px", marginTop: "8px" }}>
                Contact us at{" "}
                <b>
                    <a href="mailto:edaterlovetest@gmail.com">
                        edaterlovetest@gmail.com
                    </a>
                </b>
            </p>
        </ModalWrapper>
    );
}