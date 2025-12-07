import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { COLORS } from "../styles/default";

export default function ModernButton({
    text,
    onPress,
    icon,
    colors = [COLORS.buttons, COLORS.list],
    iconColor = "#fff",
    iconSize = 18,
    disabled = false,
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const animatePressIn = () => {
        if (!disabled) {
            Animated.spring(scaleAnim, {
                toValue: 0.96, //1
                useNativeDriver: true,
                friction: 4,
            }).start();
        }
    };

    const animatePressOut = () => {
        if (!disabled) {
            Animated.spring(scaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 4,
            }).start();
        }
    };

    const gradientColors = disabled ? ["#ccc", "#bbb"] : colors;

    return (
        <Pressable
            onPress={!disabled ? onPress : null}
            onPressIn={animatePressIn}
            onPressOut={animatePressOut}
            disabled={disabled}
        >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.button, disabled && styles.buttonDisabled]}
                >
                    {icon && (
                        <FontAwesome5
                            name={icon}
                            size={iconSize}
                            color={disabled ? "#888" : iconColor}
                            style={styles.icon}
                        />
                    )}
                    <Text
                        style={[
                            styles.buttonText,
                            disabled && styles.textDisabled,
                        ]}
                    >
                        {text}
                    </Text>
                </LinearGradient>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginBottom: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    buttonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
    },
    textDisabled: {
        color: "#888",
    },
});
