import { BarChart } from "react-native-gifted-charts";

type Props = {
    data: { label: string; value: number; frontColor?: string }[];
};

export function BarChartBase({ data }: Props) {
    if (!data.length) return null;

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

    return (
        <BarChart
            data={data}
            stepValue={steps}
            maxValue={roundedMax}
            noOfSections={10}
            barWidth={50}
            spacing={10}
            // isAnimated
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisLabelSuffix=",00"
            yAxisLabelPrefix="R$"
            yAxisLabelWidth={60}
            yAxisTextStyle={{ fontSize: 12 }}
        />
    );
}
