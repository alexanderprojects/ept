const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const Airtable = require("airtable")
require("dotenv").config() // load .env
const validateAdInput = require("./utils/validateAdInput")

const PORT = process.env.PORT || 3000

// Airtable setup
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
	process.env.AIRTABLE_BASE_ID
)
const tableName = "Ads"

const app = express()

// CORS setup
const allowedOrigins = [
	"http://localhost:5173", // dev frontend
	"https://edaterlovetest.com", // production frontend
]

app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin) {
				// If request has no origin (e.g., Postman or server-to-server), allow it
				return callback(null, true)
			}
			if (allowedOrigins.includes(origin)) {
				// If origin is in the whitelist, allow it
				return callback(null, true)
			}
			// Otherwise, block
			return callback(new Error("Not allowed by CORS"))
		},
	})
)

app.use(bodyParser.json())

// In-memory cache
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
		res.json(ads)
	} catch (err) {
		console.error("Error fetching ads:", err)

		// If Airtable fails but cache exists, serve fallback
		if (adsCache) {
			return res.json(adsCache)
		}

		res.status(500).json({ error: "Failed to fetch ads." })
	}
})

// Create a new ad (ignore Stripe for now)
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

		res.json({
			success: true,
			ad: { id: record.id, ...record.fields },
		})
	} catch (err) {
		console.error("Airtable error:", err)
		res.status(500).json({ error: "Failed to create ad in Airtable." })
	}
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
