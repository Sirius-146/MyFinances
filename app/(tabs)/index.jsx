import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import { BarChartBase } from "../../components/barChartBase";
import { ChartLegend } from "../../utils/ChartLegend";

import { useCallback, useEffect, useState } from "react";
import WelcomeOnboardingModal from "../../utils/WelcomeOnboardingModal";

import { useAppColors } from "@/hooks/use-app-colors";
import { useExpensesCharts } from "@/hooks/use-expense-chart";
import { auth } from "@/lib/firebase";
import { getLocalExpenses } from "@/services/localExpensesService";
import { useFocusEffect, useLocalSearchParams } from "expo-router";

import { getAllExpenses } from "@/services/expensesService";
import { isOnline } from "../../utils/network";

import { mergeLocalAndRemote } from "../../utils/mergeLocalAndRemote";

function ChartToggleButton({ label, active, onPress }) {
    const colors = useAppColors();

    return (
        <Pressable
            onPress={onPress}
            style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                marginRight: 8,
                borderRadius: 8,
                backgroundColor: active ? colors.primary : colors.surface,
            }}
        >
            <Text
                style={{
                    color: active ? colors.tint : colors.text,
                    fontWeight: "500",
                }}
            >
                {label}
            </Text>
        </Pressable>
    );
}

// type ChartView = "category" | "month";

export default function HomeScreen() {
    const user = auth.currentUser;

    const [loading, setLoading] = useState(true);

    const COLORS = useAppColors();
    const { justRegistered } = useLocalSearchParams();
    const [welcomeVisible, setWelcomeVisible] = useState(false);

    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    const [chartView, setChartView] = useState("category");

    const { byCategory, byCategoryBars, byMonth } =
        useExpensesCharts(filteredExpenses);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0",
        )}`;
    });

    const loadExpenses = async () => {
        try {
            setLoading(true);
            // 1) Carregar sempre do armazenamento local
            const localData = await getLocalExpenses(
                user.uid,
                `@expenses/${selectedMonth}`,
            );
            setExpenses(localData);
            setFilteredExpenses(localData);

            // 2) Se não tiver internet -> encerra
            const IsOnline = await isOnline();
            if (!IsOnline) {
                // setLoading(false);
                return;
            }

            // 3) Bucar do Firestore (apenas mês atual):
            const cloudData = await getAllExpenses(user.uid, selectedMonth);

            // 4) Mesclar dados
            const merged = mergeLocalAndRemote(localData, cloudData);

            // 5) Salvar cache atualizado
            // A ser implantado no futuro

            // 6) Exibir
            setExpenses(merged);
            setFilteredExpenses(merged);
        } catch (error) {
            console.log("Error in loadExpenses" + error);
        } finally {
            setLoading(false);
        }
    };
    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            loadExpenses();
        }, [user, selectedMonth]),
    );

    useEffect(() => {
        if (justRegistered === "true") {
            setWelcomeVisible(true);
        }
    }, [justRegistered]);

    if (loading) {
        return <ActivityIndicator />;
    }

    return (
        // <ParallaxScrollView
        //     headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
        //     headerImage={
        //         <Image
        //             source={require("@/assets/images/partial-react-logo.png")}
        //             style={styles.reactLogo}
        //         />
        //     }
        // >
        //     <ThemedView style={styles.titleContainer}>
        //         <ThemedText type="title">Welcome!</ThemedText>
        //         <HelloWave />
        //     </ThemedView>
        // </ParallaxScrollView>

        <View style={{ flex: 1, backgroundColor: COLORS.background }}>
            <ScrollView>
                <View style={{ paddingTop: 50, paddingHorizontal: 10 }}>
                    <View style={{ flexDirection: "row", marginBottom: 12 }}>
                        <ChartToggleButton
                            label="Por categoria"
                            active={chartView === "category"}
                            onPress={() => setChartView("category")}
                        />
                        <ChartToggleButton
                            label="Por mês"
                            active={chartView === "month"}
                            onPress={() => setChartView("month")}
                        />
                    </View>

                    <View>
                        {chartView === "category" && (
                            <BarChartBase data={byCategoryBars} />
                        )}

                        {chartView === "month" && (
                            <BarChartBase data={byMonth} />
                        )}
                    </View>

                    {chartView === "category" && (
                        <ChartLegend
                            categories={byCategoryBars.map((b) => b.category)}
                        />
                    )}

                    {/* <LineChart
                    data={data}
                    color="#00f0ff"
                    thickness={3}
                    hideDataPoints={false}
                    isAnimated
                    /> */}
                    {/* 
                    <PieChartBase data={byCategory} />

                    {byCategory.length > 0 && (
                        <PieChart
                            data={byCategory}
                            donut
                            showText
                            textColor="#000"
                        />
                    )} */}
                </View>
            </ScrollView>
            {/* 
              Conteúdo da Home virá aqui futuramente 
              (dashboard, resumo financeiro, etc.)
            */}
            <WelcomeOnboardingModal
                visible={welcomeVisible}
                onFinish={() => setWelcomeVisible(false)}
            />
        </View>
    );
}
