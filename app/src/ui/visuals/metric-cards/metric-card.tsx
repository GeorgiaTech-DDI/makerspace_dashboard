import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react"

interface MetricCardProps {
  title?: string
  value?: number
  change?: string
  trend?: number[]
}

export default function MetricCard({ title, value, change, trend }: MetricCardProps) {
  

  const isPositive = change!.startsWith('+')

  return (
    <Card className="overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent className="pb-2">
      <div className="flex items-start justify-between">
        {/* Left side: Metric value and change */}
        <div className="flex flex-col space-y-1">
          <div className="text-3xl font-bold">{value}</div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpIcon className="inline h-4 w-4" /> : <ArrowDownIcon className="inline h-4 w-4" />}
            {change}
          </div>
          <p className="text-xs text-muted-foreground">compared to last month</p>
        </div>
  
        {/* Right side: Trend chart */}
        <div className="h-[60px] w-[50%] ml-4">
          <TrendChart data={trend!} />
        </div>
      </div>
    </CardContent>
  </Card>
  
  )
}

function TrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min

  return (
    <div className="flex items-end justify-between h-full w-full">
      {data.map((value, index) => (
        <div
          key={index}
          className="bg-primary w-[8%]"
          style={{
            height: `${((value - min) / range) * 100}%`,
          }}
        />
      ))}
    </div>
  )
}