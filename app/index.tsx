import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withDelay
} from "react-native-reanimated";
import images from "@/constants/images";

export default function WelcomeScreen() {
  // Animation values
  const imageOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.9);

  useEffect(() => {
    // Sequence the animations
    imageOpacity.value = withTiming(1, { duration: 1000 });
    titleOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    subtitleOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    buttonOpacity.value = withDelay(1000, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(1000, withTiming(1, { duration: 600 }));
  }, []);

  // Animated styles
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: withTiming(titleOpacity.value * 0 + (1 - titleOpacity.value) * 15) }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: withTiming(subtitleOpacity.value * 0 + (1 - subtitleOpacity.value) * 15) }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [
      { scale: buttonScale.value },
      { translateY: withTiming(buttonOpacity.value * 0 + (1 - buttonOpacity.value) * 15) }
    ],
  }));

  const handleContinue = () => {
    router.replace("/(root)/(tabs)/home");
  };

  return (
    <SafeAreaView className="flex-1 bg-white ">
      <StatusBar style="dark" />
      
      <Animated.View 
        className="w-full h-2/3"
        style={imageAnimatedStyle}
      >
        <Image
          source={images.onboarding}
          className="w-full h-full"
          resizeMode="contain"
        />
      </Animated.View>
      
      <View className="px-8 flex-1 justify-start items-center">
        <Animated.Text 
          className="text-sm text-center uppercase font-rubik text-gray-700 tracking-wider"
          style={titleAnimatedStyle}
        >
          Welcome to HydroGrow
        </Animated.Text>
        
        <Animated.View 
          className="items-center mt-1 mb-6"
          style={subtitleAnimatedStyle}
        >
          <Text className="text-2xl font-rubik-bold text-gray-900 text-center leading-8">
            Smart Control for{"\n"}
            <Text className="text-green-500">Your Hydroponic system</Text>
          </Text>
        </Animated.View>
        
        <Animated.View 
          className="w-full items-center"
          style={buttonAnimatedStyle}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleContinue}
            className="bg-green-500 rounded-full w-full py-4 shadow-md"
          >
            <Text className="text-lg font-rubik-medium text-white text-center">
              Continue
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}