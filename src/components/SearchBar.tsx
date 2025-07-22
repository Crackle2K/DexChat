import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onToggleSearch: () => void;
  isSearching: boolean;
}

export function SearchBar({ onSearch, onToggleSearch, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    if (query.trim()) {
      onToggleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    if (isSearching) {
      onToggleSearch();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search messages..."
          className="w-64 px-3 py-1 bg-purple-700 text-white placeholder-purple-300 rounded border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
          >
            ×
          </button>
        )}
      </div>
      {isSearching && (
        <button
          type="button"
          onClick={onToggleSearch}
          className="px-2 py-1 bg-purple-700 text-white rounded hover:bg-purple-600 transition-colors text-sm"
        >
          Back to chat
        </button>
      )}
    </form>
  );
}
