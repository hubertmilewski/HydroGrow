import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import 'react-native-get-random-values';

export default function TabLayout() {
    return (
        <View style={styles.container}>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "#16a34a",
                    tabBarInactiveTintColor: "gray",
                    tabBarStyle: {
                        position: "absolute",
                        height: 80,
                        backgroundColor: 'transparent',
                        borderTopWidth: 0,
                        elevation: 0,
                    },
                    tabBarBackground: () => (
                        <LinearGradient
                            colors={['rgba(243, 244, 246, 0.2)', 'rgba(243, 244, 246, 0.9)', 'rgba(243, 244, 246, 1)']}
                            style={styles.background}
                            start={{ x: 0.5, y: 0 }}
                            end={{ x: 0.5, y: 1 }}
                        />
                    ),
                    tabBarItemStyle: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        paddingBottom: 7, // Lepsze pozycjonowanie ikon
                    },
                    tabBarLabelStyle: {
                        fontSize: 12,
                        fontWeight: '600', // Pogrubienie tekstu jak w Spotify
                        paddingTop: 4,
                    },
                    tabBarIconStyle: {
                        marginTop: 8,
                        marginBottom: 0,
                    },
                    headerShown: false,
                }}
            >
                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Home",
                        tabBarIcon: ({ color, focused }) => (
                            <FontAwesome
                                size={24}
                                name="home"
                                color={color}
                                style={focused ? styles.iconFocused : null}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="charts"
                    options={{
                        title: "Charts",
                        tabBarIcon: ({ color, focused }) => (
                            <FontAwesome
                                size={24}
                                name="bar-chart"
                                color={color}
                                style={focused ? styles.iconFocused : null}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name="aiAssistant"
                    options={{
                        title: "AI Assistant",
                        tabBarIcon: ({ color, focused }) => (
                            <FontAwesome
                                size={24}
                                name="comments"
                                color={color}
                                style={focused ? styles.iconFocused : null}
                            />
                        ),
                    }}
                />
            </Tabs>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb', // Gray-50 background
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        height: 80,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    iconFocused: {
        shadowColor: '#679400',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 3,
    },
});