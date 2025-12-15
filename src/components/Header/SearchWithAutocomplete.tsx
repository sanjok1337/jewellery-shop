"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Suggestion {
  id: number;
  name: string;
  image_url?: string;
}

interface SearchWithAutocompleteProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
}

const SearchWithAutocomplete = ({ searchQuery, onSearchChange, onSearch }: SearchWithAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/products/search/suggestions?query=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const selected = suggestions[selectedIndex];
          window.location.href = `/products/${selected.id}`;
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = () => {
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative max-w-[333px] sm:min-w-[333px] w-full">
      {/* Divider */}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 inline-block w-px h-5.5 bg-gray-4"></span>
      
      <input
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        value={searchQuery}
        type="search"
        name="search"
        id="search"
        placeholder="Search for jewelry..."
        autoComplete="off"
        className="custom-search w-full rounded-r-[5px] bg-gray-1 !border-l-0 border border-gray-3 py-2.5 pl-4 pr-10 outline-none ease-in duration-200"
      />

      <button
        type="submit"
        id="search-btn"
        aria-label="Search"
        className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 hover:text-blue"
      >
        <svg
          className="fill-current"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.25 2.5C5.076 2.5 2.5 5.076 2.5 8.25C2.5 11.424 5.076 14 8.25 14C9.605 14 10.8475 13.5265 11.8265 12.7375L14.2945 15.2055C14.5845 15.4955 15.0545 15.4955 15.3445 15.2055C15.6345 14.9155 15.6345 14.4455 15.3445 14.1555L12.8765 11.6875C13.6015 10.7325 14.0005 9.54 14.0005 8.25C14.0005 5.076 11.4245 2.5 8.2505 2.5H8.25ZM4 8.25C4 5.903 5.903 4 8.25 4C10.597 4 12.5 5.903 12.5 8.25C12.5 10.597 10.597 12.5 8.25 12.5C5.903 12.5 4 10.597 4 8.25Z"
          />
        </svg>
      </button>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-3 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <Link
              key={suggestion.id}
              href={`/products/${suggestion.id}`}
              onClick={handleSuggestionClick}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-1 transition-colors border-b border-gray-2 last:border-b-0 ${
                index === selectedIndex ? 'bg-gray-1' : ''
              }`}
            >
              {suggestion.image_url && (
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={suggestion.image_url}
                    alt={suggestion.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <span className="text-sm text-dark-4 flex-1">{suggestion.name}</span>
              <svg
                className="w-4 h-4 text-gray-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchWithAutocomplete;
