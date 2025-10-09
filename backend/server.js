const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const Airtable = require("airtable")
require("dotenv").config() // load .env
const validateAdInput = require("./utils/validateAdInput")
const crypto = require("crypto")
const getRawBody = require("raw-body")

const PORT = process.env.PORT || 3000

// Airtable setup
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
	process.env.AIRTABLE_BASE_ID
)
const tableName = "Ads"

// Lemon Squeezy setup
const LEMON_SECRET_KEY = process.env.LEMON_SECRET_KEY
const LEMON_STORE_ID = process.env.LEMON_STORE_ID
const LEMON_VARIANT_ID = process.env.LEMON_VARIANT_ID
const LEMON_SIGNING_SECRET = process.env.LEMON_SIGNING_SECRET

const app = express()

// CORS setup
const allowedOrigins = [
	"http://localhost:5173", // dev frontend
	"https://edaterlovetest.com", // production frontend
	"https://github.com/alexanderprojects/ept", // production frontend github pages
]
app.use(
	cors({
		origin: function (origin, callback) {
			// If request has no origin (e.g., Postman or server-to-server), allow it - removed for production so direct url visits doesnt show anything.
			if (!origin) return callback(null, true)
			// If origin is in the whitelist, allow it
			if (allowedOrigins.includes(origin)) return callback(null, true)
			// Otherwise, block
			return callback(new Error("Not allowed by CORS"))
		},
	})
)

// JSON parsing — except for webhook
app.use(bodyParser.json())

// In-memory Airtable Cache setup
let adsCache = null
let lastFetched = 0
// TTL (e.g. 10 minutes)
const CACHE_TTL = 1000 * 60 * 30

// --- Helper to fetch from Airtable ---
async function fetchAdsFromAirtable() {
	const records = await base(tableName)
		.select({
			maxRecords: 10, // Limit the number of records
			sort: [{ field: "CreatedAt", direction: "desc" }],
			filterByFormula: `{Paid} = TRUE()`, // Filter records
		})
		.firstPage()

	return records.map((r) => ({ id: r.id, ...r.fields }))
}

// Fetch all paid ads
app.get("/ads", async (req, res) => {
	try {
		const now = Date.now()

		// Serve from cache if valid
		if (adsCache && now - lastFetched < CACHE_TTL) {
			return res.json(adsCache)
		}

		// Otherwise fetch fresh
		const ads = await fetchAdsFromAirtable()

		// Update cache
		adsCache = ads
		lastFetched = now

		// console.log("Fetched records:")
		// records.forEach((record) => {
		// console.log("Record ID:", record.id, "Fields:", record.fields)
		// })

		// Only send desired fields
		const filteredAds = ads.map((ad) => ({
			id: ad.id,
			Message: ad.Message,
			CreatedAt: ad.CreatedAt,
		}))

		res.json(filteredAds)
	} catch (err) {
		console.error("Error fetching ads:", err)

		// If Airtable fails but cache exists, serve fallback
		if (adsCache) {
			return res.json(adsCache)
		}

		res.status(500).json({ error: "Failed to fetch ads." })
	}
})

// Create a new ad (ignore lemonsqueezy for now)
app.post("/create-ad", async (req, res) => {
	const { message, link, email } = req.body

	// Validate body input
	const errorMsg = validateAdInput({ message, link, email })
	if (errorMsg) {
		return res.status(400).json({ error: errorMsg })
	}

	try {
		// return res.status(400).json({ error: errorMsg })
		// -- for error modal testing

		// Write to Airtable immediately with Paid = TRUE
		const record = await base("Ads").create({
			Message: message.trim(),
			Link: link?.trim() || null, // optional link: null if empty
			Email: email.trim(),
			Paid: true, // mark as paid since we are skipping Stripe
		})

		// Invalidate cache (force refresh next time someone calls GET /ads)
		adsCache = null
		lastFetched = 0

		// Only return safe fields to frontend
		res.json({
			success: true,
			ad: {
				id: record.id,
				Message: record.fields.Message,
				CreatedAt: record.fields.CreatedAt || new Date().toISOString(),
			},
		})
	} catch (err) {
		console.error("Airtable error:", err)
		res.status(500).json({ error: "Failed to create ad in Airtable." })
	}
})

// Updated /create-checkout endpoint
app.post("/create-checkout", async (req, res) => {
	const { message, link, email } = req.body

	// Validate body input
	const errorMsg = validateAdInput({ message, link, email })
	if (errorMsg) {
		return res.status(400).json({ error: errorMsg })
	}

	try {
		console.log("Creating checkout with:")
		console.log("Store ID:", LEMON_STORE_ID)
		console.log("Variant ID:", LEMON_VARIANT_ID)

		// Create checkout session with Lemon Squeezy
		const checkoutResponse = await fetch(
			"https://api.lemonsqueezy.com/v1/checkouts",
			{
				method: "POST",
				headers: {
					Accept: "application/vnd.api+json",
					"Content-Type": "application/vnd.api+json",
					Authorization: `Bearer ${LEMON_SECRET_KEY}`,
				},
				body: JSON.stringify({
					data: {
						type: "checkouts",
						attributes: {
							checkout_data: {
								email: email.trim(),
								// Custom data as array of "key=value" strings
								custom: [
									`message=${message.trim()}`,
									`link=${link?.trim() || ""}`,
								],
							},
						},
						relationships: {
							store: {
								data: {
									type: "stores",
									id: String(LEMON_STORE_ID),
								},
							},
							variant: {
								data: {
									type: "variants",
									id: String(LEMON_VARIANT_ID),
								},
							},
						},
					},
				}),
			}
		)

		const checkoutData = await checkoutResponse.json()

		if (!checkoutResponse.ok) {
			console.error(
				"Lemon Squeezy error:",
				JSON.stringify(checkoutData, null, 2)
			)

			// Better error message
			if (checkoutData.errors && checkoutData.errors.length > 0) {
				const error = checkoutData.errors[0]
				const detail = error.detail || "Unknown error"
				const pointer = error.source?.pointer || ""

				console.error(`Error at ${pointer}: ${detail}`)

				if (pointer.includes("store")) {
					throw new Error(
						"Invalid Store ID. Please check your LEMON_STORE_ID in .env"
					)
				} else if (pointer.includes("variant")) {
					throw new Error(
						"Invalid Variant ID. Please check your LEMON_VARIANT_ID in .env"
					)
				}
			}

			throw new Error("Failed to create checkout session")
		}

		const checkoutUrl = checkoutData.data.attributes.url

		console.log("✅ Checkout created:", checkoutUrl)

		res.json({
			success: true,
			checkoutUrl,
		})
	} catch (err) {
		console.error("Checkout creation error:", err)
		res.status(500).json({
			error: err.message || "Failed to create checkout session.",
		})
	}
})

// Helper function to verify webhook signature
function verifyWebhookSignature(rawBody, signature, secret) {
	const hmac = crypto.createHmac("sha256", secret)
	const digest = hmac.update(rawBody).digest("hex")
	return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

// Webhook endpoint - MUST use raw body
app.post(
	"/webhook",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		try {
			const signature = req.headers["x-signature"]

			if (!signature) {
				console.error("No signature header found")
				return res.status(401).send("Unauthorized")
			}

			// Verify the webhook signature
			const isValid = verifyWebhookSignature(
				req.body,
				signature,
				LEMON_SIGNING_SECRET
			)

			if (!isValid) {
				console.error("Invalid webhook signature")
				return res.status(401).send("Unauthorized")
			}

			// Parse the webhook payload
			const payload = JSON.parse(req.body.toString())
			const eventName = payload.meta.event_name

			console.log("Webhook received:", eventName)

			// Handle order_created event (successful payment)
			if (eventName === "order_created") {
				const email = payload.data.attributes.user_email

				// Parse custom data from meta.custom_data (array of "key=value" strings)
				const customDataArray = payload.meta.custom_data || []

				// Convert array of "key=value" strings to object
				const customData = {}
				customDataArray.forEach((item) => {
					const [key, ...valueParts] = item.split("=")
					customData[key] = valueParts.join("=") // Join back in case value contains '='
				})

				const message = customData.message
				const link = customData.link

				console.log("Parsed custom data:", customData)

				if (!message || !email) {
					console.error("Missing required data in webhook payload")
					console.log("Custom data:", customData)
					console.log("Email:", email)
					return res.status(400).send("Bad Request")
				}

				// Create ad in Airtable
				const record = await base("Ads").create({
					Message: message.trim(),
					Link: link?.trim() || null,
					Email: email.trim(),
					Paid: true,
				})

				console.log("✅ Ad created successfully:", record.id)

				// Invalidate cache
				adsCache = null
				lastFetched = 0
			}

			res.status(200).send("OK")
		} catch (err) {
			console.error("Webhook error:", err)
			res.status(500).send("Internal Server Error")
		}
	}
)

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
