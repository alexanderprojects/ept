const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const Airtable = require("airtable")
require("dotenv").config() // load .env
const validateAdInput = require("./utils/validateAdInput")
const { lemonSqueezySetup } = require("@lemonsqueezy/lemonsqueezy.js")
const crypto = require("crypto")

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
app.post("/create-checkout", async (req, res) => {
	const { message, link, email } = req.body

	const errorMsg = validateAdInput({ message, link, email })
	if (errorMsg) {
		return res.status(400).json({ error: errorMsg })
	}

	try {
		const { createCheckout } = require("@lemonsqueezy/lemonsqueezy.js")

		const checkout = await createCheckout(LEMON_STORE_ID, LEMON_VARIANT_ID, {
			checkoutData: {
				email: email.trim(),
				custom: [`message=${message.trim()}`, `link=${link?.trim() || ""}`],
			},
			checkoutOptions: {
				buttonColor: "#7C3AED",
			},
			productOptions: {
				redirectUrl: `${process.env.FRONTEND_URL}/payment-success`,
			},
		})

		if (checkout.error) {
			throw new Error(checkout.error.message)
		}

		const checkoutUrl = checkout.data?.data.attributes.url

		if (!checkoutUrl) {
			throw new Error("Failed to create checkout session")
		}

		res.json({
			success: true,
			checkoutUrl,
		})
	} catch (err) {
		console.error("Checkout creation error:", err)
		res.status(500).json({
			error: "Failed to create checkout session.",
		})
	}
})

function verifyWebhookSignature(rawBody, signature, secret) {
	const hmac = crypto.createHmac("sha256", secret)
	const digest = hmac.update(rawBody).digest("hex")
	return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

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

			const isValid = verifyWebhookSignature(
				req.body,
				signature,
				LEMON_SIGNING_SECRET
			)

			if (!isValid) {
				console.error("Invalid webhook signature")
				return res.status(401).send("Unauthorized")
			}

			const payload = JSON.parse(req.body.toString())
			const eventName = payload.meta.event_name

			console.log("Webhook received:", eventName)

			if (eventName === "order_created") {
				const email = payload.data.attributes.user_email
				const customDataArray = payload.meta.custom_data || []

				const customData = {}
				customDataArray.forEach((item) => {
					const [key, ...valueParts] = item.split("=")
					customData[key] = valueParts.join("=")
				})

				const message = customData.message
				const link = customData.link

				if (!message || !email) {
					console.error("Missing required data in webhook payload")
					return res.status(400).send("Bad Request")
				}

				const record = await base("Ads").create({
					Message: message.trim(),
					Link: link?.trim() || null,
					Email: email.trim(),
					Paid: true,
				})

				console.log("✅ Ad created successfully:", record.id)

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
