import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import {
    Keyboard,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

import ModernButton from "../../utils/ModernButton";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/use-app-colors";

import { CATEGORY_OPTIONS } from "../../constants/categories";
import { PAYMENT_OPTIONS } from "../../constants/payments";
import { auth } from "../../lib/firebase";
import { saveExpenseLocal } from "../../services/localExpensesService";

import styles from "../../styles/FormStyles";
import { ToastMessage } from "../../utils/ToastMessage";

// ----------------------------
// VALIDAÇÃO
// ----------------------------
const schema = yup.object({
    category: yup.string().required("Selecione uma categoria."),
    value: yup
        .number()
        .min(1, "Informe um valor maior que zero.")
        .typeError("Informe um valor numérico.")
        .positive("O valor deve ser positivo.")
        .required("Valor é obrigatório."),
    date: yup.string().required("A data é obrigatória."),
    description: yup.string().max(200, "Máximo de 200 caracteres."),
    payment: yup.string().required("Informe a forma de pagamento."),
});

function formatCurrencyFromCents(cents) {
    const value = (cents / 100).toFixed(2);
    return value.replace(".", ",");
}

function onlyNumbers(text) {
    return Number(text.replace(/\D/g, "")) || 0;
}

export default function ExpenseForm() {
    const COLORS = useAppColors();

    const user = auth.currentUser;

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: {
            category: "",
            value: 0,
            date: "",
            description: "",
            payment: "",
        },
        resolver: yupResolver(schema),
        mode: "onChange",
    });

    const [openCategory, setOpenCategory] = useState(false);
    const [openPayment, setOpenPayment] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    function onSubmit(data) {
        const payload = {
            ...data,
            value: data.value / 100,
        };
        saveExpenseLocal(payload, user.uid);

        setToastMessage("Registro criado com sucesso!");
        setToastVisible(true);
        // setToastType("success");
        // } catch (error) {
        //     setToastMessage("Erro ao criar registro");
        //     setToastVisible(true);
        //     setToastType("error");
        // } finally {
        reset();
        setOpenCategory(false);
        setOpenPayment(false);
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.screen}>
                <ThemedView style={styles.card}>
                    <ThemedText style={[styles.title, { color: COLORS.text }]}>
                        Registrar Despesa
                    </ThemedText>

                    {/* CATEGORIA */}
                    <ThemedText style={[styles.label, { color: COLORS.text }]}>
                        Categoria
                    </ThemedText>

                    <Controller
                        control={control}
                        name="category"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <DropDownPicker
                                    open={openCategory}
                                    value={value}
                                    items={CATEGORY_OPTIONS}
                                    setOpen={setOpenCategory}
                                    setValue={(cb) => onChange(cb(value))}
                                    onOpen={Keyboard.dismiss}
                                    placeholder="Selecione uma categoria"
                                    style={{
                                        backgroundColor: COLORS.inputBg,
                                        borderColor: COLORS.border,
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: COLORS.inputBg,
                                        borderColor: COLORS.border,
                                    }}
                                    textStyle={{ color: COLORS.text }}
                                />
                                {errors.category && (
                                    <ThemedText style={styles.error}>
                                        {errors.category.message}
                                    </ThemedText>
                                )}
                            </>
                        )}
                    />

                    {/* VALOR */}
                    <Controller
                        control={control}
                        name="value"
                        render={({ field: { onChange, value } }) => {
                            const cents = Number(value) || 0;
                            const formattedValue =
                                formatCurrencyFromCents(cents);

                            return (
                                <>
                                    <ThemedText
                                        style={[
                                            styles.label,
                                            { color: COLORS.text },
                                        ]}
                                    >
                                        Valor
                                    </ThemedText>

                                    <TextInput
                                        value={formattedValue}
                                        keyboardType="numeric"
                                        placeholder="0,00"
                                        placeholderTextColor={
                                            COLORS.placeholder
                                        }
                                        onChangeText={(text) => {
                                            const numericValue =
                                                onlyNumbers(text);
                                            onChange(numericValue);
                                        }}
                                        style={[
                                            styles.input,
                                            {
                                                backgroundColor: COLORS.inputBg,
                                                borderColor: COLORS.border,
                                                color: COLORS.text,
                                            },
                                        ]}
                                    />
                                    {errors.value && (
                                        <ThemedText style={styles.error}>
                                            {errors.value.message}
                                        </ThemedText>
                                    )}
                                </>
                            );
                        }}
                    />

                    {/* DATA */}
                    <Controller
                        control={control}
                        name="date"
                        render={({ field: { onChange, value } }) => {
                            const formatted = value
                                ? value.split("-").reverse().join("/")
                                : "";

                            return (
                                <>
                                    <ThemedText
                                        style={[
                                            styles.label,
                                            { color: COLORS.text },
                                        ]}
                                    >
                                        Data
                                    </ThemedText>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Keyboard.dismiss();
                                            setShowDatePicker(true);
                                        }}
                                    >
                                        <TextInput
                                            value={formatted}
                                            editable={false}
                                            placeholder="Data"
                                            placeholderTextColor={
                                                COLORS.placeholder
                                            }
                                            style={[
                                                styles.input,
                                                {
                                                    backgroundColor:
                                                        COLORS.inputBg,
                                                    borderColor: COLORS.border,
                                                    color: COLORS.text,
                                                },
                                            ]}
                                        />
                                    </TouchableOpacity>

                                    {errors.date && (
                                        <ThemedText style={styles.error}>
                                            {errors.date.message}
                                        </ThemedText>
                                    )}

                                    {showDatePicker && (
                                        <DateTimePicker
                                            mode="date"
                                            value={
                                                value
                                                    ? new Date(value)
                                                    : new Date()
                                            }
                                            onChange={(_, selected) => {
                                                setShowDatePicker(false);
                                                if (!selected) return;

                                                const y =
                                                    selected.getFullYear();
                                                const m = String(
                                                    selected.getMonth() + 1,
                                                ).padStart(2, "0");
                                                const d = String(
                                                    selected.getDate(),
                                                ).padStart(2, "0");

                                                onChange(`${y}-${m}-${d}`);
                                            }}
                                        />
                                    )}
                                </>
                            );
                        }}
                    />

                    {/* DESCRIÇÃO */}
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <ThemedText
                                    style={[
                                        styles.label,
                                        { color: COLORS.text },
                                    ]}
                                >
                                    Descrição
                                </ThemedText>
                                <TextInput
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                    placeholder="Descrição (opcional)"
                                    placeholderTextColor={COLORS.placeholder}
                                    style={[
                                        styles.input,
                                        styles.multiline,
                                        {
                                            backgroundColor: COLORS.inputBg,
                                            borderColor: COLORS.border,
                                            color: COLORS.text,
                                        },
                                    ]}
                                />
                            </>
                        )}
                    />

                    {/* PAGAMENTO */}
                    <ThemedText style={[styles.label, { color: COLORS.text }]}>
                        Forma de pagamento
                    </ThemedText>

                    <Controller
                        control={control}
                        name="payment"
                        render={({ field: { onChange, value } }) => (
                            <>
                                <DropDownPicker
                                    open={openPayment}
                                    value={value}
                                    items={PAYMENT_OPTIONS}
                                    setOpen={setOpenPayment}
                                    setValue={(cb) => onChange(cb(value))}
                                    onOpen={Keyboard.dismiss}
                                    placeholder="Selecione a forma de pagamento"
                                    style={{
                                        backgroundColor: COLORS.inputBg,
                                        borderColor: COLORS.border,
                                    }}
                                    dropDownContainerStyle={{
                                        backgroundColor: COLORS.inputBg,
                                        borderColor: COLORS.border,
                                    }}
                                    textStyle={{ color: COLORS.text }}
                                />
                                {errors.payment && (
                                    <ThemedText style={styles.error}>
                                        {errors.payment.message}
                                    </ThemedText>
                                )}
                            </>
                        )}
                    />
                </ThemedView>
                <View
                    style={{ width: "60%", alignSelf: "center", marginTop: 20 }}
                >
                    <ModernButton
                        text="Registrar"
                        onPress={handleSubmit(onSubmit)}
                        icon="save"
                        disabled={!isValid}
                        colors={!isValid ? undefined : ["#007bff", "#0056d6"]}
                    />
                </View>
                <ToastMessage
                    visible={toastVisible}
                    message={toastMessage}
                    type={toastType}
                    onHide={() => setToastVisible(false)}
                />
            </ThemedView>
        </TouchableWithoutFeedback>
    );
}
