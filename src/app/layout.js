//import './styles/globals.css';

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <title>Healthcare Chatbot</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <header>
          <h1>Healthcare Chatbot</h1>
        </header>
        <main>
          <div className="container">
            {children}
          </div>
        </main>
        <footer>
          <p>&copy; 2024 Healthcare Chatbot. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
