'use client';

import { useState, useRef, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

type RecipientType = 'manual' | 'user' | 'mentor';

interface SearchResult {
    id: string;
    name: string;
    email: string;
}

interface RecipientSelectorProps {
    value: string;
    onChange: (email: string) => void;
    disabled?: boolean;
    onError: (message: string) => void;
}

export default function RecipientSelector({
    value,
    onChange,
    disabled = false,
    onError,
}: RecipientSelectorProps) {
    const [recipientType, setRecipientType] = useState<RecipientType>('manual');
    const [searchQuery, setSearchQuery] = useState('');
    const [displayValue, setDisplayValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [hasSelected, setHasSelected] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedQuery = useDebounce(searchQuery, 300);

    // Search when debounced query changes
    useEffect(() => {
        if (recipientType === 'manual') return;
        if (hasSelected) return; // Don't search if user just selected something
        if (!debouncedQuery.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        performSearch(debouncedQuery);
    }, [debouncedQuery, recipientType, hasSelected]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Reset when type changes
    useEffect(() => {
        setSearchQuery('');
        setDisplayValue('');
        setSearchResults([]);
        setShowDropdown(false);
        setSelectedIndex(-1);
        setHasSelected(false);
        onChange('');
    }, [recipientType]);

    const performSearch = async (query: string) => {
        setIsSearching(true);

        try {
            const endpoint = recipientType === 'user'
                ? '/api/admin/users/search'
                : '/api/admin/mentors/search';

            const response = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Search failed');
            }

            const data = await response.json();
            setSearchResults(data.results || []);
            setShowDropdown(true);
        } catch (error) {
            onError(error instanceof Error ? error.message : 'Search failed');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: SearchResult) => {
        onChange(result.email);
        setDisplayValue(`${result.name} (${result.email})`);
        setSearchQuery(''); // Clear search query to prevent re-searching
        setShowDropdown(false);
        setSelectedIndex(-1);
        setHasSelected(true);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (recipientType === 'manual') {
            onChange(newValue);
        } else {
            setSearchQuery(newValue);
            setDisplayValue(newValue);
            setHasSelected(false); // User is typing again, allow searching
            setShowDropdown(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showDropdown || searchResults.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSelectResult(searchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    return (
        <div className="space-y-4">
            {/* Recipient Type Selector */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipient Type
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setRecipientType('manual')}
                        disabled={disabled}
                        className={`
              flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
              ${recipientType === 'manual'
                                ? 'bg-gradient-to-r from-[#5693C1] to-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                    >
                        Manual Email
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecipientType('user')}
                        disabled={disabled}
                        className={`
              flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
              ${recipientType === 'user'
                                ? 'bg-gradient-to-r from-[#5693C1] to-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                    >
                        User
                    </button>
                    <button
                        type="button"
                        onClick={() => setRecipientType('mentor')}
                        disabled={disabled}
                        className={`
              flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
              ${recipientType === 'mentor'
                                ? 'bg-gradient-to-r from-[#5693C1] to-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
                    >
                        Mentor
                    </button>
                </div>
            </div>

            {/* Recipient Input */}
            <div>
                <label htmlFor="recipient" className="block text-sm font-semibold text-gray-700 mb-2">
                    {recipientType === 'manual' ? 'Recipient Email' : `Search ${recipientType === 'user' ? 'User' : 'Mentor'}`}
                </label>

                <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            {recipientType === 'manual' ? (
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                        </div>

                        {isSearching && recipientType !== 'manual' && (
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <svg className="animate-spin h-5 w-5 text-[#5693C1]" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            </div>
                        )}

                        <input
                            ref={inputRef}
                            id="recipient"
                            type={recipientType === 'manual' ? 'email' : 'text'}
                            value={recipientType === 'manual' ? value : displayValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                if (recipientType !== 'manual' && searchResults.length > 0 && !hasSelected) {
                                    setShowDropdown(true);
                                }
                            }}
                            placeholder={
                                recipientType === 'manual'
                                    ? 'user@example.com'
                                    : `Type to search ${recipientType === 'user' ? 'users' : 'mentors'}...`
                            }
                            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5693C1] focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                            disabled={disabled}
                        />
                    </div>

                    {/* Search Dropdown */}
                    {recipientType !== 'manual' && showDropdown && !hasSelected && (
                        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                            {isSearching ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <svg className="animate-spin h-6 w-6 mx-auto mb-2 text-[#5693C1]" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <p className="text-sm">Searching...</p>
                                </div>
                            ) : searchResults.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-500">
                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-700">No results found</p>
                                    <p className="text-xs mt-1 text-gray-500">Try a different search term</p>
                                </div>
                            ) : (
                                <ul className="py-2">
                                    {searchResults.map((result, index) => (
                                        <li key={result.id}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectResult(result)}
                                                className={`
                          w-full px-4 py-3 text-left hover:bg-[#5693C1]/10 transition-colors
                          ${index === selectedIndex ? 'bg-[#5693C1]/10' : ''}
                        `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#5693C1] to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                                        {result.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {result.name}
                                                        </p>
                                                        <p className="text-xs text-gray-600 truncate">
                                                            {result.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                {recipientType !== 'manual' && (
                    <p className="mt-2 text-xs text-gray-500">
                        Search by name or email address
                    </p>
                )}
            </div>
        </div>
    );
}
