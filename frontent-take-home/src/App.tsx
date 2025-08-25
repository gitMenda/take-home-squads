import IcebreakerForm from "./components/icebreaker-form"

function App() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-sans text-blue-700 mb-4 font-bold">LinkedIn Icebreaker Generator</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Create personalized, professional icebreaker messages that get responses. Build meaningful connections with
            prospects and expand your network.
          </p>
        </div>
        <IcebreakerForm />
      </div>
    </main>
  )
}

export default App
