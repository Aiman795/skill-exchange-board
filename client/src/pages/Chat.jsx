import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../services/api";
import "./Chat.css";

const parseUserIdFromToken = (token) => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userId || decoded.id || null;
  } catch (error) {
    return null;
  }
};

const buildRoomId = (otherUserId, listingId) => {
  const base = listingId ? `chat-${listingId}` : "chat";
  return `${base}-${[otherUserId, "self"].sort().join("-")}`;
};

export default function Chat() {
  const { otherUserId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const listingId = searchParams.get("listing");
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const currentUserId = useMemo(() => parseUserIdFromToken(localStorage.getItem("token")), []);

  useEffect(() => {
    if (!otherUserId) {
      navigate("/my-matches");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/chat/${otherUserId}/messages${listingId ? `?listingId=${listingId}` : ""}`
        );

        setMessages(response.data?.messages || []);
      } catch (err) {
        setError(err.message || "Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const socket = io("http://localhost:5000", {
      auth: { token },
    });

    socket.on("connect", () => {
      const roomId = buildRoomId(otherUserId, listingId);
      socket.emit("join_room", { roomId });
    });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message_error", (data) => {
      setError(data?.message || "Unable to send message");
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [listingId, navigate, otherUserId]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      return;
    }

    if (!socketRef.current) {
      setError("Socket connection is not ready yet");
      return;
    }

    const roomId = buildRoomId(otherUserId, listingId);
    socketRef.current.emit("send_message", {
      roomId,
      receiverId: otherUserId,
      listingId,
      content: messageInput.trim(),
    });

    setMessageInput("");
  };

  return (
    <div className="chat-page">
      <div className="chat-card">
        <div className="chat-header">
          <button className="back-btn" onClick={() => navigate("/my-matches")}>
            ← Back
          </button>
          <div>
            <h2>Chat</h2>
            <p>Direct conversation</p>
          </div>
        </div>

        {error && <div className="chat-error">{error}</div>}

        {loading ? (
          <div className="chat-loading">Loading messages...</div>
        ) : (
          <div className="chat-history">
            {messages.length === 0 ? (
              <div className="chat-empty">No messages yet. Start the conversation.</div>
            ) : (
              messages.map((message) => {
                const sender = message.senderId;
                const isMine = sender?._id === currentUserId;

                return (
                  <div
                    key={message._id}
                    className={`chat-message ${isMine ? "mine" : "theirs"}`}
                  >
                    <div className="chat-message-bubble">
                      <p>{message.content}</p>
                      <span>
                        {new Date(message.timestamp || Date.now()).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <form className="chat-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message"
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
