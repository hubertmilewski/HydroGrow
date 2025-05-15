"use client"

import React, { useEffect } from "react"
import { View, ScrollView, Animated, Dimensions } from "react-native"

const screenWidth = Dimensions.get("window").width

const Loading = () => {
  // Animacja shimmer
  const shimmerValue = new Animated.Value(0)

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start()
  }, [])

  // Gradient shimmer
  const shimmerTranslate = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-screenWidth, screenWidth],
  })

  const ShimmerBlock = ({ width, height, className }) => (
    <View
      className={`bg-gray-200 rounded-md ${className}`}
      style={{ width, height, overflow: "hidden" }}
    >
      <Animated.View
        style={{
          height,
          width: screenWidth,
          backgroundColor: "rgba(255, 255, 255, 0.3)",
          transform: [{ translateX: shimmerTranslate }],
        }}
      />
    </View>
  )

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#F5F5F5",
        padding: 16,
        paddingBottom: 90,
        minHeight: '100%'
      }}
    >
      {/* Główny kontener */}
      <View className="flex-1">
        {/* Sekcja nagłówka - "General Stats" i picker typu wykresu */}
        <View className="flex-row justify-between items-center mb-4">
          <ShimmerBlock width={"45%"} height={32} className="rounded-lg" />
          <View style={{ width: "48%" }}>
            <ShimmerBlock width={"100%"} height={50} className="rounded-xl shadow-md" />
          </View>
        </View>

        {/* Picker okresu czasu */}
        <View className="mb-4">
          <ShimmerBlock width={"100%"} height={50} className="rounded-xl shadow-md" />
        </View>

        {/* Informacja debugowa */}
        <View className="mb-2">
          <ShimmerBlock width={"70%"} height={16} className="rounded-md" />
        </View>

        {/* Sekcja wykresów - karty z wykresami */}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View className="flex-row">
            {[...Array(5)].map((_, index) => (
              <View key={index} className="mr-6 mb-4">
                <ShimmerBlock
                  width={screenWidth * 0.75}
                  height={200}
                  className="rounded-lg shadow-lg"
                />
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Sekcja "Sensor Data" z datą/czasem */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-2">
            <ShimmerBlock width={"40%"} height={32} className="rounded-lg" />
            <ShimmerBlock width={"30%"} height={24} className="rounded-lg" />
          </View>

          {/* Karty sensorów - pierwszy rząd z dwoma kartami */}
          <View className="flex flex-row gap-4">
            <View>
              {/* pH Sensor */}
              <ShimmerBlock
                width={screenWidth * 0.45}
                height={120}
                className="rounded-md shadow-md my-2"
              />

              {/* TDS Sensor */}
              <ShimmerBlock
                width={screenWidth * 0.45}
                height={120}
                className="rounded-md shadow-md my-2"
              />
            </View>

            {/* Temp sensor - większa karta */}
            <ShimmerBlock
              width={screenWidth * 0.45}
              height={250}
              className="rounded-md shadow-md my-2"
            />
          </View>

          {/* Drugi rząd z dwoma kartami */}
          <View className="flex-row items-center justify-center">
            {/* Humidity Sensor */}
            <ShimmerBlock
              width={screenWidth * 0.45}
              height={120}
              className="rounded-md shadow-md my-2"
            />

            {/* Temp Room Sensor */}
            <ShimmerBlock
              width={screenWidth * 0.45}
              height={120}
              className="rounded-md shadow-md my-2 ml-2"
            />
          </View>
          <View>
            <ShimmerBlock
              width={screenWidth * 0.9}
              height={120}
              className="rounded-md shadow-md my-2 mx-1"
            />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default Loading