import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProgressData {
  date: string;
  total: number;
  activities: number;
}

interface ProgressChartProps {
  data: ProgressData[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));
  }, [data]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg" id="progress-chart-title">
          Daily Progress (30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <figure
          role="img"
          aria-label={`Line chart showing daily CO₂ emissions over 30 days. Range: ${chartData[0]?.date} to ${chartData[chartData.length - 1]?.date}`}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} aria-label="Daily carbon footprint line chart">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis
                label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)} kg`, 'CO₂']}
                labelFormatter={(label: string) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ r: 3, fill: '#16a34a' }}
                activeDot={{ r: 5 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </figure>
        {/* Screen reader accessible data table */}
        <table className="sr-only" aria-label="Daily progress data">
          <caption>Daily CO₂ emissions in kilograms over the last 30 days</caption>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">CO₂ (kg)</th>
              <th scope="col">Activities</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                <td>{row.total.toFixed(2)}</td>
                <td>{row.activities}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
