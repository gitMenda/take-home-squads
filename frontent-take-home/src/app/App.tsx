import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState<string>("Loading...");
  const [response, setResponse] = useState<string>("");

  // Fetch initial message on mount
  useEffect(() => {
    fetch("http://localhost:8080/api")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Error fetching data"));
  }, []);

  // Function to send a message to backend
  const sendMessage = async () => {
    try {
      const res = await fetch("http://localhost:8080/api", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "Hello from frontend!" }),
      });

      const data = await res.json();
      setResponse(data.reply);
    } catch (error) {
      setResponse("Error sending message");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Frontend (React + Vite)</h1>
      <p>Message from backend (GET): {message}</p>

      <button onClick={sendMessage} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        Send Message to Backend
      </button>

      {response && (
        <p style={{ marginTop: "1rem" }}>Response from backend (POST): {response}</p>
      )}
    </div>
  );
}

export default App;
