import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

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
    const final = date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
    const m = final.split(" ")[0];
    const y = final.split(" ")[2];
    return `${m} - ${y}`;
}

export default function MonthYearHeader({ value, onChange, COLORS }) {
    const [direction, setDirection] = useState("right"); //controla slide

    const [openMonthList, setOpenMonthList] = useState(false);

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

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={prevMonth}>
                <Ionicons name="chevron-back" size={26} color={COLORS.text} />
            </TouchableOpacity>

            <View style={{ width: "80%", alignItems: "center" }}>
                <DropDownPicker
                    open={openMonthList}
                    value={value}
                    items={months}
                    setOpen={setOpenMonthList}
                    setValue={onChange}
                    setItems={() => {}}
                    listMode="SCROLLVIEW"
                    showArrowIcon={false}
                    showTickIcon={false}
                    placeholder={formatMonthYear(value)}
                    style={styles.dropdown}
                    textStyle={{ ...styles.dropdownText, color: COLORS.text }}
                    dropDownContainerStyle={{
                        backgroundColor: COLORS.card,
                        borderColor: COLORS.border,
                        borderTopWidth: 0,
                        borderRadius: 12,
                        marginTop: 8,
                    }}
                    listItemLabelStyle={{ color: COLORS.text }}
                    selectedItemLabelStyle={{
                        fontWeight: "bold",
                        color: COLORS.primary ?? COLORS.text,
                    }}
                    // zIndex={901}
                />
            </View>

            <TouchableOpacity onPress={nextMonth}>
                <Ionicons
                    name="chevron-forward"
                    size={26}
                    color={COLORS.text}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    dropdown: {
        backgroundColor: "transparent",
        borderWidth: 0,
        minHeight: 40,
    },
    dropdownText: {
        fontSize: 18,
        fontWeight: "bold",
        textTransform: "capitalize",
        textAlign: "center",
    },
});
