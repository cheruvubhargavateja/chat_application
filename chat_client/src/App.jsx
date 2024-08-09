import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io.connect("http://localhost:3000");
function App() {
  // State variables
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomJoined, setRoomJoined] = useState(false);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Function to send a message
  const sendMessage = () => {
    socket.emit("send_message", { message, room, username });
    setMessage("");
  };

  // Function to join a room
  const joinRoom = () => {
    socket.emit("join_room", { room, username });
    setRoomJoined(true);
  };

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsScrolledToBottom(true);
  };

  // Function to handle scroll events
  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setIsScrolledToBottom(scrollHeight - scrollTop === clientHeight);
    }
  };

  // Effect to handle receiving messages
  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log("receive_message", data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup function to remove the event listener
    return () => {
      socket.off("receive_message");
    };
  }, [socket]);

  // Effect to scroll to bottom when new messages are added
  useEffect(() => {
    if (isScrolledToBottom) {
      scrollToBottom();
    }
  }, [messages]);

  return (
    <div
      style={{
        width: "600px",
        height: "600px",
        margin: "0 auto",
        backgroundColor: "#f0f0f0",
        boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Scenario 1: User hasn't joined a room yet */}
      {!roomJoined ? (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#4a90e2",
            color: "white",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Room"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              fontSize: "16px",
            }}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: "5px",
              border: "none",
              fontSize: "16px",
            }}
          />
          <button
            onClick={joinRoom}
            style={{
              padding: "10px",
              backgroundColor: "#2c3e50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Join Room
          </button>
        </div>
      ) : (
        /* Scenario 2: User has joined a room */
        <>
          {/* Room information header */}
          <div
            style={{
              padding: "10px",
              backgroundColor: "#4a90e2",
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Room: {room} | Username: {username}
          </div>
          {/* Chat messages container */}
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              position: "relative",
            }}
          >
            {/* Scenario 3: Displaying messages */}
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: message.username === username ? "gray" : "white",
                  alignSelf: message.username === username ? "flex-end" : "flex-start",
                  padding: "10px",
                  borderRadius: "10px",
                  maxWidth: "70%",
                  color: message.username === username ? "white" : "black",
                  marginLeft: message.username === username ? "auto" : "0",
                  marginRight: message.username === username ? "0" : "auto",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "5px" }}>{message.username}</div>
                <div style={{ fontSize: "14px" }}>{message.message}</div>
              </div>
            ))}
            <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
            {/* Scenario 4: Showing scroll to bottom button when not at bottom */}
            {!isScrolledToBottom && (
              <button
                onClick={scrollToBottom}
                style={{
                  position: "sticky",
                  bottom: "10px",
                  alignSelf: "center",
                  padding: "5px 10px",
                  backgroundColor: "#4a90e2",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "20px",
                }}
              >
                ↓
              </button>
            )}
          </div>
          {/* Message input and send button */}
          <div
            style={{
              display: "flex",
              padding: "10px",
              backgroundColor: "white",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <input
              style={{
                flex: 1,
                padding: "10px",
                border: "1px solid #e0e0e0",
                borderRadius: "20px",
                marginRight: "10px",
                fontSize: "16px",
              }}
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              style={{
                padding: "10px 20px",
                backgroundColor: "#4a90e2",
                color: "white",
                border: "none",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "16px",
              }}
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
