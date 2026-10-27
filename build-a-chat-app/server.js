import http from "http";
import fs from "fs";
import { WebSocketServer } from "ws";

const PORT = 3001;

// 1. Create the HTTP server
const server = http.createServer((req, res) => {
  const filePath =
    req.url === "/script.js"
      ? "./public/script.js"
      : "./public/index.html";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Internal Server Error");
      return;
    }

    const contentType =
      req.url === "/script.js"
        ? "application/javascript"
        : "text/html";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

// 2. Create the WebSocket server
const wss = new WebSocketServer({ server });

// 3. Handle new WebSocket connections
wss.on("connection", (socket, req) => {

  // 4. Get username from URL
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username"
  );

  // Notify everyone when a user joins
  const joinMessage = JSON.stringify({
    type: "system",
    text: `${username} joined`
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(joinMessage);
    }
  });

  // 5. Handle incoming chat messages
  socket.on("message", (data) => {
    const { username, text } = JSON.parse(data.toString());

    const chatMessage = JSON.stringify({
      type: "chat",
      username,
      text
    });

    // Broadcast to all clients, including sender
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(chatMessage);
      }
    });
  });

  // 6. Notify everyone when a user leaves
  socket.on("close", () => {
    const leaveMessage = JSON.stringify({
      type: "system",
      text: `${username} left`
    });

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(leaveMessage);
      }
    });
  });
});

// 7. Start the server
server.listen(PORT, () => {
  console.log("Chat server running at http://localhost:3001");
});