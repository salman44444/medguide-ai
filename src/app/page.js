"use client"; // Ensure this is a Client Component

import { useState } from 'react';
import "./styles/globals.css"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isChatboxOpen, setIsChatboxOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    setIsLoggedIn(true); // Implement actual login logic here
  };

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { text: input, type: 'user' }]);
    setInput("");

    // Simulate a response from AI
    setTimeout(() => {
      setMessages([...messages, { text: input, type: 'user' }, { text: "This is a simulated response.", type: 'ai' }]);
    }, 1000);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-section">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">Username:</label>
          <input type="text" id="username" name="username" placeholder="Enter your username" required />

          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" placeholder="Enter your password" required />

          <button type="submit">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <nav>
        <a href="#welcome">Welcome</a>
        <a href="#about">About Us</a>
        <a href="#health-tips">Health Tips</a>
        <a href="#appointment">Book Appointment</a>
      </nav>

      <section id="welcome" className="section section-small">
        <h2>Chat with MedguideAI</h2>
        <p>Hi there! We’re here to help you with your health concerns. Feel free to ask questions or book an appointment.</p>
        <button onClick={() => setIsChatboxOpen(!isChatboxOpen)}>
          {isChatboxOpen ? 'Close Chatbox' : 'Open Chatbox'}
        </button>
      </section>

      

      {isChatboxOpen && (
        <section className="section chatbox">
          <div className="chatbox-header">Chat with our AI Assistant</div>
          <div className="chatbox-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbox-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSend();
                }
              }}
              placeholder="Type your message here..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </section>
      )}
      <section id="about" className="section section-small">
        <h2>About Us</h2>
        <p>We provide AI-powered healthcare support to help you make informed decisions and manage your health effectively.</p>
      </section>

      <section id="health-tips" className="section section-small">
        <h2>Health Tips</h2>
        <ul>
          <li> Stay hydrated by drinking at least 8 glasses of water daily.</li>
          <li> Engage in regular physical activity to maintain a healthy body.</li>
          <li> Eat a balanced diet with plenty of fruits and vegetables.</li>
          {/* Add more tips with icons */}
        </ul>
      </section>

      <section id="appointment" className="section section-medium">
        <h2>Book an Appointment</h2>
        <form>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" placeholder="Enter your name" required />

          <label htmlFor="date">Preferred Date:</label>
          <input type="date" id="date" name="date" required />

          <label htmlFor="time">Preferred Time:</label>
          <input type="time" id="time" name="time" required />

          <button type="submit">Book Appointment</button>
        </form>
      </section>
    </div>
  );
}

