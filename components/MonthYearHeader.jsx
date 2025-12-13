import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    FadeIn,
    FadeOut,
    SlideInLeft,
    SlideInRight,
    SlideInUp,
    SlideOutDown,
    SlideOutLeft,
    SlideOutRight,
} from "react-native-reanimated";

function getMonthKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

function parseMonthKey(key) {
    const [y, m] = key.split("-");
    return new Date(y, m - 1, 1);
}

function formatMonthYear(key) {
    const date = parseMonthKey(key);
    return date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
}

export default function MonthYearHeader({ value, onChange, COLORS }) {
    const [visible, setVisible] = useState(false);
    const [direction, setDirection] = useState("right"); //controla slide

    function prevMonth() {
        const d = parseMonthKey(value);
        d.setMonth(d.getMonth() - 1);
        setDirection("left");
        onChange(getMonthKey(d));
    }

    function nextMonth() {
        const d = parseMonthKey(value);
        d.setMonth(d.getMonth() + 1);
        setDirection("right");
        onChange(getMonthKey(d));
    }

    const months = Array.from({ length: 12 }).map((_, i) => {
        const d = new Date(new Date().getFullYear(), i, 1);
        return {
            label: d.toLocaleDateString("pt-BR", { month: "long" }),
            value: getMonthKey(d),
        };
    });

    const enteringAnim = direction === "right" ? SlideInRight : SlideInLeft;
    const exitingAnim = direction === "right" ? SlideOutLeft : SlideOutRight;

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 15,
            }}
        >
            <TouchableOpacity onPress={prevMonth}>
                <Ionicons name="chevron-back" size={26} color={COLORS.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setVisible(true)}>
                <Animated.Text
                    key={value}
                    entering={enteringAnim}
                    exiting={exitingAnim}
                    style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: COLORS.text,
                        textTransform: "capitalize",
                    }}
                >
                    {formatMonthYear(value)}
                </Animated.Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={nextMonth}>
                <Ionicons
                    name="chevron-forward"
                    size={26}
                    color={COLORS.text}
                />
            </TouchableOpacity>

            <Modal transparent visible={visible} animationType="none">
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Animated.View
                        entering={SlideInUp}
                        exiting={SlideOutDown}
                        style={{
                            backgroundColor: COLORS.card,
                            borderRadius: 12,
                            padding: 20,
                            width: "80%",
                        }}
                    >
                        <FlatList
                            data={months}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        onChange(item.value);
                                        setVisible(false);
                                    }}
                                >
                                    <Text
                                        style={{
                                            padding: 10,
                                            color: COLORS.text,
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </Animated.View>
                </Animated.View>
            </Modal>
        </View>
    );
}
