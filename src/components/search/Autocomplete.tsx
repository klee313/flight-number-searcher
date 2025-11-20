import { useState, useEffect, useRef } from 'react';
import { AIRPORTS } from '../../data/airports';
import { AIRLINES } from '../../data/airlines';

interface AutocompleteProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'airport' | 'airline';
    placeholder?: string;
}

export default function Autocomplete({ label, value, onChange, type = 'airport', placeholder }: AutocompleteProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Array<{ code: string; name?: string; city?: string; cityEn?: string; airport?: string }>>([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initialize query from value prop if it matches a code
    useEffect(() => {
        if (value && !query) {
            setQuery(value);
        } else if (!value && query) {
            if (value === '') setQuery('');
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (text: string) => {
        setQuery(text);
        onChange(text);

        if (text.length < 1) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const q = text.toUpperCase();
        let results = [];

        if (type === 'airport') {
            results = AIRPORTS.filter(a =>
                a.code.includes(q) ||
                a.city.toUpperCase().includes(q) ||
                a.cityEn.toUpperCase().includes(q) ||
                a.airport.includes(text)
            ).slice(0, 10);
        } else {
            results = AIRLINES.filter(a =>
                a.code.includes(q) ||
                a.name.toUpperCase().includes(q)
            ).slice(0, 10);
        }

        setSuggestions(results);
        setIsOpen(results.length > 0);
    };

    const handleSelect = (item: { code: string }) => {
        const code = item.code;
        setQuery(code);
        onChange(code);
        setIsOpen(false);
    };

    return (
        <div className="autocomplete-wrapper" ref={wrapperRef}>
            {label && <label>{label}</label>}
            <input
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => query && suggestions.length > 0 && setIsOpen(true)}
                placeholder={placeholder}
                autoComplete="off"
            />
            {isOpen && (
                <div className="autocomplete-list">
                    {suggestions.map((item, idx) => (
                        <div key={idx} className="item" onClick={() => handleSelect(item)}>
                            <span className="code">{item.code}</span>
                            <span className="name">
                                {type === 'airport'
                                    ? `${item.cityEn} (${item.city}) - ${item.airport}`
                                    : item.name
                                }
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
