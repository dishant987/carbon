import { useMemo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Trash2, Leaf, Carrot, Zap, ShoppingBag, X, Calendar, TreePine, Smartphone } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatCO2 } from '../lib/utils';
import { useFocusTrap } from '../hooks/useFocusTrap';
import type { Activity } from '../types';

const ROW_HEIGHT = 72;
const MAX_VISIBLE_ROWS = 10;

interface ActivityListProps {
  activities: Activity[];
  onDelete: (id: string) => Promise<void>;
}

const typeIcons: Record<string, React.ReactNode> = {
  transport: <Car className="h-4 w-4" aria-hidden="true" />,
  food: <Carrot className="h-4 w-4" aria-hidden="true" />,
  energy: <Zap className="h-4 w-4" aria-hidden="true" />,
  shopping: <ShoppingBag className="h-4 w-4" aria-hidden="true" />,
};

function Car(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.5-1.7-1.2-2l-1.8-.6-1.5-2.5A3 3 0 0 0 15 7H9a3 3 0 0 0-2.5 1.4L5 10.9 3.2 11.5C2.5 11.8 2 12.5 2 13.3V16c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

const ActivityRow = ({
  index,
  style,
  data,
}: {
  index: number;
  style: React.CSSProperties;
  data: {
    items: Activity[];
    onDelete: (id: string) => Promise<void>;
    onSelect: (activity: Activity) => void;
  };
}) => {
  const activity = data.items[index];
  const { onDelete, onSelect } = data;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      if (!activity) return;
      e.stopPropagation();
      onDelete(activity.id);
    },
    [activity, onDelete]
  );

  const handleSelect = useCallback(() => {
    if (!activity) return;
    onSelect(activity);
  }, [activity, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!activity) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(activity);
      }
    },
    [activity, onSelect]
  );

  if (!activity) return null;

  return (
    <div
      style={style}
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${activity.category} activity`}
      className="flex items-center justify-between px-3 rounded-lg border bg-card hover:bg-accent/40 hover:border-primary/25 cursor-pointer transition-all duration-200 select-none shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-muted-foreground shrink-0" aria-hidden="true">
          {typeIcons[activity.type] ?? <Leaf className="h-4 w-4" aria-hidden="true" />}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium capitalize truncate text-foreground">{activity.category}</span>
            <Badge variant="secondary" className="text-[10px] uppercase font-bold shrink-0">
              {activity.type}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {activity.amount} {activity.unit} &middot; {new Date(activity.date).toLocaleDateString()}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold text-green-600 dark:text-green-500">
          {formatCO2(activity.footprint)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          aria-label={`Delete ${activity.category} activity`}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

export function ActivityList({ activities, onDelete }: ActivityListProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const handleDelete = useCallback((id: string) => onDelete(id), [onDelete]);

  const handleClose = useCallback(() => {
    setSelectedActivity(null);
  }, []);

  const modalRef = useFocusTrap(!!selectedActivity, handleClose);

  const stableItemData = useMemo(
    () => ({
      items: activities,
      onDelete: handleDelete,
      onSelect: setSelectedActivity,
    }),
    [activities, handleDelete]
  );

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground" role="status">
        <Leaf className="h-12 w-12 mx-auto mb-2 opacity-40 text-green-500" aria-hidden="true" />
        <p>No activities yet. Start tracking your carbon footprint!</p>
      </div>
    );
  }

  const height = Math.min(activities.length, MAX_VISIBLE_ROWS) * ROW_HEIGHT;

  return (
    <section aria-label="Activity history list" className="relative">
      <div className="space-y-1.5">
        <List
          height={height}
          itemCount={activities.length}
          itemSize={ROW_HEIGHT}
          width="100%"
          itemData={stableItemData}
          overscanCount={3}
        >
          {ActivityRow}
        </List>
      </div>

      {/* Detail Modal Overlay */}
      {selectedActivity && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={handleClose}
        >
          <div
            ref={modalRef}
            className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-border/80 flex items-center justify-between bg-muted/10">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-primary/10 rounded-lg text-primary">
                  {typeIcons[selectedActivity.type] ?? <Leaf className="h-5 w-5" />}
                </span>
                <div>
                  <h3 className="font-bold text-lg capitalize text-foreground">
                    {selectedActivity.category}
                  </h3>
                  <p className="text-xs text-muted-foreground capitalize">{selectedActivity.type} Activity</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Core metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border bg-secondary/20 flex flex-col justify-center">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                    Quantity
                  </span>
                  <span className="text-lg font-bold mt-1 text-foreground leading-none">
                    {selectedActivity.amount}{' '}
                    <span className="text-xs font-normal text-muted-foreground">{selectedActivity.unit}</span>
                  </span>
                </div>
                <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 flex flex-col justify-center">
                  <span className="text-[10px] text-green-700 dark:text-green-400 font-bold uppercase tracking-wider">
                    Footprint
                  </span>
                  <span className="text-lg font-bold mt-1 text-green-600 dark:text-green-500 leading-none">
                    {formatCO2(selectedActivity.footprint)}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground px-1 border-y py-3 border-dashed">
                <Calendar className="h-4 w-4 text-primary shrink-0" />
                <span>
                  Recorded on{' '}
                  <strong>
                    {new Date(selectedActivity.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </strong>
                </span>
              </div>

              {/* Environmental Equivalents */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Impact Equivalents
                </h4>
                <div className="space-y-2.5">
                  {/* Car Drive */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/10 transition-colors">
                    <span className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                      <Car className="h-5 w-5" />
                    </span>
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">
                        {(selectedActivity.footprint * 4.1).toFixed(1)} km
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        equivalent driving distance in a passenger vehicle
                      </p>
                    </div>
                  </div>

                  {/* Trees planted */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/10 transition-colors">
                    <span className="p-2 rounded-lg bg-green-500/10 text-green-500 shrink-0">
                      <TreePine className="h-5 w-5" />
                    </span>
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">
                        {(selectedActivity.footprint / 22).toFixed(2)} Trees
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        needed to absorb this CO2 over a full year
                      </p>
                    </div>
                  </div>

                  {/* Phone Charges */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-muted/10 transition-colors">
                    <span className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0">
                      <Smartphone className="h-5 w-5" />
                    </span>
                    <div className="text-sm">
                      <p className="font-semibold text-foreground">
                        {Math.round(selectedActivity.footprint * 120).toLocaleString()} charges
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-snug">
                        of a standard smartphone battery
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-muted/10 border-t border-border/80 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleClose}>
                Close Details
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(selectedActivity.id);
                  handleClose();
                }}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
