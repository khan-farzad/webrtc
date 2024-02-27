import { Server } from "socket.io";

const io = new Server(8000, {
  cors: true,
});

io.on("connection", (socket) => {
  socket.on("join", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("joined", { userId: socket.id });
    console.log(socket.id, "joined the room:", roomId);
  });

  socket.on("call:initiated", ({ to, offer }) => {
    //tobefixedlater
    console.log(to);
    io.to(to).emit("call:received", { caller: socket.id, offer });
  });

  socket.on("call:answered", ({ ans, caller }) => {
    io.to(caller).emit('call:started', {ans, from: socket.id})
    // console.log(ans, "from pj");
  });

  socket.on("disconnect", () => {
    console.log(socket.id, "disconnected");
  });
});