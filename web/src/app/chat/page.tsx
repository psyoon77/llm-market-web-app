"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";

type ChatItem = {
  role: "user" | "assistant";
  content: string;
};

type SessionInfo = {
  id: number;
  slot: number;
  createdAt: string;
};

const MAX_CHATS = 5;

export default function ChatPage() {
  const { data: session, status } = useSession();
  const loggedIn = status === "authenticated" && !!session?.user;

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [messagesBySession, setMessagesBySession] = useState<Record<string, ChatItem[]>>({});
  const [input, setInput] = useState("");
  const [sendingSessionKey, setSendingSessionKey] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [error, setError] = useState("");

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  useEffect(() => {
    if (!loggedIn) {
      setSessions([]);
      setCurrentSessionId(null);
      return;
    }

    fetch("/api/chat/sessions")
      .then((res) => res.json())
      .then((data: SessionInfo[]) => {
        setSessions(data);
        if (data.length > 0) {
          setCurrentSessionId(data[0].id);
        }
      })
      .catch(() => {});
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn || currentSessionId === null) return;

    const key = String(currentSessionId);
    if (messagesBySession[key]) return;

    fetch(`/api/chat/messages?sessionId=${currentSessionId}`)
      .then((res) => res.json())
      .then((data: ChatItem[]) => {
        setMessagesBySession((prev) => ({ ...prev, [key]: data }));
      })
      .catch(() => {});
  }, [loggedIn, currentSessionId, messagesBySession]);

  const currentSessionKey = currentSessionId !== null ? String(currentSessionId) : "guest";

  const currentMessages = useMemo(() => {
    return messagesBySession[currentSessionKey] || [];
  }, [messagesBySession, currentSessionKey]);

  const isSendingCurrentChat = sendingSessionKey === currentSessionKey;

  useEffect(() => {
    const nextCount = currentMessages.length;
    const previousCount = lastMessageCountRef.current;

    if (nextCount !== previousCount) {
      requestAnimationFrame(() => {
        const el = chatScrollRef.current;
        if (!el) return;
        el.scrollTo({
          top: el.scrollHeight,
          behavior: "auto",
        });
      });
    }

    lastMessageCountRef.current = nextCount;
  }, [currentMessages.length, currentSessionKey]);

  async function createNewChat() {
    if (!loggedIn || isCreatingChat || sessions.length >= MAX_CHATS) return;

    setIsCreatingChat(true);
    setError("");

    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Could not create chat");
      }

      setSessions((prev) => [...prev, data].sort((a, b) => a.slot - b.slot));
      setCurrentSessionId(data.id);
      setMessagesBySession((prev) => ({ ...prev, [String(data.id)]: [] }));
    } catch (err: any) {
      setError(err?.message || "Could not create chat");
    } finally {
      setIsCreatingChat(false);
    }
  }

  async function deleteChat(chatId: number) {
    if (!loggedIn || sessions.length <= 1) return;

    setError("");

    try {
      const res = await fetch(`/api/chat/sessions/${chatId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Could not delete chat");
      }

      const nextSessions = sessions.filter((s) => s.id !== chatId);
      setSessions(nextSessions);

      setMessagesBySession((prev) => {
        const next = { ...prev };
        delete next[String(chatId)];
        return next;
      });

      if (currentSessionId === chatId) {
        setCurrentSessionId(nextSessions.length > 0 ? nextSessions[0].id : null);
      }
    } catch (err: any) {
      setError(err?.message || "Could not delete chat");
    }
  }

  async function sendMessage(e: FormEvent) {
    e.preventDefault();

    const prompt = input.trim();
    if (!prompt || sendingSessionKey !== null) return;

    setError("");

    const sessionKey = currentSessionId !== null ? String(currentSessionId) : "guest";
    const prevMessages = messagesBySession[sessionKey] || [];

    setSendingSessionKey(sessionKey);

    setMessagesBySession((prev) => ({
      ...prev,
      [sessionKey]: [...prevMessages, { role: "user", content: prompt }],
    }));
    setInput("");

    requestAnimationFrame(() => {
      const el = chatScrollRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
      }
    });

    try {
      const body: any = { prompt };

      if (loggedIn && currentSessionId !== null) {
        body.sessionId = currentSessionId;
      } else {
        body.history = prevMessages.slice(-10);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Request failed");
      }

      const reply = data.reply || "(no response)";

      setMessagesBySession((prev) => ({
        ...prev,
        [sessionKey]: [
          ...prevMessages,
          { role: "user", content: prompt },
          { role: "assistant", content: reply },
        ],
      }));
    } catch (err: any) {
      setError(err?.message || "Chat failed");
      setMessagesBySession((prev) => ({
        ...prev,
        [sessionKey]: [
          ...prevMessages,
          { role: "user", content: prompt },
          {
            role: "assistant",
            content: "Something went wrong, but the question was still worth asking.",
          },
        ],
      }));
    } finally {
      setSendingSessionKey((current) => (current === sessionKey ? null : current));
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">Marketplace AI Chat Assistant</h1>

      {loggedIn ? (
        <p className="text-sm text-gray-600">
          User ID&apos;s Chat: trailing 20 messages are remembered, and your chat is saved for later.
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          Guest mode: trailing 10 messages are remembered for this session.
        </p>
      )}

      {loggedIn && sessions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={createNewChat}
              disabled={isCreatingChat || sessions.length >= MAX_CHATS}
              className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
            >
              + New Chat
            </button>

            <span className="text-xs text-gray-500">up to 5 chats</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                className={
                  currentSessionId === s.id
                    ? "flex items-center rounded bg-black text-white"
                    : "flex items-center rounded bg-gray-200 text-black"
                }
              >
                <button
                  type="button"
                  onClick={() => setCurrentSessionId(s.id)}
                  className="px-3 py-1"
                >
                  Chat {s.slot}
                </button>

                {sessions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteChat(s.id)}
                    className={
                      currentSessionId === s.id
                        ? "px-2 py-1 text-white/80 hover:text-white"
                        : "px-2 py-1 text-black/60 hover:text-black"
                    }
                    aria-label={`Delete Chat ${s.slot}`}
                    title={`Delete Chat ${s.slot}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        ref={chatScrollRef}
        className="border rounded-lg bg-white p-4 h-[28rem] overflow-y-auto space-y-3 shadow-sm"
      >
        {currentMessages.length === 0 ? (
          <p className="text-gray-500">What do you want to talk about?</p>
        ) : (
          currentMessages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
              <div
                className={
                  m.role === "user"
                    ? "inline-block max-w-[85%] rounded-lg px-3 py-2 bg-blue-100 text-blue-900"
                    : "inline-block max-w-[85%] rounded-lg px-3 py-2 bg-gray-100 text-gray-900"
                }
              >
                <div className="text-xs font-semibold mb-1">
                  {m.role === "user" ? "You" : "AI Assistant"}
                </div>
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              </div>
            </div>
          ))
        )}

        {isSendingCurrentChat && (
          <div className="text-left">
            <div className="inline-block max-w-[85%] rounded-lg px-3 py-2 bg-gray-100 text-gray-500">
              <div className="text-xs font-semibold mb-1">AI Assistant</div>
              <div>Thinking...</div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={sendMessage} className="mt-4 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts"
          autoComplete="off"
          autoCorrect="on"
          autoCapitalize="sentences"
          spellCheck={true}
        />
        <button
          type="submit"
          disabled={sendingSessionKey !== null || !input.trim()}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {isSendingCurrentChat ? "Sending..." : "Send"}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </main>
  );
}
