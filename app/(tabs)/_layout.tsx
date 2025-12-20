import { router, Tabs } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "../../hooks/use-auth";

export default function TabLayout() {
    const { user, loading } = useAuth();
    const colorScheme = useColorScheme();

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/(auth)/login");
        }
    }, [loading, user]);

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: false,
                tabBarButton: HapticTab,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={28} name="house.fill" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ExpenseForm"
                options={{
                    title: "Cadastrar",
                    tabBarIcon: ({ color }) => (
                        <FontAwesome5 size={28} name="plus" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="ExpensesListScreen"
                options={{
                    title: "Meus gastos",
                    tabBarIcon: ({ color }) => (
                        <FontAwesome5 size={28} name="receipt" color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Meu Perfil",
                    tabBarIcon: ({ color }) => (
                        <FontAwesome5
                            size={28}
                            name="user-circle"
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
