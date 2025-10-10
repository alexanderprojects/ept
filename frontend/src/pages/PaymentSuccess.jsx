import { useNavigate } from 'react-router-dom';
import './PaymentSuccess.css';
// uses app.css aswell

export default function PaymentSuccess() {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="container">
            <div className="card" style={{ marginTop: '50px', marginBottom: '12px' }}>
                <div className="success-icon">✓</div>
                <br />
                <h3>Payment Successful!</h3>
                <br />

                <p>
                    Your ad has been submitted and will appear on the community board shortly.
                </p>

                <p>
                    If there are any issues, please email at {" "}
                    <b>
                        <a href="mailto:edaterlovetest@gmail.com">
                            edaterlovetest@gmail.com
                        </a>
                    </b>
                </p>
                <br />
                <button className="button" onClick={handleGoHome}>
                    Back to Community Board
                </button>
            </div>
        </div>
    );
}
