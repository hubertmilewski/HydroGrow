import { database } from "@/src/config/firebaseConfig"
import { ref, query, orderByKey, get, limitToLast } from "firebase/database"
import { format, subDays, subMonths, subHours } from "date-fns"

export interface SensorData {
  id: string
  ph: number
  tds: number
  temperature_ds18b20: number
  temperature_dht: number
  humidity: number
  ldr_value: number
  date: string
  time: string
  timestamp: number
  formattedDate?: string
  [key: string]: any
}

export type TimeRange = "LastHour" | "LastDay" | "LastWeek" | "LastMonths"

export async function fetchDataByTimeRange(selectedRange: TimeRange): Promise<SensorData[]> {
  try {
    const dbRef = ref(database, "sensor_data")
    const dataSnapshot = await get(query(dbRef, orderByKey(), limitToLast(30000)))

    if (!dataSnapshot.exists()) return []

    const allData: Record<string, any> = dataSnapshot.val()
    const allEntries: SensorData[] = Object.keys(allData).map((key) => {
      const entry = allData[key]
      const timestamp = new Date(`${entry.date}T${entry.time}`).getTime()
      return {
        id: key,
        ...entry,
        timestamp,
      }
    })

    allEntries.sort((a, b) => a.timestamp - b.timestamp)

    switch (selectedRange) {
      case "LastHour": {
        const lastSixEntries = allEntries.slice(-6)
        return lastSixEntries.map((entry, index) => ({
          ...entry,
          formattedDate: `${index + 1}`,
        }))
      }
      case "LastDay":
        return getEntriesGroupedByInterval(allEntries, 3, 24)
      case "LastWeek":
        return getEntriesGroupedByDays(allEntries, 1, 6)
      case "LastMonths":
        return getEntriesGroupedByMonths(allEntries, 6)
      default:
        return []
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    return []
  }
}

function getEntriesGroupedByInterval(entries: SensorData[], intervalHours: number, totalHours: number): SensorData[] {
  const now = new Date()
  const groups = totalHours / intervalHours
  const result: SensorData[] = []

  for (let i = 0; i < groups; i++) {
    const target = subHours(now, i * intervalHours)
    const targetDate = format(target, "yyyy-MM-dd")
    const targetHour = target.getHours()

    const match = entries.find(e => e.date === targetDate && parseInt(e.time.split(":"[0]), 10) === targetHour)
    if (match) {
      result.push({
        ...match,
        formattedDate: `${String(targetHour).padStart(2, "0")}:00`,
      })
    }
  }

  return result.reverse()
}

function getEntriesGroupedByDays(entries: SensorData[], dayStep: number, numberOfDays: number): SensorData[] {
  const now = new Date()
  const result: SensorData[] = []

  for (let i = 0; i < numberOfDays; i++) {
    const targetDate = format(subDays(now, i * dayStep), "yyyy-MM-dd")
    const matches = entries.filter(e => e.date === targetDate)

    if (matches.length > 0) {
      const avg = calculateAverages(matches)
      const timestamp = new Date(`${targetDate}T00:00:00`).getTime()

      result.push({
        id: `avg-${targetDate}`,
        date: targetDate,
        time: "00:00",
        timestamp,
        formattedDate: format(new Date(timestamp), "MM-dd"),
        ph: avg.avgPh ?? 0,
        tds: avg.avgTds ?? 0,
        humidity: avg.avgHumidity ?? 0,
        temperature_dht: avg.avgTempDHT ?? 0,
        temperature_ds18b20: avg.avgTempDS ?? 0,
        ldr_value: avg.avgLDR ?? 0,
      })
    }
  }

  return result.reverse()
}


function getEntriesGroupedByMonths(entries: SensorData[], numberOfMonths: number): SensorData[] {
  const now = new Date()
  const result: SensorData[] = []
  const usedMonths = new Set<string>()

  for (let i = 0; i < numberOfMonths; i++) {
    const target = subMonths(now, i)
    const monthKey = format(target, "yyyy-MM")
    if (usedMonths.has(monthKey)) continue

    const monthEntries = entries.filter(e => format(new Date(e.timestamp), "yyyy-MM") === monthKey)

    if (monthEntries.length > 0) {
      const avg = calculateAverages(monthEntries)

      result.push({
        id: `avg-${monthKey}`,
        date: `${monthKey}-01`,
        time: "00:00",
        timestamp: new Date(`${monthKey}-01T00:00:00`).getTime(),
        formattedDate: format(new Date(`${monthKey}-01`), "MMM"),
        ph: avg.avgPh ?? 0,
        tds: avg.avgTds ?? 0,
        humidity: avg.avgHumidity ?? 0,
        temperature_dht: avg.avgTempDHT ?? 0,
        temperature_ds18b20: avg.avgTempDS ?? 0,
        ldr_value: avg.avgLDR ?? 0,
      })

      usedMonths.add(monthKey)
    }
  }

  return result.reverse()
}

export function calculateAverages(entries: SensorData[]) {
  const total = entries.length

  const sums = entries.reduce(
    (acc, entry) => {
      acc.ph += entry.ph
      acc.tds += entry.tds
      acc.humidity += entry.humidity
      acc.temperature_dht += entry.temperature_dht
      acc.temperature_ds18b20 += entry.temperature_ds18b20
      acc.ldr_value += entry.ldr_value
      return acc
    },
    {
      ph: 0,
      tds: 0,
      humidity: 0,
      temperature_dht: 0,
      temperature_ds18b20: 0,
      ldr_value: 0,
    }
  )

  return {
    avgPh: parseFloat((sums.ph / total).toFixed(2)),
    avgTds: parseFloat((sums.tds / total).toFixed(0)),
    avgHumidity: parseFloat((sums.humidity / total).toFixed(1)),
    avgTempDHT: parseFloat((sums.temperature_dht / total).toFixed(1)),
    avgTempDS: parseFloat((sums.temperature_ds18b20 / total).toFixed(1)),
    avgLDR: parseFloat((sums.ldr_value / total).toFixed(0)),
  }
}
