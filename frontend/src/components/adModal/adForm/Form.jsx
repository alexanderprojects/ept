import "./Form.css";

export default function Form({
    message,
    setMessage,
    link,
    setLink,
    email,
    setEmail,
    handleSubmit,
    loading,
    errors,
    setErrors, // <-- add setErrors prop
}) {
    return (
        <form onSubmit={handleSubmit} className="ad-form">
            <label>
                <p className="input-text">Email*</p>
                <input
                    type="text"
                    value={email}
                    onChange={e => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    placeholder="yourname@example.com"
                    className="ad-form-input"
                    maxLength={50}
                />
                {/* Error for empty/invalid link */}
                {errors.email && <div className="ad-form-error">{errors.email}</div>}
            </label>

            <label >
                <p className="input-text">Message*</p>
                <textarea
                    value={message}
                    onChange={e => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors(prev => ({ ...prev, message: undefined }));
                    }}
                    rows={3}
                    className="ad-form-textarea"
                    placeholder="Write your message here..."
                    maxLength={200}
                />
                {/* Error for empty/invalid message */}
                {errors.message && <div className="ad-form-error">{errors.message}</div>}
            </label>

            <label>
                <p className="input-text">Link*</p>
                <input
                    type="text"
                    value={link}
                    onChange={e => {
                        setLink(e.target.value);
                        if (errors.link) setErrors(prev => ({ ...prev, link: undefined }));
                    }}
                    className="ad-form-input"
                    placeholder="https://example.com"
                    maxLength={100}
                />
                {/* Error for empty/invalid link */}
                {errors.link && <div className="ad-form-error">{errors.link}</div>}
            </label>


            {/* General submit error (if added in future) */}
            {errors.submit && <div className="ad-form-error">{errors.submit}</div>}

            {/* Disclaimer text under the form */}
            <p className="ad-form-note">
                We reserve the right to remove submissions if deemed too inappropriate.
                We will contact you to give you an opportunity to modify it.
            </p>

            {/* Submit button (disabled while loading) */}
            <button
                type="submit"
                className="ad-form-submit"
                disabled={loading}
            >
                {loading ? "Submitting..." : "Submit"}
            </button>
        </form>
    );
}
