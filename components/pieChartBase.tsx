import { PieChart } from "react-native-gifted-charts";

type Props = {
    data: { value: number; text: string; color: string }[];
};

export function PieChartBase({ data }: Props) {
    if (!data.length) return null;

    return (
        <PieChart
            data={data}
            showExternalLabels
            showValuesAsLabels
            donut
            // showText
            textColor="#000"
        />
    );
}
