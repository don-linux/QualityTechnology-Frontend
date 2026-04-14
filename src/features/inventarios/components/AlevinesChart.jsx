import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AlevinesChart({ data }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fecha" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="cantidad" stroke="#2196f3" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
