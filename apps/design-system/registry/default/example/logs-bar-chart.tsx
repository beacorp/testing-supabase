import { LogsBarChart } from 'ui-patterns/LogsBarChart'

export default function LogsBarChartDemo() {
  const data = Array.from({ length: 100 }, (_, i) => {
    const date = new Date()
    date.setMinutes(date.getMinutes() - i * 5) // Each point 5 minutes apart

    return {
      timestamp: date.toISOString(),
      ok_count: Math.floor(Math.random() * 100), // Random value 0-99
      warning_count: Math.floor(Math.random() * 30), // Random value 0-29
      error_count: Math.floor(Math.random() * 20), // Random value 0-19
    }
  }).reverse()

  return (
    <div className="w-full">
      <LogsBarChart data={data} />
    </div>
  )
}
