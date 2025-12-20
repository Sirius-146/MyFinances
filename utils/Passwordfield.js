import { FontAwesome5 } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
    Animated,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import styles from "../app/profile/styles/styles";
import { COLORS } from "../styles/default";

const PasswordField = ({
    label,
    value,
    onChangeText,
    placeholder,
    style = {},
    errorMessage = null,
    placeholderColor = "#666",
}) => {
    const [visible, setVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const borderAnim = useRef(new Animated.Value(1)).current;

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
        <View>
            {label && <Text style={styles.label}>{label}</Text>}
            <Animated.View
                style={[styles.passwordContainer, style, { borderColor }]}
            >
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={placeholderColor}
                    secureTextEntry={!visible}
                    style={styles.inputPassword}
                    autoCapitalize="none"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <TouchableOpacity onPress={() => setVisible(!visible)}>
                    <FontAwesome5
                        name={visible ? "eye-slash" : "eye"}
                        size={20}
                        color={isFocused ? COLORS.secondary : "#666"}
                    />
                </TouchableOpacity>
            </Animated.View>
            {errorMessage && (
                <Text style={styles.errorText}>{errorMessage}</Text>
            )}
        </View>
    );
};

export default PasswordField;
