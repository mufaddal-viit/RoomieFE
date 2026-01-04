"use client";
import React, { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";

import { X } from "lucide-react";

interface DataItem {
  id?: string;
  value?: string;
  name: string;
}

interface SelectPillsProps {
  data: DataItem[];
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (selectedValues: string[]) => void;
  placeholder?: string;
  inputId?: string;
  emptyStateText?: string;
}

export const SelectPills: React.FC<SelectPillsProps> = ({
  data,
  defaultValue = [],
  value,
  onValueChange,
  placeholder = "Type to search...",
  inputId,
  emptyStateText = "No matches found.",
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedPills, setSelectedPills] = useState<string[]>(
    value ?? defaultValue
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const resolvedInputId = inputId ?? `pill-input-${generatedId}`;
  const listboxId = `${resolvedInputId}-listbox`;
  const focusInput = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  useEffect(() => {
    if (Array.isArray(value)) {
      setSelectedPills(value);
    }
  }, [value]);

  useEffect(() => {
    focusInput();
  }, []);

  const selectedValues = value ?? selectedPills;
  const normalizedQuery = inputValue.trim().toLowerCase();
  const availableItems = data.filter(
    (item) => !selectedValues.includes(item.name)
  );

  const filteredItems = availableItems.filter(
    (item) =>
      item.name.toLowerCase().includes(normalizedQuery)
  );
  const canOpen = availableItems.length > 0 || normalizedQuery.length > 0;

  const focusOption = (index: number) => {
    const optionNodes = listboxRef.current?.querySelectorAll<HTMLButtonElement>(
      'button[data-option="true"]'
    );
    const option = optionNodes?.[index];
    if (!option) {
      return;
    }
    option.focus();
    setHighlightedIndex(index);
    option.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  const updateSelected = (nextSelected: string[]) => {
    if (!value) {
      setSelectedPills(nextSelected);
    }
    if (onValueChange) {
      onValueChange(nextSelected);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);

    const nextQuery = newValue.trim().toLowerCase();
    setIsOpen(availableItems.length > 0 || nextQuery.length > 0);

    focusInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (filteredItems.length > 0) {
          if (!isOpen) {
            setIsOpen(true);
            requestAnimationFrame(() => focusOption(0));
            return;
          }
          focusOption(0);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleOptionKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (index < filteredItems.length - 1) {
          focusOption(index + 1);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) {
          focusOption(index - 1);
        } else {
          inputRef.current?.focus();
          setHighlightedIndex(-1);
        }
        break;
      case "Enter":
        e.preventDefault();
        handleItemSelect(filteredItems[index]);
        inputRef.current?.focus();
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.focus();
        break;
    }
  };

  const handleItemSelect = (item: DataItem) => {
    const newSelectedPills = [...selectedValues, item.name];
    updateSelected(newSelectedPills);
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    focusInput();
  };

  const handlePillRemove = (pillToRemove: string) => {
    const newSelectedPills = selectedValues.filter(
      (pill) => pill !== pillToRemove
    );
    updateSelected(newSelectedPills);
    focusInput();
  };

  const handleOpenChange = (open: boolean) => {
    // Only allow external close events (like clicking outside)
    if (!open) {
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div
        className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-muted/60 bg-muted/20 px-3 py-2 shadow-sm transition-colors focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20"
        onClick={focusInput}
      >
        {selectedValues.map((pill) => (
          <Badge
            key={pill}
            variant="outline"
            className="gap-1 rounded-full border-muted/60 bg-background/80 px-3 py-1 text-xs font-medium text-foreground shadow-sm"
          >
            {pill}
            <button
              type="button"
              onClick={() => handlePillRemove(pill)}
              aria-label={`Remove ${pill}`}
              className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <X size={12} />
            </button>
          </Badge>
        ))}
        <PopoverAnchor asChild>
          <Input
            ref={inputRef}
            id={resolvedInputId}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (canOpen) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            aria-controls={listboxId}
            aria-expanded={isOpen}
            aria-autocomplete="list"
            className="h-8 min-w-[160px] flex-1 border-0 bg-transparent px-1 py-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </PopoverAnchor>
      </div>

      <PopoverContent
        align="start"
        className="w-[min(360px,calc(100vw-2rem))] p-2"
        onFocusOutside={(e) => {
          // Prevent closing if focus is in the input
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing if interaction is with the input
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
        }}
      >
        <div
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label="Pill options"
          className="max-h-56 overflow-y-auto p-1"
        >
          {filteredItems.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              {emptyStateText}
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <button
                key={item.id || item.value || item.name}
                type="button"
                data-option="true"
                role="option"
                aria-selected={highlightedIndex === index}
                onClick={() => handleItemSelect(item)}
                onMouseEnter={() => setHighlightedIndex(index)}
                onFocus={() => setHighlightedIndex(index)}
                onKeyDown={(e) => handleOptionKeyDown(e, index)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-accent/60 focus-visible:bg-accent/60 focus-visible:outline-none",
                  highlightedIndex === index && "bg-accent/70"
                )}
              >
                <span className="truncate">{item.name}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
