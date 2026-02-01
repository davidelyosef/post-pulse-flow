import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";

function getTimezoneLabel(iana: string): string {
  const part = iana.includes("/") ? iana.split("/")[1] ?? iana : iana;
  return part.replace(/_/g, " ");
}

function getRegion(iana: string): string {
  return iana.includes("/") ? iana.split("/")[0] ?? "Other" : "Other";
}

const REGION_ORDER = [
  "Africa",
  "America",
  "Antarctica",
  "Arctic",
  "Asia",
  "Atlantic",
  "Australia",
  "Europe",
  "Indian",
  "Pacific",
  "Etc",
  "Other",
];

export interface TimezoneDialogProps {
  isOpen: boolean;
  onClose: () => void;
  timezones: string[];
  currentTimezone: string;
  onSelect: (timezone: string) => void;
}

export const TimezoneDialog = ({ isOpen, onClose, timezones, currentTimezone, onSelect }: TimezoneDialogProps) => {
  const groupedByRegion = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const tz of timezones) {
      const region = getRegion(tz);
      if (!map.has(region)) map.set(region, []);
      map.get(region)!.push(tz);
    }
    for (const [, list] of map) {
      list.sort((a, b) =>
        getTimezoneLabel(a).localeCompare(getTimezoneLabel(b), undefined, { sensitivity: "base" })
      );
    }
    const order = new Map(REGION_ORDER.map((r, i) => [r, i]));
    return [...map.entries()].sort(([a], [b]) => (order.get(a) ?? 99) - (order.get(b) ?? 99));
  }, [timezones]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select timezone</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select value={currentTimezone} onValueChange={onSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timezone">
                {currentTimezone ? getTimezoneLabel(currentTimezone) : "Select timezone"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[min(70vh,24rem)]">
              {groupedByRegion.map(([region, list], index) => (
                <SelectGroup key={region} className="py-1">
                  {index > 0 && (
                    <SelectSeparator className="my-2 h-px bg-border shrink-0" />
                  )}
                  <SelectLabel className="bg-muted/60 text-foreground font-semibold text-xs uppercase tracking-wider py-2 px-2 border-b border-border/80 mb-0.5 rounded-none pointer-events-none select-none">
                    {region === "Other" ? "Other" : region}
                  </SelectLabel>
                  {list.map((tz) => (
                    <SelectItem key={tz} value={tz} className="pl-8">
                      {getTimezoneLabel(tz)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
