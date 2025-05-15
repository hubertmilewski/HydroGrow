"use client"

import {
  View,
  ScrollView,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native"
import type React from "react"
import { useState, useEffect } from "react"
import { BarChart, LineChart } from "react-native-gifted-charts"
import { Picker } from "@react-native-picker/picker"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { fetchDataByTimeRange, type SensorData, type TimeRange } from "../other/firebase-utils"
import Loading from "../other/loading"

// Define interfaces for data structures
interface SelectedSensor {
  name: string
  value: string
  details: string
  image: ImageSourcePropType
  additionalImage: ImageSourcePropType | null
}

interface ChartData {
  value: number
  label?: string
  dataPointText?: any
  frontColor?: string
}

interface RenderUnit {
  legend: string
  unit: string
  firebase: string
  color: string
  color2: string
  prefix: string
}

interface SelectedChartData {
  unit: RenderUnit
  firstValue: string
  lastValue: string
}

interface ChartLegends {
  color: string
  color2: string
}

type ChartType = "BarChart" | "LineChart" | "BezierLineChart"

const Charts: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [modalVisibleSensor, setModalVisibleSensor] = useState<boolean>(false)
  const [selectedSensor, setSelectedSensor] = useState<SelectedSensor | null>(null)
  const [charts, setCharts] = useState<ChartType>("BarChart")
  const [time, setTime] = useState<TimeRange>("LastDay")
  const [selectedChartData, setSelectedChartData] = useState<SelectedChartData | null>(null)
  const [modalVisibleChart, setModalVisibleChart] = useState<boolean>(false)

  const handleOpenModal = (
    sensorName: string,
    sensorValue: string,
    sensorDetails: string,
    sensorImg: ImageSourcePropType,
    additionalImg: ImageSourcePropType | null,
  ): void => {
    setSelectedSensor({
      name: sensorName,
      value: sensorValue,
      details: sensorDetails,
      image: sensorImg,
      additionalImage: additionalImg,
    })
    setModalVisibleSensor(true)
  }

  const handleOpenModalChart = (unit: RenderUnit, firstValue: string, lastValue: string): void => {
    setSelectedChartData({ unit, firstValue, lastValue })
    setModalVisibleChart(true)
  }

  // Function to fetch data based on selected time range
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const data = await fetchDataByTimeRange(time)
        setSensorData(data)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [time])

  const lastData: SensorData | null = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null
  const firstData: SensorData | null = sensorData.length > 0 ? sensorData[0] : null

  const calculateAverages = (data: SensorData[], key: string): string => {
    if (data.length === 0) return "N/A"

    const sum = data.reduce((total, entry) => {
      return total + (entry[key] || 0)
    }, 0)

    return (sum / data.length).toFixed(2)
  }

  const findMinMax = (data: SensorData[], key: string): { min: number | string; max: number | string } => {
    if (data.length === 0) return { min: "N/A", max: "N/A" }

    const values = data.map((entry) => entry[key] || 0)
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { min, max }
  }

  const screenWidth: number = Dimensions.get("window").width

  const renderUnits: RenderUnit[] = [
    { legend: "pH Level", unit: "pH", firebase: "ph", color: "orange", color2: "#FF0000", prefix: "" },
    { legend: "TDS Changes", unit: "ppm", firebase: "tds", color: "blue", color2: "#37AFE1", prefix: "" },
    {
      legend: "Watertemperature Changes",
      unit: "°C",
      firebase: "temperature_ds18b20",
      color: "#C5BAFF",
      color2: "#0BA5A4",
      prefix: "°C",
    },
    {
      legend: "Roomtemperature Changes",
      unit: "°C",
      firebase: "temperature_dht",
      color: "gray",
      color2: "#7FFFD4",
      prefix: "°C",
    },
    { legend: "Humidity Changes", unit: "%", firebase: "humidity", color: "teal", color2: "#40e0d0", prefix: "%" },
    { legend: "LDR Changes", unit: "Ω", firebase: "ldr_value", color: "#F1C40F", color2: "#2C3E50", prefix: "" },
  ]

  function lineData(legend: string): ChartData[] {
    let unit = ""

    switch (legend) {
      case "pH Level":
        unit = "ph"
        break
      case "TDS Changes":
        unit = "tds"
        break
      case "Watertemperature Changes":
        unit = "temperature_ds18b20"
        break
      case "Roomtemperature Changes":
        unit = "temperature_dht"
        break
      case "Humidity Changes":
        unit = "humidity"
        break
      case "LDR Changes":
        unit = "ldr_value"
        break
      default:
        break
    }

    const dataWithZeroStart: ChartData[] = [
      {
        value: 0,
      },
      ...sensorData.map((data, index) => {
        const value: number = data[unit] || 0
        return {
          value: value,
          label: data.formattedDate || (index + 1).toString(),
          dataPointText: value > 101 ? Math.round(value).toFixed(0) : value.toFixed(1),
        }
      }),
    ]
    return dataWithZeroStart
  }

  const barData = (legend: string, color: string, color2: string): ChartData[] => {
    let unit = ""

    switch (legend) {
      case "pH Level":
        unit = "ph"
        break
      case "TDS Changes":
        unit = "tds"
        break
      case "Watertemperature Changes":
        unit = "temperature_ds18b20"
        break
      case "Roomtemperature Changes":
        unit = "temperature_dht"
        break
      case "Humidity Changes":
        unit = "humidity"
        break
      case "LDR Changes":
        unit = "ldr_value"
        break
      default:
        break
    }

    return sensorData.map((data, index) => {
      const value: number = data[unit] || 0

      return {
        value: value,
        label: data.formattedDate || (index + 1).toString(),
        capColor: index % 2 === 0 ? color : color2,
        gradientColor: index % 2 === 0 ? color : color2,
        frontColor: "rgba(219, 182, 249, 0.2)",
        topLabelComponent: () => (
          <Text style={{ color: "white", fontSize: 12, marginBottom: 4 }}>
            {value > 101 ? Math.round(value).toFixed(0) : value.toFixed(1)}
          </Text>
        ),
      }
    })
  }

  const renderChart = (unit: RenderUnit, legends: ChartLegends): JSX.Element | null => {
    let chartData: ChartData[]

    if (charts === "LineChart" || charts === "BezierLineChart") {
      chartData = lineData(unit.legend)
    } else {
      chartData = barData(unit.legend, unit.color, unit.color2)
    }

    const maxValue: number = chartData.length > 0 ? Math.max(...chartData.map((item) => item.value)) : 0

    switch (charts) {
      case "LineChart":
        return (
          <LineChart
            noOfSections={6}
            initialSpacing={0}
            data={chartData}
            spacing={screenWidth * 0.1}
            textShiftY={-8}
            textShiftX={-10}
            textColor1="lightgray"
            textFontSize={13}
            thickness={5}
            verticalLinesColor="rgba(14,164,164,0.5)"
            xAxisColor="#0BA5A4"
            yAxisColor="#0BA5A4"
            color={legends.color}
            dataPointsColor1={legends.color2}
            xAxisLabelTextStyle={{ color: "lightgray", textAlign: "center", fontWeight: "bold" }}
            yAxisTextStyle={{ color: "lightgray", fontWeight: "bold" }}
            pointerConfig={{
              pointerStripColor: legends.color2,
              pointerStripWidth: 2,
            }}
            maxValue={maxValue * 1.1}
            yAxisLabelSuffix={unit.prefix}
          />
        )
      case "BezierLineChart":
        return (
          <LineChart
            curved
            areaChart
            noOfSections={6}
            initialSpacing={0}
            data={chartData}
            spacing={screenWidth * 0.1}
            textShiftY={-8}
            textShiftX={-10}
            textColor1="lightgray"
            textFontSize={13}
            thickness={5}
            verticalLinesColor="rgba(14,164,164,0.5)"
            startFillColor={legends.color}
            endFillColor={legends.color}
            startOpacity={0.4}
            endOpacity={0.4}
            xAxisColor="#0BA5A4"
            yAxisColor="#0BA5A4"
            color={legends.color}
            dataPointsColor1={legends.color2}
            xAxisLabelTextStyle={{ color: "lightgray", textAlign: "center", fontWeight: "bold" }}
            yAxisTextStyle={{ color: "lightgray", fontWeight: "bold" }}
            pointerConfig={{
              pointerStripColor: legends.color2,
              pointerStripWidth: 2,
            }}
            maxValue={maxValue * 1.1}
            yAxisLabelSuffix={unit.prefix}
          />
        )
      case "BarChart":
        return (
          <BarChart
            barWidth={Math.max(screenWidth * 0.03, 30)}
            noOfSections={6}
            barBorderRadius={4}
            frontColor={unit.color}
            data={chartData}
            yAxisThickness={1}
            xAxisThickness={1}
            xAxisColor="#0BA5A4"
            yAxisColor="#0BA5A4"
            xAxisLabelTextStyle={{ color: "lightgray", textAlign: "center", fontWeight: "bold" }}
            yAxisTextStyle={{ color: "lightgray", fontWeight: "bold" }}
            maxValue={maxValue * 1.1}
            yAxisLabelSuffix={unit.prefix}
            cappedBars
            showGradient
          />
        )
      default:
        return null
    }
  }

  // If data is still loading, display loader
  if (isLoading) {
    return <Loading />
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        {
          flexGrow: 1,
          backgroundColor: "#f9fafb",
          padding: 16,
          paddingBottom: 90,
        } as ViewStyle
      }
    >
      <View className="flex-1">
        <View className="flex-row justify-between items-center my-4">
          <Text className="text-3xl font-bold text-gray-600">Charts</Text>
          <Text className="text-sm text-gray-500">Monitor your plant data</Text>
        </View>

        <View className="flex flex-row my-2">
          <View className="flex-1 bg-blue-300 rounded-xl shadow-2xl">
            <Picker<ChartType>
              selectedValue={charts}
              onValueChange={(itemValue) => setCharts(itemValue)}
              style={{
                height: 50,
                paddingLeft: 10,
                fontSize: 16,
              }}
              className="font-semibold text-gray-700"
              dropdownIconColor="#0BA5A4"
            >
              <Picker.Item label="Bar Chart" value="BarChart" />
              <Picker.Item label="Line Chart" value="LineChart" />
              <Picker.Item label="Bezier Line Chart" value="BezierLineChart" />
            </Picker>
          </View>
          <View className="flex-1 ml-2 bg-green-300 rounded-xl shadow-2xl">
            <Picker
              selectedValue={time}
              onValueChange={(itemValue) => setTime(itemValue as TimeRange)}
              style={{
                height: 50,
                paddingLeft: 10,
                fontSize: 16,
              }}
              className="font-semibold text-gray-700"
              dropdownIconColor="#0BA5A4"
            >
              <Picker.Item label="Last Hour" value="LastHour" />
              <Picker.Item label="Last Day" value="LastDay" />
              <Picker.Item label="Last Week" value="LastWeek" />
              <Picker.Item label="Last 5 Months" value="LastMonths" />
            </Picker>
          </View>
        </View>

        {/* Horizontal scrolling for charts */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row">
            {/* Charts */}
            {renderUnits.map((unit, index) => (
              <TouchableOpacity
                key={index}
                onPress={() =>
                  handleOpenModalChart(
                    unit,
                    `${firstData?.[unit.firebase.toLowerCase()] || "N/A"} ${unit.unit}`,
                    `${lastData?.[unit.firebase.toLowerCase()] || "N/A"} ${unit.unit}`,
                  )
                }
              >
                <View className="w-[80vw] bg-[#232B5D] rounded-lg p-4 mr-4 mb-4 overflow-hidden">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-white text-lg font-bold mb-2">{unit.legend}</Text>
                    <Text className="text-white text-lg font-bold mb-2 opacity-50">{unit.unit}</Text>
                  </View>
                  {renderChart(unit, { color: unit.color, color2: unit.color2 })}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisibleChart}
          onRequestClose={() => setModalVisibleChart(false)}
        >
          {/* Handle background click */}
          <TouchableWithoutFeedback onPress={() => setModalVisibleChart(false)}>
            <View className="flex-1 bg-black/50 justify-center items-center">
              <KeyboardAvoidingView behavior="padding">
                <TouchableWithoutFeedback>
                  <View
                    className="bg-[#232B5D] rounded-lg p-4 shadow-lg"
                    style={{ width: screenWidth * 0.9 } as ViewStyle}
                  >
                    {/* Header with title and close button */}
                    <View className="flex-row justify-between items-center">
                      <Text
                        className={`${(selectedChartData?.unit.legend?.length || 0) > 15 ? "text-xl" : "text-2xl"} font-semibold text-white`}
                      >
                        {selectedChartData?.unit.legend}
                        <Text className="text-white/50 text-lg font-bold mb-2"> {selectedChartData?.unit.unit}</Text>
                      </Text>
                      <TouchableOpacity onPress={() => setModalVisibleChart(false)}>
                        <FontAwesome name="compress" size={23} color="white" />
                      </TouchableOpacity>
                    </View>

                    {/* Modal content */}
                    {selectedChartData && (
                      <ScrollView>
                        <View className="mt-6">
                          <View>
                            {/* Render chart */}
                            {renderChart(selectedChartData.unit, {
                              color: selectedChartData.unit.color,
                              color2: selectedChartData.unit.color2,
                            })}
                          </View>
                          <View className="bg-white/10 rounded-lg p-4 mt-4">
                            <View className="flex-row justify-between items-center text-white/60 text-lg mt-2 mx-4">
                              <Text className="text-white/60 text-lg">Open </Text>
                              <Text className="text-white">{selectedChartData.firstValue}</Text>
                            </View>

                            <View className="flex-row justify-between items-center text-white/60 text-lg mt-2 mx-4">
                              <Text className="text-white/60 text-lg">Close </Text>
                              <Text className="text-white">{selectedChartData.lastValue}</Text>
                            </View>

                            <View className="flex-row justify-between items-center text-white/60 text-lg mt-2 mx-4">
                              <Text className="text-white/60 text-lg">Average </Text>
                              <Text className="text-white">
                                {calculateAverages(sensorData, selectedChartData.unit.firebase.toLowerCase())}{" "}
                                {selectedChartData?.unit.unit}
                              </Text>
                            </View>

                            <View className="flex-row justify-between items-center text-white/60 text-lg mt-2 mx-4">
                              <Text className="text-white/60 text-lg">Max </Text>
                              <Text className="text-white">
                                {findMinMax(sensorData, selectedChartData.unit.firebase.toLowerCase()).max}{" "}
                                {selectedChartData?.unit.unit}
                              </Text>
                            </View>

                            <View className="flex-row justify-between items-center text-white/60 text-lg mt-2 mx-4">
                              <Text className="text-white/60 text-lg">Min </Text>
                              <Text className="text-white">
                                {findMinMax(sensorData, selectedChartData.unit.firebase.toLowerCase()).min}{" "}
                                {selectedChartData?.unit.unit}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </ScrollView>
                    )}
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>

      {/* Additional content */}
      <View className="mt-8">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-semibold mb-2 text-gray-700">Sensor Data</Text>
          <Text className="text-lg font-semibold mb-2 text-gray-700">
            {lastData?.date || "N/A"} {lastData?.time || "N/A"}
          </Text>
        </View>
        <View className="flex flex-wrap flex-row gap-4">
          <View>
            {/* pH */}
            <View className="bg-white rounded-md h-1/2 flex-[2] justify-start my-2 p-2 shadow-md">
              <View className="flex-row justify-between items-center">
                <Text className="self-start text-base font-medium text-gray-800 pl-2">pH Sensor</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleOpenModal(
                      "pH Sensor",
                      `${lastData?.ph || "N/A"} pH`,
                      "DFRobot SEN0161",
                      require("./sensors/phsensor.png"),
                      require("./sensors/skalapH.png"),
                    )
                  }
                >
                  <FontAwesome className="pr-2" name="expand" size={17} color="gray" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center justify-center py-6 px-6">
                <Image source={require("./icons/ph-test.png")} style={{ width: 50, height: 50 }} resizeMode="contain" />
                <View className="ml-2">
                  <Text className="text-center text-xl">
                    <Text className="text-2xl font-bold">{lastData?.ph || "N/A"}</Text> pH
                  </Text>
                  <Text className="text-center text-xs text-gray-600">DFRobot SEN0161</Text>
                </View>
              </View>
            </View>

            {/* TDS */}
            <View className="bg-white rounded-md h-1/2 flex-[2] justify-start my-2 p-2 shadow-md">
              <View className="flex-row justify-between items-center">
                <Text className="self-start text-base font-medium text-gray-800 pl-2">TDS Sensor</Text>
                <TouchableOpacity
                  onPress={() =>
                    handleOpenModal(
                      "TDS Sensor",
                      `${lastData?.tds || "N/A"} ppm`,
                      "DFRobot SEN0244",
                      require("./sensors/tdssensor.png"),
                      require("./sensors/tdsscale.png"),
                    )
                  }
                >
                  <FontAwesome className="pr-2" name="expand" size={17} color="gray" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center justify-center py-6 px-6">
                <Image source={require("./icons/meter.png")} style={{ width: 50, height: 50 }} resizeMode="contain" />
                <View className="ml-2">
                  <Text className="text-center text-xl">
                    <Text className="text-2xl font-bold">
                      {lastData?.tds !== null && lastData?.tds !== undefined ? Math.round(lastData.tds) : "N/A"}
                    </Text>{" "}
                    ppm
                  </Text>
                  <Text className="text-center text-xs text-gray-600">DFRobot SEN0244</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Temperature */}
          <View className="bg-white rounded-md h-auto flex-[2] justify-start my-2 p-2 shadow-md">
            <View className="flex-row justify-between items-center">
              <Text className="self-start text-base font-medium text-gray-800 pl-2">Temp sensor</Text>
              <TouchableOpacity
                onPress={() =>
                  handleOpenModal(
                    "Temp Sensor",
                    `${lastData?.temperature_ds18b20 || "N/A"}°C`,
                    "DS18B20",
                    require("./sensors/tempw.png"),
                    null,
                  )
                }
              >
                <FontAwesome className="pr-2" name="expand" size={17} color="gray" />
              </TouchableOpacity>
            </View>
            <View className="mt-[40%] items-center justify-center">
              <Image
                source={require("./icons/thermometer.png")}
                style={{ width: 70, height: 70 }}
                resizeMode="contain"
              />
              <View className="mt-8">
                <Text className="text-center text-xl">
                  <Text className="text-2xl font-bold">{lastData?.temperature_ds18b20 || "N/A"}</Text>°C
                </Text>
                <Text className="text-center text-xs text-gray-600">DS18B20</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-center">
          {/* Humidity */}
          <View className="bg-white rounded-md h-auto flex-[2] justify-start my-2 p-2 shadow-md">
            <View className="flex-row justify-between items-center">
              <Text className="self-start text-base font-medium text-gray-800 pl-2">Humidity Sensor</Text>
              <TouchableOpacity
                onPress={() =>
                  handleOpenModal(
                    "Humidity Sensor",
                    `${lastData?.humidity || "N/A"}%`,
                    "DHT11",
                    require("./sensors/DTH11.png"),
                    null,
                  )
                }
              >
                <FontAwesome className="pr-2" name="expand" size={17} color="gray" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-center py-6 px-6">
              <Image source={require("./icons/cloud.png")} style={{ width: 50, height: 50 }} resizeMode="contain" />
              <View className="ml-4">
                <Text className="text-center text-xl">
                  <Text className="text-2xl font-bold">{lastData?.humidity || "N/A"}</Text> %
                </Text>
                <Text className="text-center text-xs text-gray-600">DHT11</Text>
              </View>
            </View>
          </View>

          {/* Temp Room Sensor */}
          <View className="bg-white rounded-md h-auto flex-[2] justify-start my-2 p-2 shadow-md ml-2">
            <View className="flex-row justify-between items-center">
              <Text className="self-start text-base font-medium text-gray-800 pl-2">Temp Room Sensor</Text>
              <TouchableOpacity
                onPress={() =>
                  handleOpenModal(
                    "Temp Room Sensor",
                    `${lastData?.temperature_dht || "N/A"}°C`,
                    "DHT11",
                    require("./sensors/DTH11.png"),
                    null,
                  )
                }
              >
                <FontAwesome className="pr-2" name="expand" size={17} color="gray" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center justify-center py-6 px-6">
              <Image
                source={require("./icons/thermostat.png")}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
              <View className="ml-4">
                <Text className="text-center text-xl">
                  <Text className="text-2xl font-bold">{lastData?.temperature_dht || "N/A"}</Text>°C
                </Text>
                <Text className="text-center text-xs text-gray-600">DHT11</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-md h-auto flex-[2] justify-start my-2 p-2 shadow-md">
        <View className="flex-row justify-between items-center">
          <Text className="self-start text-base font-medium text-gray-800 pl-2">LDR Sensor</Text>
          <TouchableOpacity
            onPress={() =>
              handleOpenModal(
                "LDR Sensor",
                `${lastData?.ldr_value || "N/A"}Ω`,
                "GL5506",
                require("./sensors/ldr.png"),
                null,
              )
            }
          >
            <FontAwesome className="pr-2" name="expand" size={17} color="gray" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-center py-6 px-6">
          <Image source={require("./icons/ldr.png")} style={{ width: 50, height: 50 }} resizeMode="contain" />
          <View className="ml-4">
            <Text className="text-center text-xl">
              <Text className="text-2xl font-bold">{lastData?.ldr_value || "N/A"}</Text> Ω
            </Text>
            <Text className="text-center text-xs text-gray-600">GL5506</Text>
          </View>
        </View>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisibleSensor}
        onRequestClose={() => setModalVisibleSensor(false)}
      >
        {/* Handle background click */}
        <TouchableWithoutFeedback onPress={() => setModalVisibleSensor(false)}>
          <View className="flex-1 bg-black/50 justify-center items-center">
            <KeyboardAvoidingView behavior="padding">
              <TouchableWithoutFeedback>
                <View className="w-[90%] h-auto bg-white rounded-lg p-4 shadow-lg">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-2xl font-semibold mb-2 text-gray-700">{selectedSensor?.name}</Text>
                    <TouchableOpacity onPress={() => setModalVisibleSensor(false)}>
                      <FontAwesome name="compress" size={23} color="gray" />
                    </TouchableOpacity>
                  </View>

                  {/* Modal content */}
                  <View className="mt-4">
                    <Text className="text-lg text-gray-700">
                      Current Value: <Text className="font-semibold">{selectedSensor?.value}</Text>
                    </Text>
                    <Text className="text-lg text-gray-700 mt-2">
                      Model: <Text className="font-semibold">{selectedSensor?.details}</Text>
                    </Text>
                    {selectedSensor?.image && (
                      <Image
                        source={selectedSensor.image}
                        style={{ width: 200, height: 200, alignSelf: "center", marginVertical: 10 }}
                        resizeMode="contain"
                      />
                    )}
                    {selectedSensor?.additionalImage && (
                      <Image
                        source={selectedSensor.additionalImage}
                        style={{ width: 350, height: 125, alignSelf: "center", marginVertical: 10 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  )
}

export default Charts
