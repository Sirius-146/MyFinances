import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function WelcomeOnboardingModal({ visible, onFinish }) {
    const [step, setStep] = useState(1);

    function handleNext() {
        if (step < 3) {
            setStep(step + 1);
        } else {
            setStep(1);
            onFinish();
        }
    }

    function renderContent() {
        switch (step) {
            case 1:
                return (
                    <>
                        <Ionicons
                            name="wallet-outline"
                            size={48}
                            color={"#4CAF50"}
                        />
                        <Text style={styles.title}>Bem-vindo!</Text>
                        <Text style={styles.text}>
                            Sua conta foi criada com sucesso.
                            {"\n\n"}
                            Aqui você terá controle total sobre seus ganhos e
                            gastos.
                        </Text>
                    </>
                );
            case 2:
                return (
                    <>
                        <Ionicons
                            name="stats-chart-outline"
                            size={48}
                            color={"#2196F3"}
                        />
                        <Text style={styles.title}>Como o app funciona</Text>
                        <Text style={styles.text}>
                            • Registre despesas e receitas{"\n"}• Acompanhe sua
                            evolução mensal{"\n"}• Visualize seus dados de forma
                            clara e simples
                        </Text>
                    </>
                );
            case 3:
                return (
                    <>
                        <Ionicons
                            name="rocket-outline"
                            size={48}
                            color={"#FF9800"}
                        />
                        <Text style={styles.title}>Comece agora</Text>
                        <Text style={styles.text}>
                            Quanto antes você registrar seus dados,
                            {"\n"}
                            melhor será sua visão financeira.
                        </Text>
                    </>
                );
            default:
                return null;
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {renderContent()}

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleNext}
                    >
                        <Text style={styles.buttonText}>
                            {step === 3 ? "Vamos lá" : "Continuar"}
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.stepIndicator}>{step} / 3</Text>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        width: "90%",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 12,
        textAlign: "center",
    },
    text: {
        fontSize: 15,
        color: "#555",
        textAlign: "center",
        marginBottom: 24,
    },
    button: {
        backgroundColor: "#4CAF50",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    stepIndicator: {
        marginTop: 16,
        fontSize: 12,
        color: "#999",
    },
});
