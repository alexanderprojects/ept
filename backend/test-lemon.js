// test-lemon.js - Run this to verify your Lemon Squeezy configuration
require("dotenv").config()

const LEMON_SECRET_KEY = process.env.LEMON_SECRET_KEY
const LEMON_STORE_ID = process.env.LEMON_STORE_ID
const LEMON_VARIANT_ID = process.env.LEMON_VARIANT_ID

async function testLemonSqueezy() {
	console.log("Testing Lemon Squeezy Configuration...")
	console.log("=====================================\n")

	// Test 1: Check if API key works
	console.log("1. Testing API Key...")
	try {
		const response = await fetch("https://api.lemonsqueezy.com/v1/users/me", {
			headers: {
				Accept: "application/vnd.api+json",
				Authorization: `Bearer ${LEMON_SECRET_KEY}`,
			},
		})

		if (response.ok) {
			const data = await response.json()
			console.log("✅ API Key is valid")
			console.log(`   User: ${data.data.attributes.name}\n`)
		} else {
			console.log("❌ API Key is invalid")
			return
		}
	} catch (err) {
		console.log("❌ Failed to connect:", err.message)
		return
	}

	// Test 2: Verify Store ID
	console.log("2. Testing Store ID...")
	try {
		const response = await fetch(
			`https://api.lemonsqueezy.com/v1/stores/${LEMON_STORE_ID}`,
			{
				headers: {
					Accept: "application/vnd.api+json",
					Authorization: `Bearer ${LEMON_SECRET_KEY}`,
				},
			}
		)

		if (response.ok) {
			const data = await response.json()
			console.log("✅ Store ID is valid")
			console.log(`   Store: ${data.data.attributes.name}`)
			console.log(`   Store ID: ${LEMON_STORE_ID}\n`)
		} else {
			console.log(`❌ Store ID (${LEMON_STORE_ID}) is invalid`)
			console.log("   Getting your stores...\n")
			await listStores()
			return
		}
	} catch (err) {
		console.log("❌ Failed:", err.message)
		return
	}

	// Test 3: Verify Variant ID
	console.log("3. Testing Variant/Product ID...")
	try {
		const response = await fetch(
			`https://api.lemonsqueezy.com/v1/variants/${LEMON_VARIANT_ID}`,
			{
				headers: {
					Accept: "application/vnd.api+json",
					Authorization: `Bearer ${LEMON_SECRET_KEY}`,
				},
			}
		)

		if (response.ok) {
			const data = await response.json()
			console.log("✅ Variant ID is valid")
			console.log(`   Product: ${data.data.attributes.name}`)
			console.log(`   Variant ID: ${LEMON_VARIANT_ID}`)
			console.log(
				`   Price: ${data.data.attributes.price / 100} ${
					data.data.attributes.currency
				}\n`
			)
		} else {
			console.log(`❌ Variant ID (${LEMON_VARIANT_ID}) is invalid`)
			console.log("   Getting your variants...\n")
			await listVariants()
			return
		}
	} catch (err) {
		console.log("❌ Failed:", err.message)
		return
	}

	console.log("=====================================")
	console.log("✅ All IDs are valid! You're ready to go.")
}

async function listStores() {
	try {
		const response = await fetch("https://api.lemonsqueezy.com/v1/stores", {
			headers: {
				Accept: "application/vnd.api+json",
				Authorization: `Bearer ${LEMON_SECRET_KEY}`,
			},
		})

		if (response.ok) {
			const data = await response.json()
			console.log("   Your stores:")
			data.data.forEach((store) => {
				console.log(`   - ${store.attributes.name} (ID: ${store.id})`)
			})
			console.log("")
		}
	} catch (err) {
		console.log("   Failed to list stores:", err.message)
	}
}

async function listVariants() {
	try {
		const response = await fetch(
			`https://api.lemonsqueezy.com/v1/variants?filter[store_id]=${LEMON_STORE_ID}`,
			{
				headers: {
					Accept: "application/vnd.api+json",
					Authorization: `Bearer ${LEMON_SECRET_KEY}`,
				},
			}
		)

		if (response.ok) {
			const data = await response.json()
			console.log("   Your variants for this store:")
			data.data.forEach((variant) => {
				console.log(
					`   - ${variant.attributes.name} (Variant ID: ${variant.id})`
				)
			})
			console.log("")
		}
	} catch (err) {
		console.log("   Failed to list variants:", err.message)
	}
}

testLemonSqueezy()
