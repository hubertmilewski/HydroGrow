import React, { useState, useEffect, useRef } from "react";
import { Text, View, Animated, TouchableOpacity, ActivityIndicator, ScrollView, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";

const queryClient = new QueryClient();

interface WeatherData {
  list: {
    dt_txt: string;
    main: {
      temp: number;
      humidity: number;
    };
    weather: {
      description: string;
      main: string;
    }[];
  }[];
}

const fetchWeather = async (): Promise<WeatherData> => {
  const { data } = await axios.get<WeatherData>(
    "https://api.openweathermap.org/data/2.5/forecast?q=Białystok&appid=3eb80938ea85579e48457d63fec7585c&units=metric"
  );
  return data;
};

const useWeatherData = () => {
  return useQuery<WeatherData>({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    staleTime: 600000,
  });
};

const CardComponent = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <View className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-5">
    <View className="flex-row items-center mb-4 pb-3 border-b border-gray-100">
      <Text className="text-2xl mr-3">{icon}</Text>
      <Text className="text-xl font-medium text-gray-800">{title}</Text>
    </View>
    {children}
  </View>
);

const StatusRow = ({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) => (
  <View className="flex-row justify-between py-2">
    <Text className="text-gray-600">{label}:</Text>
    <Text className={`text-gray-900 font-semibold ${capitalize ? "capitalize" : ""}`}>
      {value}
    </Text>
  </View>
);

const DateButton = ({ text, onPress }: { text: string; onPress: () => void }) => (
  <TouchableOpacity className="bg-green-600 rounded-lg py-3 px-6 flex-1 mx-1" onPress={onPress}>
    <Text className="text-white text-center font-medium">{text}</Text>
  </TouchableOpacity>
);

const WeatherComponent = () => {
  const { data, isLoading, error } = useWeatherData();

  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text>Error: {(error as Error).message}</Text>;

  const weather = data?.list[0];
  const temperature = weather?.main.temp ?? 0;
  const humidity = weather?.main.humidity ?? 0;
  const description = weather?.weather[0].description ?? "No description";

  return (
    <CardComponent icon="🌤️" title="Weather in Białystok">
      <StatusRow label="Temperature" value={`${temperature.toFixed(1)}°C`} />
      <StatusRow label="Humidity" value={`${humidity}%`} />
      <StatusRow label="Description" value={description} capitalize />
    </CardComponent>
  );
};

const HomeScreen = () => {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const weatherCardAnim = useRef(new Animated.Value(0)).current;
  const harvestCardAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressBarWidthAnim = useRef(new Animated.Value(0)).current;  // This will animate the width of the progress bar

  const [startDate, setStartDate] = useState<Date>(new Date(2024, 11, 12));
  const [endDate, setEndDate] = useState<Date>(new Date(2025, 11, 12));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      AsyncStorage.setItem("startDate", selectedDate.toISOString());
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      AsyncStorage.setItem("endDate", selectedDate.toISOString());
    }
  };

  const today = moment();
  const daysInPeriod = moment(endDate).diff(moment(startDate), "days");
  const daysPassed = today.diff(moment(startDate), "days");

  // Ensure that daysInPeriod is not zero to avoid NaN in progress calculation
  const progress = daysInPeriod > 0 ? Math.min(Math.max(daysPassed / daysInPeriod, 0), 1) : 0;

  useEffect(() => {
    const loadDates = async () => {
      try {
        const savedStartDate = await AsyncStorage.getItem("startDate");
        const savedEndDate = await AsyncStorage.getItem("endDate");

        if (savedStartDate) setStartDate(new Date(savedStartDate));
        if (savedEndDate) setEndDate(new Date(savedEndDate));
      } catch (error) {
        console.error("Error loading dates:", error);
      }
    };

    loadDates();
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(weatherCardAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(harvestCardAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
      Animated.timing(buttonsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();
  }, []);

  // Start the progress animation for the bar from 0 to the calculated progress
  useEffect(() => {
    Animated.timing(progressBarWidthAnim, {
      toValue: progress * 100, // Calculate width as percentage
      duration: 1500,
      useNativeDriver: false, // width needs to be animated in this case
      easing: Easing.out(Easing.quad),
    }).start();
  }, [progress]);

  const headerStyle = {
    opacity: headerAnim,
    transform: [
      {
        translateY: headerAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };

  const weatherCardStyle = {
    opacity: weatherCardAnim,
    transform: [
      {
        translateY: weatherCardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  };

  const harvestCardStyle = {
    opacity: harvestCardAnim,
    transform: [
      {
        translateY: harvestCardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  const buttonsStyle = {
    opacity: buttonsAnim,
    transform: [
      {
        scale: buttonsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.9, 1],
        }),
      },
    ],
  };

  const progressBarStyle = {
    width: progressBarWidthAnim.interpolate({
      inputRange: [0, 100],
      outputRange: ["0%", "100%"],
    }),
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaView className="bg-gray-50 flex-1">
        <ScrollView className="px-5 pt-3" showsVerticalScrollIndicator={false}>
          <Animated.View style={headerStyle} className="my-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-3xl font-bold text-gray-600">HydroGrow</Text>
              <Text className="text-sm text-gray-500">Monitor your plants</Text>
            </View>
          </Animated.View>

          <Animated.View style={weatherCardStyle}>
            <WeatherComponent />
          </Animated.View>

          <Animated.View style={harvestCardStyle}>
            <CardComponent icon="🌾" title="Harvest Goal">
              <StatusRow label="Growing for" value={`${daysPassed} days`} />
              <StatusRow label="Total Days" value={`${daysInPeriod} days`} />
              <View className="mt-3 mb-4">
                <View className="flex-row items-center">
                  <View className="flex-1 bg-green-100 h-4 rounded-full overflow-hidden">
                    <Animated.View className="bg-green-600 h-full" style={progressBarStyle} />
                  </View>
                  <Text className="ml-2 font-semibold text-gray-700">{Math.round(progress * 100)}%</Text>
                </View>
              </View>
              <Animated.View style={buttonsStyle} className="flex-row justify-between">
                <DateButton text="Start Date" onPress={() => setShowStartDatePicker(true)} />
                <DateButton text="End Date" onPress={() => setShowEndDatePicker(true)} />
              </Animated.View>
            </CardComponent>
          </Animated.View>

          {showStartDatePicker && (
            <DateTimePicker value={startDate} mode="date" display="default" onChange={onStartDateChange} />
          )}
          {showEndDatePicker && (
            <DateTimePicker value={endDate} mode="date" display="default" onChange={onEndDateChange} />
          )}
        </ScrollView>
      </SafeAreaView>
    </QueryClientProvider>
  );
};

export default HomeScreen;
