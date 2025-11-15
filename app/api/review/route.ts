import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Token Bucket Algo for Rate Limiting 
//1.Define Bucket Type
type Bucket = {
    tokens: number 
    lastRefill: number
} 

//2. Token Bucket Storage & Constants 
const buckets: Record <string, Bucket> = {} 
const CAPACITY = 10 
const REFILL_RATE = 1

//3. Getting correct bucket 
function getBucket (ip: string): Bucket {
    if(!buckets[ip]){
        buckets[ip] = {tokens:CAPACITY, lastRefill: Date.now()}
    }
    return buckets[ip]
} 

//4. Function for allowing request 
function allowRequest(ip:string): boolean{
    const bucket = getBucket(ip)
    const curr_time = Date.now()
    const elapsed = (curr_time - bucket.lastRefill) / 1000 
    const refill = elapsed * REFILL_RATE 

    bucket.tokens = Math.min(CAPACITY, bucket.tokens + refill)
    bucket.lastRefill = curr_time 

    if (bucket.tokens >=1){
        bucket.tokens -= 1 
        return true
    } else{
        return false
    }
}

export async function POST(req: Request){
    try{
        const {text} = await req.json() 
        const genAI = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY
        })
        
        const result = await genAI.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: `
    You are a writing assistant.
    Analyze the following text and suggest 3 to 5 micro improvements.
    Each suggestion should be one sentence long, specific, and helpful.
    Return ONLY a valid JSON array of strings without the JSON markdown.
    Text: """${text}"""
    `, 
            config : {
                systemInstruction: 'You are a friendly, warm English teacher.'
            }
        })
        
        const output = result.text
        
        if (!output) {
            console.log("No output from Gemini")
            return NextResponse.json({
                error: "No response from AI"
            }, { status: 500 })
        }
        
        let suggestions;
        try {
            suggestions = JSON.parse(output)
        } catch (parseError) {
            return NextResponse.json({
                error: "Failed to parse AI response",
                rawOutput: output
            }, { status: 500 })
        }
        
        return NextResponse.json({
            suggestions,
            rawOutput: output 
        })
        
    } catch(err){
        console.error("Error in API route:", err)
        return NextResponse.json(
            {error: "Something went wrong", details: err instanceof Error ? err.message : String(err)}, 
            {status: 500}
        )
    }
}