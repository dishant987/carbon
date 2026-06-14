import { useState, useCallback, useId } from 'react';
import { activityFormSchema, type ActivityFormSchemaType } from '../lib/validations';
import { useDebounce } from '../hooks/useDebounce';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface ActivityFormProps {
  onSubmit: (data: ActivityFormSchemaType) => Promise<void>;
}

const activityCategories: Record<string, string[]> = {
  transport: ['Car', 'Bus', 'Train', 'Flight', 'Bicycle', 'Walking', 'Motorbike', 'Taxi'],
  food: ['Beef', 'Chicken', 'Pork', 'Vegetables', 'Dairy', 'Grains', 'Seafood', 'Fruits'],
  energy: ['Electricity', 'Natural Gas', 'Heating Oil', 'Solar', 'Propane'],
  shopping: ['Clothing', 'Electronics', 'Furniture', 'Books', 'Toys', 'Home Appliances'],
};

const unitOptions: Record<string, string[]> = {
  transport: ['km', 'miles'],
  food: ['kg', 'lbs', 'servings', 'meals'],
  energy: ['kWh', 'therms', 'MJ'],
  shopping: ['items', 'kg', 'USD'],
};

export function ActivityForm({ onSubmit }: ActivityFormProps) {
  const [type, setType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const debouncedAmount = useDebounce(amount, 300);

  // Stable IDs for aria-describedby linking
  const errorId = useId();
  const amountHintId = useId();

  const resetForm = useCallback(() => {
    setType('');
    setCategory('');
    setAmount('');
    setUnit('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = activityFormSchema.safeParse({
      type,
      category,
      amount,
      unit,
      date,
    });

    if (!parsed.success) {
      setError(parsed.error.errors.map((err) => err.message).join(', '));
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(parsed.data);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save activity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive" id={errorId}>
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Activity Type */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-semibold">
            Activity Type
          </Label>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v);
              setCategory('');
              setUnit('');
            }}
          >
            <SelectTrigger
              id="type"
              aria-describedby={error ? errorId : undefined}
              aria-invalid={error ? 'true' : undefined}
              className="bg-background border-border hover:border-accent-foreground/20 transition-colors"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category (conditional) */}
        {type ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <Label htmlFor="category" className="text-sm font-semibold">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger
                id="category"
                aria-describedby={error ? errorId : undefined}
                aria-invalid={error ? 'true' : undefined}
                className="bg-background border-border hover:border-accent-foreground/20 transition-colors"
              >
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {activityCategories[type].map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-semibold">
            Amount
          </Label>
          <div className="space-y-1">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-describedby={`${amountHintId}${error ? ` ${errorId}` : ''}`}
              aria-invalid={error ? 'true' : undefined}
              className="bg-background border-border hover:border-accent-foreground/20 transition-colors"
            />
            <p id={amountHintId} className="text-[11px] text-muted-foreground pl-1">
              Debounced value: <span className="font-mono text-foreground">{debouncedAmount || '—'}</span>
            </p>
          </div>
        </div>

        {/* Unit (conditional) */}
        {type && unitOptions[type] ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <Label htmlFor="unit" className="text-sm font-semibold">
              Unit
            </Label>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger
                id="unit"
                aria-describedby={error ? errorId : undefined}
                aria-invalid={error ? 'true' : undefined}
                className="bg-background border-border hover:border-accent-foreground/20 transition-colors"
              >
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {unitOptions[type].map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="hidden md:block" />
        )}

        {/* Date */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="date" className="text-sm font-semibold">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-describedby={error ? errorId : undefined}
            className="bg-background border-border hover:border-accent-foreground/20 transition-colors w-full"
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full font-semibold transition-all shadow-sm active:scale-[0.99] mt-2"
        disabled={submitting}
        aria-busy={submitting}
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-label="Submitting" />}
        {submitting ? 'Calculating...' : 'Calculate & Save'}
      </Button>
    </form>
  );
}
