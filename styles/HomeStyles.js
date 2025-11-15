import { StyleSheet } from "react-native";
import { COLORS } from "./default";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
    },
    container1: {
        paddingVertical: 20,
        paddingHorizontal:30,
        borderRadius: 25,
        backgroundColor: '#ffffff96',
        marginBottom: 40,
    },
    homeText:{
        fontFamily: 'impact',
        fontSize: 60,
        color: COLORS.back_2,
        textAlign: 'center',
    }
});

export default styles;