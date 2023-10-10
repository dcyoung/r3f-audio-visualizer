import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { useSearchFiltersContextSetters } from "@/context/searchFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export const SearchFilterInput = ({
  placeholder = "Search...",
  ...props
}: Omit<
  React.HTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "placeholder"
> & { placeholder?: string }) => {
  const [queryFilter, setQueryFilter] = useState("");
  const debouncedQueryFilter = useDebounce(queryFilter, 500);
  const { setQuery } = useSearchFiltersContextSetters();

  useEffect(() => {
    setQuery(debouncedQueryFilter);
  }, [debouncedQueryFilter, setQuery]);

  return (
    <div className="flex flex-row items-center justify-start gap-2 rounded-[6px] border-[#4E4E4E] bg-background px-2">
      <Search />
      <input
        id="search-filter-input"
        type="search"
        placeholder={placeholder}
        onChange={(e) => {
          setQueryFilter(e.target.value);
        }}
        className={cn(
          "placeholder:text-muted-foreground search-cancel:appearance-none search-cancel:cursor-pointer flex-grow bg-transparent text-sm text-foreground outline-none placeholder:text-xs disabled:cursor-not-allowed disabled:opacity-50",
          props.className
        )}
      />
    </div>
  );
};
