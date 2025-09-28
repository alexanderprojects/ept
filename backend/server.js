const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const Airtable = require("airtable")
require("dotenv").config() // load .env

const PORT = process.env.PORT || 3000

// Airtable setup
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
	process.env.AIRTABLE_BASE_ID
)
const tableName = "Ads"

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Fetch all paid ads
app.get("/ads", async (req, res) => {
	try {
		const records = await base(tableName)
			.select({
				maxRecords: 10, // Limit the number of records
				sort: [{ field: "CreatedAt", direction: "desc" }],
				filterByFormula: `{Paid} = TRUE()`, // Filter records
			})
			.firstPage() // Fetch the first page of records

		const ads = records.map((r) => ({ id: r.id, ...r.fields }))
		// console.log("Fetched records:")
		// records.forEach((record) => {
		// console.log("Record ID:", record.id, "Fields:", record.fields)
		// })
		res.json(ads)
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

// Create a new ad (ignore Stripe for now)
app.post("/create-ad", async (req, res) => {
	const { message, link } = req.body

	try {
		// Write to Airtable immediately with Paid = TRUE
		const record = await base("Ads").create({
			Message: message,
			Link: link,
			Paid: true, // mark as paid since we are skipping Stripe
		})

		res.json({
			success: true,
			ad: { id: record.id, ...record.fields },
		})
	} catch (err) {
		res.status(500).json({ error: err.message })
	}
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
