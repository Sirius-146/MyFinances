import { useRef, useState } from "react";
import { Animated, StyleSheet, TextInput } from "react-native";
import { COLORS } from "../styles/default";

export default function ModernInput({
    value,
    onChangeText,
    placeholder,
    keyboardType,
    autoCapitalize = "words",
}) {
    const [isFocused, setIsFocused] = useState(false);
    const borderAnim = useRef(new Animated.Value(1)).current; // 1 = normal, 2 = foco

    const handleFocus = () => {
        setIsFocused(true);
        Animated.timing(borderAnim, {
            toValue: 2,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setIsFocused(false);
        Animated.timing(borderAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start();
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [1, 2],
        outputRange: ["#ccc", COLORS.buttons],
    });

    return (
        <Animated.View style={[styles.inputContainer, { borderColor }]}>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#666"
                style={styles.input}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 2,
        paddingHorizontal: 8,
        marginVertical: 6,
        width: 250,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    input: {
        fontSize: 16,
        paddingVertical: 10,
        color: "#333",
    },
});
