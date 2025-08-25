"use client"

import type React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { AlertCircle, Send, User, Target } from "lucide-react"
import { apiService } from "@/lib/api"

interface FormData {
  senderUrl: string
  receiverUrl: string
  problem: string
  proposal: string
  writingStyle: string
}

interface ApiResponse {
  message: string
  id: string
  createdAt: string
}

const writingStyles = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual & Friendly" },
  { value: "direct", label: "Direct & Concise" },
  { value: "consultative", label: "Consultative" },
  { value: "enthusiastic", label: "Enthusiastic" },
]

export default function IcebreakerForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset
  } = useForm<FormData>({
    defaultValues: {
      senderUrl: "",
      receiverUrl: "",
      problem: "",
      proposal: "",
      writingStyle: "",
    }
  })

  const validateLinkedInUrl = (url: string): boolean | string => {
    if (!url.trim()) return "LinkedIn URL is required"
    const linkedinRegex = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    return linkedinRegex.test(url) || "Please enter a valid LinkedIn profile URL (e.g., https://linkedin.com/in/username)"
  }

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setSubmitMessage(null)

    try {
      const result = await apiService.generateIcebreaker(data)
      setSubmitMessage('Icebreaker message generated successfully!')
      console.log('Generated icebreaker:', result)
    } catch (error) {
      console.error('Error generating icebreaker:', error)
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to generate icebreaker message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Watch the writing style value for the Select component
  const writingStyleValue = watch("writingStyle")

  return (
    <Card className="bg-white border-slate-200 shadow-lg rounded-xl">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-sans text-slate-800 flex items-center gap-2 font-bold">
          <Send className="h-6 w-6 text-blue-600" />
          Generate Your Icebreaker Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                {...register("senderUrl", {
                  validate: validateLinkedInUrl
                })}
                className={`bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg ${
                  errors.senderUrl ? "border-red-300" : ""
                }`}
              />
              {errors.senderUrl && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.senderUrl.message}
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
                {...register("receiverUrl", {
                  validate: validateLinkedInUrl
                })}
                className={`bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg ${
                  errors.receiverUrl ? "border-red-300" : ""
                }`}
              />
              {errors.receiverUrl && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.receiverUrl.message}
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
              {...register("problem")}
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
              {...register("proposal", {
                required: "Proposal, solution, or objective is required",
                minLength: {
                  value: 10,
                  message: "Please provide a more detailed proposal (at least 10 characters)"
                }
              })}
              className={`bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-lg min-h-[120px] resize-none ${
                errors.proposal ? "border-red-300" : ""
              }`}
              rows={5}
            />
            {errors.proposal && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.proposal.message}
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
            <Select 
              value={writingStyleValue} 
              onValueChange={(value) => setValue("writingStyle", value)}
            >
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
              Select a tone that matches your personality and the context of your outreach (or let us infer your writing
              style from your posts).
            </p>
          </div>

          {/* Success/Error Message */}
          {submitMessage && (
            <div className={`p-4 rounded-lg border ${
              submitMessage.includes('successfully') 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {submitMessage}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}