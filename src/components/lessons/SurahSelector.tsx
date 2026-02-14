import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SURAHS, type Surah } from "@/lib/quran-data";

interface SurahSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SurahSelector({
  value,
  onChange,
  placeholder = "Select surah...",
  disabled = false,
}: SurahSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedSurah = SURAHS.find((s) => s.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {selectedSurah ? (
            <span className="flex items-center gap-2 truncate">
              <span className="text-muted-foreground">
                {selectedSurah.number}.
              </span>
              <span>{selectedSurah.name}</span>
              <span className="text-muted-foreground font-arabic">
                {selectedSurah.arabicName}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search surah..." />
          <CommandList>
            <CommandEmpty>No surah found.</CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto">
              {SURAHS.map((surah) => (
                <CommandItem
                  key={surah.number}
                  value={`${surah.number} ${surah.name} ${surah.arabicName}`}
                  onSelect={() => {
                    onChange(surah.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === surah.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex items-center gap-2 w-full">
                    <span className="w-8 text-muted-foreground text-right">
                      {surah.number}.
                    </span>
                    <span className="flex-1">{surah.name}</span>
                    <span className="text-muted-foreground font-arabic">
                      {surah.arabicName}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
