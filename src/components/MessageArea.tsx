import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface MessageAreaProps {
  channelId: Id<"channels"> | null;
  searchQuery: string;
  isSearching: boolean;
}

export function MessageArea({ channelId, searchQuery, isSearching }: MessageAreaProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channel = useQuery(api.channels.get, channelId ? { channelId } : "skip");
  const messages = useQuery(api.messages.list, channelId ? { channelId } : "skip");
  const searchResults = useQuery(
    api.messages.search,
    isSearching && searchQuery.trim() 
      ? { query: searchQuery, channelId: channelId || undefined }
      : "skip"
  );
  const sendMessage = useMutation(api.messages.send);

  const displayMessages = isSearching ? searchResults : messages;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (!isSearching && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSearching]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !channelId) return;

    try {
      await sendMessage({
        channelId,
        content: newMessage.trim(),
      });
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  if (!channelId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Channel Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">#</span>
          <h2 className="font-semibold">{channel?.name}</h2>
          {isSearching && (
            <span className="text-sm text-gray-500">
              - Search results for "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages?.map((message) => (
          <div key={message._id} className="flex gap-3">
            <div className="flex-shrink-0">
              {message.author.avatarUrl ? (
                <img
                  src={message.author.avatarUrl}
                  alt={message.author.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {message.author.name[0]?.toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-medium text-sm">{message.author.name}</span>
                <span className="text-xs text-gray-500">
                  {new Date(message._creationTime).toLocaleTimeString()}
                </span>
                {isSearching && "channel" in message && (
                  <span className="text-xs text-gray-500">
                    in #{String(message.channel)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-900 break-words">{message.content}</p>
            </div>
          </div>
        ))}
        {!isSearching && <div ref={messagesEndRef} />}
      </div>

      {/* Message Input */}
      {!isSearching && (
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message #${channel?.name}`}
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
