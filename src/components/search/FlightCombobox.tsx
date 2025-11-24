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
            .map(code => allData.find(item => item.value === code))
            .filter((item): item is typeof allData[0] => !!item);

        const other = allData.filter(item => !recentCodes.includes(item.value));

        return { recentItems: recent, otherItems: other };
    }, [allData, recentCodes]);

    const selectedItem = allData.find((item) => item.value === value)

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
                <Command>
                    <CommandInput placeholder={`Search ${type}...`} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {recentItems.length > 0 && (
                            <CommandGroup heading="Recent">
                                {recentItems.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        value={item.search}
                                        onSelect={() => {
                                            onChange(item.value === value ? "" : item.value)
                                            setOpen(false)
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
                            {otherItems.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.search}
                                    onSelect={() => {
                                        onChange(item.value === value ? "" : item.value)
                                        setOpen(false)
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
