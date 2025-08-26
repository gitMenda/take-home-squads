// src/lib/api.ts
interface IcebreakerRequest {
    senderUrl: string
    receiverUrl: string
    problem: string
    proposal: string
    writingStyle: string
  }
  
  interface IcebreakerResponse {
    messages: string[]
    id: string
    createdAt: string
  }
  
  class ApiService {
    private baseUrl: string
  
    constructor() {
      this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
    }
  
    async generateIcebreaker(data: IcebreakerRequest): Promise<IcebreakerResponse> {
      const response = await fetch(`${this.baseUrl}/generate-icebreaker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
 
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }
  
      return response.json()
    }
  }
  
  export const apiService = new ApiService()