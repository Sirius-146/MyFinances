import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/constants/categories";
import { useAppColors } from "@/hooks/use-app-colors";
import { Text, View } from "react-native";

type Props = {
    categories: string[];
};

export function ChartLegend({ categories }: Props) {
    const colors = useAppColors();
    const uniqueCategories = Array.from(new Set(categories));

    if (!categories?.length) return null;

    return (
        <View
            style={{
                flexDirection: "row",
                flexWrap: "wrap",
                marginTop: 12,
            }}
        >
            {uniqueCategories.map((cat) => (
                <View
                    key={cat}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginRight: 12,
                        marginBottom: 8,
                    }}
                >
                    <View
                        style={{
                            width: 10,
                            height: 10,
                            backgroundColor: CATEGORY_COLORS[cat],
                            borderRadius: 2,
                            marginRight: 6,
                        }}
                    />
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {CATEGORY_LABELS[cat] ?? cat}
                    </Text>
                </View>
            ))}
        </View>
    );
}
