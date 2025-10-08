// validateAdInput.js
function validateAdInput({ message, link, email }) {
	if (!message || typeof message !== "string" || message.trim() === "") {
		return "Message is required and must be a non-empty string."
	}
	// if (!link || typeof link !== "string" || link.trim() === "") {
	// return "Link is required and must be a non-empty string."
	// }

	if (!email || typeof email !== "string" || email.trim() === "") {
		return "Email is required and must be a non-empty string."
	}

	// Link is optional, only validate URL format if provided
	if (link && typeof link === "string" && link.trim() !== "") {
		try {
			new URL(link.trim())
		} catch {
			return "Link must be a valid URL."
		}
	}

	// Validate email format (basic RFC 5322 compliant regex)
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		return "Email must be a valid email address."
	}

	return null // no errors
}

module.exports = validateAdInput
