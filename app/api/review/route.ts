import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request){
    try{
        const {text} = await req.json() 
        
        if (!text || text.trim() === "") {
            return NextResponse.json(
                {error: "Text is required"}, 
                {status: 400}
            )
        }
        
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
    `
        })
        
        const output = result.text
        
        // Check if output exists
        if (!output) {
            return NextResponse.json({
                error: "No response from AI"
            }, { status: 500 })
        }
        
        // Try to parse it as JSON
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