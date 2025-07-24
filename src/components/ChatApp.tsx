import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ChannelSidebar } from "./ChannelSidebar";
import { MessageArea } from "./MessageArea";
import { ProfileModal } from "./ProfileModal";
import { SearchBar } from "./SearchBar";
import { SignOutButton } from "../SignOutButton";

export function ChatApp() {
  const [selectedChannelId, setSelectedChannelId] = useState<Id<"channels"> | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const channels = useQuery(api.channels.list);
  const profile = useQuery(api.profiles.get);

  // Auto-select first channel if none selected
  if (!selectedChannelId && channels && channels.length > 0) {
    setSelectedChannelId(channels[0]._id);
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="h-12 bg-purple-600 text-white flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">DexChat</h1>
          <SearchBar 
            onSearch={setSearchQuery} 
            onToggleSearch={() => setShowSearch(!showSearch)}
            isSearching={showSearch}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-3 py-1 rounded hover:bg-purple-700 transition-colors"
          >
            {profile?.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt="Profile" 
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center text-xs">
                {profile?.displayName?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <span className="text-sm">{profile?.displayName || "Set up profile"}</span>
          </button>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ChannelSidebar
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
        />
        <MessageArea
          channelId={selectedChannelId}
          searchQuery={showSearch ? searchQuery : ""}
          isSearching={showSearch}
        />
      </div>

      {/* Modals */}
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}
