import { StyleSheet } from "react-native";
import { COLORS } from "./default";

const styles = StyleSheet.create({
    container:{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000ff',
    },
    inputLogin: {
        backgroundColor:'white',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        marginVertical: 5,
        width: 250,
    },
    inputLoginPassword: {
        backgroundColor:'white',
        borderColor: 'black',
        width: 250,
    },
    viewButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    viewForm:{
        backgroundColor: COLORS.list_2,
        width: '90%',
        paddingVertical: 40,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    viewLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
        backgroundColor: '#0000008a',
        justifyContent: 'center',
        alignItems: 'center',
    },  
});

export default styles;