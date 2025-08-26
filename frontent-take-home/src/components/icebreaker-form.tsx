"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { AlertCircle, Send, User, Target, Copy, CheckCircle } from "lucide-react"
import { apiService } from "../lib/api"

interface FormData {
  senderUrl: string
  receiverUrl: string
  problem: string
  proposal: string
  writingStyle: string
}

interface FormErrors {
  senderUrl?: string
  receiverUrl?: string
  proposal?: string
}

const writingStyles = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "direct", label: "Direct & Concise" },
  { value: "consultative", label: "Consultative" },
  { value: "enthusiastic", label: "Enthusiastic" },
]

export default function IcebreakerForm() {
  const [formData, setFormData] = useState<FormData>({
    senderUrl: "",
    receiverUrl: "",
    problem: "",
    proposal: "",
    writingStyle: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [generatedMessages, setGeneratedMessages] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const validateLinkedInUrl = (url: string): boolean => {
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    return linkedinRegex.test(url)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate sender URL
    if (!formData.senderUrl.trim()) {
      newErrors.senderUrl = "Sender LinkedIn URL is required"
    } else if (!validateLinkedInUrl(formData.senderUrl)) {
      newErrors.senderUrl = "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)"
    }

    // Validate receiver URL
    if (!formData.receiverUrl.trim()) {
      newErrors.receiverUrl = "Receiver LinkedIn URL is required"
    } else if (!validateLinkedInUrl(formData.receiverUrl)) {
      newErrors.receiverUrl = "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)"
    }

    // Validate proposal
    if (!formData.proposal.trim()) {
      newErrors.proposal = "Proposal, solution, or objective is required"
    } else if (formData.proposal.trim().length < 10) {
      newErrors.proposal = "Please provide a more detailed proposal (at least 10 characters)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await apiService.generateIcebreaker(formData);
      setGeneratedMessages(response.messages);
    } catch (error) {
      console.error("Error generating icebreaker:", error);
      
      if (error instanceof Error) {
        alert(error.message); 
      } else {
        alert("Failed to generate icebreaker message. Please try again.");
      }
  
      setGeneratedMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (message: string, index: number) => {
    try {
      await navigator.clipboard.writeText(message)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="bg-white border-slate-200 shadow-lg rounded-xl">
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl font-sans text-slate-800 flex items-center gap-2 font-bold">
            <Send className="h-6 w-6 text-blue-600" />
            Generate Your Icebreaker Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* LinkedIn URLs Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="senderUrl" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Your LinkedIn Profile URL *
                </Label>
                <Input
                  id="senderUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={formData.senderUrl}
                  onChange={(e) => handleInputChange("senderUrl", e.target.value)}
                  className={`bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg ${errors.senderUrl ? "border-red-300" : ""}`}
                />
                {errors.senderUrl && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.senderUrl}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiverUrl" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Recipient's LinkedIn Profile URL *
                </Label>
                <Input
                  id="receiverUrl"
                  type="url"
                  placeholder="https://linkedin.com/in/recipient-profile"
                  value={formData.receiverUrl}
                  onChange={(e) => handleInputChange("receiverUrl", e.target.value)}
                  className={`bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg ${errors.receiverUrl ? "border-red-300" : ""}`}
                />
                {errors.receiverUrl && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.receiverUrl}
                  </div>
                )}
              </div>
            </div>

            {/* Problem Section */}
            <div className="space-y-2">
              <Label htmlFor="problem" className="text-sm font-semibold text-slate-700">
                Problem to be Solved (Optional)
              </Label>
              <Textarea
                id="problem"
                placeholder="Describe the challenge or pain point you can help address..."
                value={formData.problem}
                onChange={(e) => handleInputChange("problem", e.target.value)}
                className="bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg min-h-[100px] resize-none"
                rows={4}
              />
              <p className="text-xs text-slate-500">
                Identifying a specific problem helps create more targeted and relevant messages.
              </p>
            </div>

            {/* Proposal Section */}
            <div className="space-y-2">
              <Label htmlFor="proposal" className="text-sm font-semibold text-slate-700">
                Proposal, Solution, or Objective *
              </Label>
              <Textarea
                id="proposal"
                placeholder="Describe your solution, what you're offering, or your networking objective..."
                value={formData.proposal}
                onChange={(e) => handleInputChange("proposal", e.target.value)}
                className={`bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg min-h-[120px] resize-none ${errors.proposal ? "border-red-300" : ""}`}
                rows={5}
              />
              {errors.proposal && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.proposal}
                </div>
              )}
              <p className="text-xs text-slate-500">
                Be specific about what you're offering or hoping to achieve through this connection.
              </p>
            </div>

            {/* Writing Style Section */}
            <div className="space-y-2">
              <Label htmlFor="writingStyle" className="text-sm font-semibold text-slate-700">
                Writing Style (Optional)
              </Label>
              <Select value={formData.writingStyle} onValueChange={(value) => handleInputChange("writingStyle", value)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg">
                  <SelectValue placeholder="Choose a writing style..." />
                </SelectTrigger>
                <SelectContent>
                  {writingStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Select a tone that matches your personality and the context of your outreach (or let us infer your
                writing style from your posts).
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Generating Message...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Generate Icebreaker Messages
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {generatedMessages.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-sans font-bold text-slate-800 mb-2">Your Icebreaker Messages</h2>
            <p className="text-slate-600">Choose the message that best fits your style and customize as needed</p>
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {generatedMessages.map((message, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-blue-50 to-slate-50 border-slate-200 shadow-md rounded-xl hover:shadow-lg transition-shadow duration-200"
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-sans font-semibold text-slate-800 flex items-center justify-between">
                    <span>Option {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyMessage(message, index)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 rounded-lg"
                    >
                      {copiedIndex === index ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 text-blue-600" />
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 leading-relaxed text-sm">{message}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <Button
                      onClick={() => handleCopyMessage(message, index)}
                      variant="outline"
                      size="sm"
                      className="w-full bg-white hover:bg-blue-50 border-blue-200 text-blue-700 rounded-lg"
                    >
                      {copiedIndex === index ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Copied!
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Copy Message
                        </div>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
