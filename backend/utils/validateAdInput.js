// validateAdInput.js
function validateAdInput({ message, link }) {
	if (!message || typeof message !== "string" || message.trim() === "") {
		return "Message is required and must be a non-empty string."
	}
	if (!link || typeof link !== "string" || link.trim() === "") {
		return "Link is required and must be a non-empty string."
	}

	try {
		new URL(link)
	} catch {
		return "Link must be a valid URL."
	}

	return null // no errors
}

module.exports = validateAdInput
