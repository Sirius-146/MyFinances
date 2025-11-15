import { Pressable, Animated, StyleSheet } from "react-native";
import { useRef } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS } from "../styles/default";

export default function IconButton({
  onPress,
  icon,
  size = 20,
  color = "#fff",
  backgroundColor = COLORS.list,
  disabled=false
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  const animatePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={animatePressIn}
      onPressOut={animatePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          { backgroundColor: backgroundColor },
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <FontAwesome5 name={icon} size={size} color={color} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 2,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
