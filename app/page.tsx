"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card" 
import Typewriter from "typewriter-effect"

export default function WritingImproverPage() {
  const [text, setText] = useState("")
  const [wordCount, setWordCount] = useState(0) 
  const [charCountNoSpaces, setCharCountNoSpaces] = useState(0)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string[] | null>(null)

  const handleStartReview = async () => {
  setLoading(true)
  setFeedback(null) // Clear previous feedback
  
  try {
    const response = await fetch('/api/review', { // Adjust this path to match your API route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    })
    
    const data = await response.json()
      
    if (!response.ok) {
      console.error("API Error:", data)
      alert(`Error: ${data.error || 'Something went wrong'}`)
      setLoading(false)
      return
    }
    
    if (data.suggestions) {
      setFeedback(data.suggestions)
    }
    
  } catch (error) {
    console.error("Fetch error:", error)
    alert("Failed to connect to API")
  } finally {
    setLoading(false)
  }
} 

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>{
      const newText = event.target.value
      setText(newText)
      const wordCount = newText.trim() === "" ? 0: newText.trim().split(/\s+/).length
      setWordCount(wordCount)
      const charCountNoSpaces = newText.replace(/\s+/g, '').length
      setCharCountNoSpaces(charCountNoSpaces)
    }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Writing Improver
          </h1>
          <h3 className="text-gray-600">
            <Typewriter 
              options={{
                strings: ["Enhance your writing with AI-powered suggestions!", "Improve clarity, grammar, and style effortlessly!", "Powered by Gemini"],
                autoStart: true,
                loop: true,
                delay: 100,
              }} 
            />
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <Card className="flex-1 p-6 shadow-sm border-gray-200">
              <div className="mb-4">
                <label htmlFor="writing-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Writing
                </label>
                <textarea
                  id="writing-input"
                  value={text}
                  onChange={handleTextChange}
                  placeholder="Paste your essay, paragraph, or notes here..."
                  className="w-full h-64 p-4 border border-gray-200 rounded-lg font-sans text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                /> 
                <div className="text-sm mt-2 text-gray-600">
                  {wordCount} {wordCount === 1 ? "Word" : "Words"} • {text.length} {text.length === 1 ? "Character" : "Characters"} • {charCountNoSpaces} {charCountNoSpaces === 1 ? "Character (no spaces)" : "Characters (no spaces)"}
                </div>
              </div>

              <Button
                onClick={handleStartReview}
                disabled={!text.trim() || loading}
                className="w-full bg-[#007BFF] hover:bg-[#006AE6] text-white font-medium py-3 px-6 rounded-lg transform transition duration-300 hover:scale-105 hover:shadow-xl"
              >
                {loading ? "Analyzing..." : "Start Review"}
              </Button>
            </Card>
          </div>

          <div className="flex flex-col">
            <Card className="flex-1 p-6 shadow-sm border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Improvement Suggestions</h2>

              {!feedback && !loading && (
                <div className="text-center py-12">
                  <p className="text-gray-500">Enter text and click "Start Review" to get suggestions</p>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {feedback && (
                <ul className="space-y-3">
                  {feedback.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700 leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
