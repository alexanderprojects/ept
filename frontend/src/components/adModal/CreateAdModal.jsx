import { useState } from "react";
import ModalWrapper from "./ModalWrapper";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";
import Form from "./adForm/Form";
import BenefitCard from "./benefitCard/BenefitCard";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function CreateAdModal({ onClose, onAdCreated }) {
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);
    const [successModal, setSuccessModal] = useState(null);
    const [errorModal, setErrorModal] = useState(null);

    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        // Check if email is empty
        if (!email.trim()) newErrors.email = "Email is required.";


        // Check if message is empty
        if (!message.trim()) newErrors.message = "Message is required.";

        // Check if link is empty
        // if (!link.trim()) newErrors.link = "Link is required.";

        // if email has a value, validate email
        if (email.trim()) {
            // Basic RFC 5322 compliant regex
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = "Email must be a valid email address.";
            }
        }
        // If link has a value, validate URL
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
            // Send ad creation request to backend
            const res = await fetch(`${backendUrl}/create-ad`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message, email,
                    link: link.trim() || null  //if link is empty string, send null, otherwise send trimemd link
                }),
            });

            const data = await res.json();

            // If backend fails, throw error
            if (!res.ok) throw new Error(data.error || "Failed to create ad");

            // Success -> show SuccessModal
            setSuccessModal(data.ad);
        } catch (err) {
            // Failure -> show ErrorModal
            setErrorModal(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (successModal) return <SuccessModal ad={successModal} onClose={onClose} onAdCreated={onAdCreated} />;

    if (errorModal) return <ErrorModal message={errorModal} onRetry={() => setErrorModal(null)} onClose={onClose} />;

    return (
        <ModalWrapper onClose={onClose}>
            <h3 style={{ color: "#BE1884", marginBottom: 10 }}>
                Advertise on the Community Board
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
            <p style={{ fontSize: "12px", marginTop: "8px" }}>Contact us at  {" "}
                <b>
                    <a href="mailto:edaterlovetest@gmail.com">
                        edaterlovetest@gmail.com
                    </a>
                </b>
            </p>
        </ModalWrapper>
    );
}
