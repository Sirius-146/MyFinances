import { COLORS } from "@/styles/default";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

type ToastType = "success" | "error";

interface ToastMessageProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    duration?: number;
    onHide?: () => void;
}
export function ToastMessage({
    visible,
    message,
    type = "success",
    duration = 1500,
    onHide,
}: ToastMessageProps) {
    const translateY = useRef(new Animated.Value(80)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) return;

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 80,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onHide?.();
            });
        }, duration);

        return () => clearTimeout(timeout);
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                styles[type],
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
}
const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 24,
        left: 16,
        right: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 8,
        elevation: 5,
    },
    success: {
        backgroundColor: COLORS.success,
    },
    error: {
        backgroundColor: COLORS.fail,
    },
    text: {
        color: "#fff",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "500",
    },
});
