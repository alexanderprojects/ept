
import ModalWrapper from "./ModalWrapper";
import BenefitCard from "./benefitCard/BenefitCard";
import ContactCard from "./contactCard/contactCard";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function CreateAdModal({ onClose }) {

    return (
        <ModalWrapper onClose={onClose}>
            <h3 style={{ color: "#BE1884", marginBottom: 10 }}>
                Advertise on the Community Board for $29.99
            </h3>
            <p>
                <b>
                    Want to shoutout your e-love, promote your profile or have a general message to the e-dating community?
                </b>
            </p>

            <BenefitCard />
            <ContactCard />

        </ModalWrapper>
    );
}