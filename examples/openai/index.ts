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
    
    if (error.status === 402) {
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
    } else {
      console.error("🚨 Unexpected error:", error.message)
    }
  }
}

main()
