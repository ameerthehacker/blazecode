import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { templates } from '@/templates';

const options = Object.keys(templates).map((templateKey) => ({
  value: templateKey,
  label: templates[templateKey].name,
  logo: templates[templateKey].logo,
}));

export function TemplateSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (template: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const label = (() => {
    if (value) {
      const template = options.find((framework) => framework.value === value);

      return (
        template && (
          <div className="flex gap-2 items-center justify-center">
            {template.logo}
            {template.label}
          </div>
        )
      );
    } else {
      return 'Select template...';
    }
  })();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-14"
        >
          {label}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[394px] p-0">
        <Command>
          <CommandInput placeholder="Search template..." />
          <CommandList>
            <CommandEmpty>No template found.</CommandEmpty>
            <CommandGroup>
              {options.map((template) => (
                <CommandItem
                  key={template.value}
                  value={template.value}
                  onSelect={(currentValue) => {
                    onChange?.(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex gap-2 items-center justify-center">
                    {template.logo}
                    {template.label}
                  </div>
                  <Check
                    className={cn(
                      'ml-auto',
                      value === template.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
