import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6'];

interface BreakdownItem {
  type: string;
  total: number;
  percentage: number;
  count: number;
}

interface DashboardChartsProps {
  breakdown: BreakdownItem[];
}

export function DashboardCharts({ breakdown }: DashboardChartsProps) {
  const chartData = useMemo(() => {
    if (breakdown.length === 0) return [];
    return breakdown.map((item) => ({
      name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
      value: item.total,
      count: item.count,
    }));
  }, [breakdown]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <section aria-label="Carbon footprint breakdown charts">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg" id="pie-chart-title">
              Footprint by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <figure
              role="img"
              aria-label={`Pie chart showing ${chartData.map((d) => `${d.name}: ${d.value.toFixed(1)} kg CO₂`).join(', ')}`}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine
                    label={({ name, value }) => `${name}: ${value.toFixed(1)} kg`}
                    outerRadius={100}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(2)} kg`, 'CO₂']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </figure>
            {/* Screen reader accessible data table */}
            <table className="sr-only" aria-label="Footprint by category data">
              <caption>Carbon footprint in kilograms of CO₂ per activity category</caption>
              <thead>
                <tr>
                  <th scope="col">Category</th>
                  <th scope="col">Total CO₂ (kg)</th>
                  <th scope="col">Number of activities</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.value.toFixed(2)}</td>
                    <td>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg" id="bar-chart-title">
              Emissions by Activity Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <figure
              role="img"
              aria-label={`Bar chart comparing emissions: ${chartData.map((d) => `${d.name}: ${d.value.toFixed(1)} kg`).join(', ')}`}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'kg CO₂', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(2)} kg`, 'CO₂']} />
                  <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} isAnimationActive={false}>
                    {chartData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </figure>
            <table className="sr-only" aria-label="Emissions by activity type data">
              <caption>CO₂ emissions in kilograms per activity type</caption>
              <thead>
                <tr>
                  <th scope="col">Type</th>
                  <th scope="col">CO₂ (kg)</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.value.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
