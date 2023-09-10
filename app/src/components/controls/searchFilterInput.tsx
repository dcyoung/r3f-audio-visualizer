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
      <Search fill="#414141" />
      <input
        type="search"
        placeholder={placeholder}
        onChange={(e) => {
          setQueryFilter(e.target.value);
        }}
        className={cn(
          "placeholder:text-muted-foreground search-cancel:appearance-none search-cancel:cursor-pointer search-cancel:h-6 search-cancel:w-6 search-cancel:bg-[url('/search_cancel_white.svg')] hover:search-cancel:bg-[url('/search_cancel_green.svg')] flex-grow bg-transparent text-sm text-white outline-none placeholder:text-xs placeholder:text-[#949494] disabled:cursor-not-allowed disabled:opacity-50",
          props.className
        )}
      />
    </div>
  );
};
