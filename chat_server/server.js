import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = http.createServer(app);

// Initialize Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow connections from this origin
    methods: ["GET", "POST"], // Allow these HTTP methods
  },
});

// Use environment variable for PORT or default to 3000
const PORT = process.env.PORT || 3000;

// Handle new socket connections
io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  // Handle room joining
  socket.on("join_room", (data) => {
    // Add the socket to the specified room
    socket.join(data.room);

    // Notify only users in the same room about the new user except the user himself
    socket.to(data.room).emit("room_joined", {
      data: data,
      socketId: socket.id,
      message: `${data.username} has joined the room`,
    });
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    console.log("send_message", data);
    // Send the message only to users in the same room
    io.to(data.room).emit("receive_message", data);
    console.log("receive_message", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

// Start the server and handle potential errors
server
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })
  .on("error", (err) => {
    console.error("Server failed to start:", err);
  });