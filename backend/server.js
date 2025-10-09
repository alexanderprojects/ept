const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const Airtable = require("airtable")
const { lemonSqueezySetup } = require("@lemonsqueezy/lemonsqueezy.js")
require("dotenv").config()
const validateAdInput = require("./utils/validateAdInput")
const crypto = require("crypto")
const { raw } = require("express")

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

// Initialize Lemon Squeezy SDK
lemonSqueezySetup({ apiKey: LEMON_SECRET_KEY })

const app = express()

// CORS setup
const allowedOrigins = [
	"http://localhost:5173",
	"https://edaterlovetest.com",
	"https://github.com/alexanderprojects/ept",
]
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true)
			if (allowedOrigins.includes(origin)) return callback(null, true)
			return callback(new Error("Not allowed by CORS"))
		},
	})
)

app.use(express.json())

// In-memory Airtable Cache setup
let adsCache = null
let lastFetched = 0
const CACHE_TTL = 1000 * 60 * 30

async function fetchAdsFromAirtable() {
	const records = await base(tableName)
		.select({
			maxRecords: 10,
			sort: [{ field: "CreatedAt", direction: "desc" }],
			filterByFormula: `{Paid} = TRUE()`,
		})
		.firstPage()

	return records.map((r) => ({ id: r.id, ...r.fields }))
}

app.get("/ads", async (req, res) => {
	try {
		const now = Date.now()

		if (adsCache && now - lastFetched < CACHE_TTL) {
			return res.json(adsCache)
		}

		const ads = await fetchAdsFromAirtable()

		adsCache = ads
		lastFetched = now

		const filteredAds = ads.map((ad) => ({
			id: ad.id,
			Message: ad.Message,
			CreatedAt: ad.CreatedAt,
		}))

		res.json(filteredAds)
	} catch (err) {
		console.error("Error fetching ads:", err)

		if (adsCache) {
			return res.json(adsCache)
		}

		res.status(500).json({ error: "Failed to fetch ads." })
	}
})

app.post("/create-ad", async (req, res) => {
	const { message, link, email } = req.body

	const errorMsg = validateAdInput({ message, link, email })
	if (errorMsg) {
		return res.status(400).json({ error: errorMsg })
	}

	try {
		const record = await base("Ads").create({
			Message: message.trim(),
			Link: link?.trim() || null,
			Email: email.trim(),
			Paid: true,
		})

		adsCache = null
		lastFetched = 0

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

// Helper to verify webhook signature
function verifyWebhookSignature(req, secret) {
	const signature = req.headers["x-hub-signature-256"]
	if (!signature) {
		return false
	}

	// Convert request body to string if it's not already
	const bodyStr =
		typeof req.body === "string"
			? req.body
			: JSON.stringify(req.body)

	const hmac = crypto.createHmac("sha256", secret)
	hmac.update(bodyStr)
	const calculatedSignature = `sha256=${hmac.digest("hex")}`

	return crypto.timingSafeEqual(
		Buffer.from(signature),
		Buffer.from(calculatedSignature)
	)
}

app.post(
	"/webhook",
	raw({ type: "application/json" }), // <-- raw body as Buffer
	(req, res) => {
		if (!verifyWebhookSignature(req, process.env.WEBHOOK_SECRET)) {
			return res.status(401).send("Invalid signature")
		}

		// Parse the raw body as JSON after verification
		const payload = JSON.parse(req.body.toString())

		const eventName = payload.meta.event_name

		console.log("Webhook received:", eventName)

		if (eventName === "order_created") {
			const email = payload.data.attributes.user_email
			const customDataArray = payload.meta.custom_data || []

			// Convert ["key=value"] array into object
			const customData = {}
			customDataArray.forEach((item) => {
				const [key, ...valueParts] = item.split("=")
				customData[key] = valueParts.join("=") // Join in case value contains '='
			})

			const message = customData.message
			const link = customData.link

			if (!message || !email) {
				console.error("Missing required data in webhook payload", {
					customData,
					email,
				})
				return res.status(400).send("Bad Request")
			}

			// Create Airtable record
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
	}
)


app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
