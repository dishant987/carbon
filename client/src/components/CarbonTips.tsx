import { useCallback } from 'react';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface CarbonTipsProps {
  tips: string[];
  onRefresh: () => Promise<string[]>;
}

export function CarbonTips({ tips, onRefresh }: CarbonTipsProps) {
  const handleRefresh = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  const displayedTips = tips.slice(0, 4);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2" id="tips-heading">
          <Lightbulb className="h-5 w-5 text-yellow-500" aria-hidden="true" />
          Tips to Reduce Footprint
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleRefresh} aria-label="Refresh tips">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
        </Button>
      </CardHeader>
      <CardContent aria-live="polite" aria-atomic="false" aria-labelledby="tips-heading" role="region">
        {displayedTips.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Add some activities to get personalized tips.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="list">
            {displayedTips.map((tip, index) => (
              <div
                key={index}
                className="flex gap-3 p-4.5 rounded-xl border border-border/60 bg-secondary/25 hover:bg-secondary/40 transition-all duration-300"
                role="listitem"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-extrabold text-xs">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <span className="sr-only">Tip {index + 1}: </span>
                  <p className="text-sm text-foreground/90 font-medium leading-relaxed">{tip}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
