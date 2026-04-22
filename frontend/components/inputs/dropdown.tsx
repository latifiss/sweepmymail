'use client';

import { useState, useRef, useEffect } from "react";

type Option = {
  id: string | number;
  label: string;
};

type SelectDropdownProps = {
  options: Option[];
  placeholder?: string;
  onChange?: (value: Option) => void;
  value?: Option | null;
};

export function SelectDropdown({
  options,
  placeholder = "Select...",
  onChange,
  value: externalValue = null,
}: SelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(externalValue);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with external value changes
  useEffect(() => {
    setSelected(externalValue);
  }, [externalValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setSelected(option); // Update internal state
    onChange?.(option); // Notify parent
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="form__dropdown">
      <button
        onClick={() => setOpen(!open)}
        className="form__dropdown__button"
      >
        <span className="form__dropdown__button__text">{selected?.label || placeholder}</span>
        <svg
          className={`form__dropdown__button__icon ${open ? "form__dropdown__button__icon--open" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="form__dropdown__menu">
          {options.map((option) => {
            const isActive = selected?.id === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`form__dropdown__option ${isActive ? "form__dropdown__option--active" : ""}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
