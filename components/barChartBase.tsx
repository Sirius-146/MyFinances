import { useAppColors } from "@/hooks/use-app-colors";
import { useWindowDimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";

type Props = {
    data: { label: string; value: number; frontColor?: string }[];
    loading?: boolean;
};

export function BarChartBase({ data, loading }: Props) {
    const colors = useAppColors();

    const safeData = data.length ? data : [{ value: 0, label: "" }];

    const { width } = useWindowDimensions();
    const barWidth = Math.max(18, (width - 80) / data.length - 8);

    const max = Math.max(...data.map((d) => d.value));
    const roundedMax = Math.ceil(max / 100) * 100;

    let steps;

    if (max <= 500) {
        steps = 50;
    } else if (max > 1000) {
        steps = 500;
    } else {
        steps = 100;
    }
    const stepValue = steps;
    const noOfSections = roundedMax / stepValue;

    return (
        <BarChart
            data={safeData}
            stepValue={stepValue}
            maxValue={roundedMax}
            noOfSections={noOfSections}
            barWidth={barWidth}
            spacing={5}
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisLabelPrefix="R$"
            yAxisLabelWidth={45}
            backgroundColor={colors.background}
            yAxisTextStyle={{ fontSize: 10, color: colors.textSecondary }}
        />
    );
}
