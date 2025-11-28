import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { AIRLINES } from "../../data/airlines"
import { AIRPORTS } from "../../data/airports"

import { useRecentSearchStore } from "@/stores/useRecentSearchStore"

interface FlightComboboxProps {
    value: string
    onChange: (value: string) => void
    type: "airline" | "airport"
    placeholder?: string
    className?: string
}

export function FlightCombobox({ value, onChange, type, placeholder, className }: FlightComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const { recentAirlines, recentAirports } = useRecentSearchStore()

    // Filter data based on type
    const allData = React.useMemo(() => {
        if (type === "airline") {
            return AIRLINES.map(a => ({
                value: a.code,
                label: `${a.code} - ${a.name}`,
                search: `${a.code} ${a.name}`
            }))
        } else {
            return AIRPORTS.map(a => ({
                value: a.code,
                label: `${a.code} - ${a.cityEn} (${a.city})`,
                search: `${a.code} ${a.cityEn} ${a.city} ${a.airport}`
            }))
        }
    }, [type])

    const recentCodes = type === "airline" ? recentAirlines : recentAirports;

    const { recentItems, otherItems } = React.useMemo(() => {
        const recent = recentCodes
            .map(code => {
                const found = allData.find(item => item.value === code);
                // If not found in predefined list, create a custom item
                return found || {
                    value: code,
                    label: `${code} (Custom)`,
                    search: code
                };
            });

        const other = allData.filter(item => !recentCodes.includes(item.value));

        return { recentItems: recent, otherItems: other };
    }, [allData, recentCodes]);

    const selectedItem = allData.find((item) => item.value === value) || (value ? { label: value, value } : null)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {selectedItem ? selectedItem.label : placeholder || "Select..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={`Search ${type}...`}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {search && (
                                <div
                                    className="px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                                    onClick={() => {
                                        onChange(search.toUpperCase())
                                        setOpen(false)
                                        setSearch("")
                                    }}
                                >
                                    Use "{search.toUpperCase()}"
                                </div>
                            )}
                            {!search && "No results found."}
                        </CommandEmpty>

                        {/* Custom Option when searching */}
                        {search && !allData.some(item => item.value === search.toUpperCase()) && (
                            <CommandGroup heading="Custom">
                                <CommandItem
                                    value={search.toUpperCase()}
                                    onSelect={() => {
                                        onChange(search.toUpperCase())
                                        setOpen(false)
                                        setSearch("")
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === search.toUpperCase() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    Use "{search.toUpperCase()}"
                                </CommandItem>
                            </CommandGroup>
                        )}

                        {recentItems.length > 0 && (
                            <CommandGroup heading="Recent">
                                {recentItems
                                    .filter(item => !search || item.search.toLowerCase().includes(search.toLowerCase()))
                                    .map((item) => (
                                        <CommandItem
                                            key={item.value}
                                            value={item.search}
                                            onSelect={() => {
                                                onChange(item.value === value ? "" : item.value)
                                                setOpen(false)
                                                setSearch("")
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === item.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {item.label}
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        )}
                        <CommandGroup heading="All">
                            {otherItems
                                .filter(item => !search || item.search.toLowerCase().includes(search.toLowerCase()))
                                .map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.search}
                                        onSelect={() => {
                                            onChange(item.value === value ? "" : item.value)
                                            setOpen(false)
                                            setSearch("")
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === item.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {item.label}
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
