import OpenAI from "openai"
import * as dotenv from "dotenv"
dotenv.config()

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1"

const openai = new OpenAI({
  apiKey: OPENROUTER_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
  baseURL: OPENROUTER_BASE_URL,
  defaultHeaders: {
    "HTTP-Referer": "https://github.com/OpenRouterTeam/openrouter-examples",
  },
  // This example is designed to run in Node.js only, not in the browser
})

async function main() {
  try {
    // Check if API key is configured
    if (!OPENROUTER_API_KEY) {
      console.error("❌ OPENROUTER_API_KEY is not set in your .env file")
      console.log("Please add your OpenRouter API key to the .env file:")
      console.log("OPENROUTER_API_KEY=your_api_key_here")
      return
    }

    // Test network connectivity first
    console.log("🔄 Testing network connectivity...")
    try {
      const response = await fetch("https://openrouter.ai")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      console.log("✅ Network connectivity confirmed")
    } catch (networkError: any) {
      console.error("❌ Network connectivity test failed:")
      console.error("🌐 Cannot reach openrouter.ai")
      console.log("\nPossible solutions:")
      console.log("1. Check your internet connection")
      console.log("2. Verify firewall/proxy settings allow access to openrouter.ai")
      console.log("3. Try disabling VPN temporarily")
      console.log("4. Check if your network blocks external API calls")
      return
    }

    console.log("🔄 Testing OpenRouter API connection...")
    
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: "Say this is a test" }],
      model: "openai/gpt-3.5-turbo",
    })

    console.log("✅ API call successful!")
    console.log(completion.choices)

    console.log("\n🔄 Testing streaming response...")
    
    // Streaming responses
    const stream = await openai.chat.completions.create({
      model: "openai/gpt-4",
      messages: [{ role: "user", content: "Say this is a test" }],
      stream: true,
    })
    
    console.log("Stream response: ")
    for await (const part of stream) {
      process.stdout.write(part.choices[0]?.delta?.content || "")
    }
    console.log("\n✅ Streaming test completed!")
    
  } catch (error: any) {
    console.error("❌ Error occurred:")
    
    if (error.message && error.message.includes("Connection error")) {
      console.error("🌐 Connection error - cannot reach OpenRouter API")
      console.log("\nTroubleshooting steps:")
      console.log("1. Verify your internet connection is stable")
      console.log("2. Check if OPENROUTER_BASE_URL in .env is correct (should be https://openrouter.ai)")
      console.log("3. Ensure firewall/proxy allows access to openrouter.ai")
      console.log("4. Try running the command again in a few moments")
    } else if (error.status === 402) {
      console.error("💳 Insufficient credits on your OpenRouter account")
      console.log("\nTo fix this issue:")
      console.log("1. Visit https://openrouter.ai/settings/credits")
      console.log("2. Purchase credits for your account")
      console.log("3. Or verify your API key is correct in the .env file")
    } else if (error.status === 401) {
      console.error("🔑 Invalid API key")
      console.log("\nTo fix this issue:")
      console.log("1. Check your OPENROUTER_API_KEY in the .env file")
      console.log("2. Generate a new API key at https://openrouter.ai/keys")
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error("🌐 Network connection failed")
      console.log("\nThis usually means:")
      console.log("1. No internet connection")
      console.log("2. DNS resolution failed")
      console.log("3. Firewall blocking the connection")
    } else {
      console.error("🚨 Unexpected error:", error.message)
      if (error.code) {
        console.error("Error code:", error.code)
      }
    }
  }
}

main()
