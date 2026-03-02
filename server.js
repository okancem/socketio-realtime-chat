import "dotenv/config";
import express from "express";
import path from "path";
import http from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';

const app = express();
const httpServer = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const io = new Server(httpServer, {
    cors: {origin:"*"}
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });

    socket.on("join-room", (data) => {
        if (socket.rooms >= 2) {
            socket.leave(socket.rooms[1]);
        }

        socket.join(data.roomName);

        console.log(`${data.username} joined ${data.roomName}`);

        io.to(data.roomName).emit("receive-message", {
            username: "System",
            message: `${data.username} joined`
        });
    });

    socket.on("leave-room", (data) => {
        if (socket.rooms.has(data.roomName)) {
            socket.leave(data.roomName);
    
            console.log(`${data.username} leaved from ${data.roomName}`);
    
            io.to(data.roomName).emit("receive-message", {
                username: "System",
                message: `${data.username} left`
            });
        }
    });

    socket.on("send-message", (data) => {
        io.to(data.roomName).emit("receive-message", data);
    });

    socket.on("see-rooms", () => {
        console.log("List of rooms:", socket.rooms);
    });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

httpServer.listen(process.env.PORT, () => {
    console.log(`Server is running on: http://localhost:${process.env.PORT}`);
});