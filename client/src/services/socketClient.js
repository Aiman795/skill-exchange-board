import { io } from "socket.io-client";

export const connectSocket = (token) => {
  return io("https://skill-exchange-board-production.up.railway.app", {
    auth: { token },
  });
};
