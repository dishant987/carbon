import { useState, useCallback } from 'react';
import { useActivities, useCreateActivity, useDeleteActivity } from '../hooks/useActivities';
import { ActivityForm } from '../components/ActivityForm';
import { ActivityList } from '../components/ActivityList';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ActivityFormSchemaType } from '../lib/validations';

import { TableSkeleton } from '../components/SkeletonLoaders';

export function Activities() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useActivities(page);
  const createMutation = useCreateActivity();
  const deleteMutation = useDeleteActivity();

  const handleSubmit = useCallback(
    async (formData: ActivityFormSchemaType) => {
      await createMutation.mutateAsync({
        type: formData.type,
        category: formData.category,
        amount: Number(formData.amount),
        unit: formData.unit,
        date: formData.date || undefined,
      });
    },
    [createMutation]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    [deleteMutation]
  );

  const activities = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Activity Tracking</h1>

      <Tabs defaultValue="add" className="space-y-4">
        <TabsList>
          <TabsTrigger value="add">Add Activity</TabsTrigger>
          <TabsTrigger value="history">History ({pagination?.total ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Record Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityForm onSubmit={handleSubmit} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton />
              ) : isError ? (
                <div className="text-center py-8 text-destructive">
                  <p>Error: {error instanceof Error ? error.message : 'Failed to load'}</p>
                </div>
              ) : (
                <>
                  <ActivityList activities={activities} onDelete={handleDelete} />

                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
