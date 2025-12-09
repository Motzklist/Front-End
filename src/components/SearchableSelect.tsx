'use client';

import {useState, useEffect} from 'react';

export interface SelectItem {
    id: string | number;
    name: string;

    [key: string]: any;
}

interface SearchableSelectProps {
    label: string;
    items: SelectItem[];
    placeholder?: string;
    onSelect: (item: SelectItem) => void;
    disabled?: boolean;
}

export default function SearchableSelect({
                                             label,
                                             items,
                                             placeholder = 'Search...',
                                             onSelect,
                                             disabled = false
                                         }: SearchableSelectProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SelectItem | null>(null);

    // Reset when parent selection changes
    useEffect(() => {
        setQuery('');
        setSelectedItem(null);
    }, [items]);

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
    );

    const handleSelect = (item: SelectItem) => {
        setSelectedItem(item);
        setQuery(item.name);
        setIsOpen(false);
        onSelect(item);
    };

    return (
        <div className={`relative w-full mb-4 font-sans ${disabled ? 'opacity-50' : ''}`}>
            <label className="block mb-1 text-sm font-bold text-gray-700 dark:text-gray-300">
                {label}
            </label>

            <input
                type="text"
                disabled={disabled}
                className="w-full px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:disabled:bg-zinc-900"
                placeholder={selectedItem ? selectedItem.name : placeholder}
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => !disabled && setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)} // TODO: Replace magic number
            />

            {isOpen && !disabled && filteredItems.length > 0 && (
                <ul className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border rounded shadow-lg max-h-60 dark:bg-zinc-800 dark:border-zinc-700">
                    {filteredItems.map((item) => (
                        <li
                            key={item.id}
                            onMouseDown={() => handleSelect(item)}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-gray-800 dark:text-gray-200 dark:hover:bg-blue-900"
                        >
                            {item.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

