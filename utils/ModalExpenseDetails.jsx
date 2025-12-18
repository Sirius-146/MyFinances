import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal, TextInput, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import * as yup from "yup";

import { CATEGORY_OPTIONS } from "../constants/categories";
import { updateExpenseLocal } from "../services/localExpensesService";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppColors } from "@/hooks/use-app-colors";
import IconButton from "./IconButton";
import ModernButton from "./ModernButton";

import styles from "../styles/FormStyles";

// ----------------------------
// VALIDAÇÃO
// ----------------------------
const schema = yup.object({
    description: yup.string().max(200, "Máx. 200 caracteres."),
    value: yup
        .number()
        .min(0.01, "Informe um valor válido.")
        .required("Valor obrigatório."),
    category: yup.string().required("Categoria obrigatória."),
});

export default function ModalExpenseDetails({
    userId,
    visible,
    onClose,
    expense,
    onSaved,
}) {
    const COLORS = useAppColors();

    const [editable, setEditable] = useState(false);
    const [openCategory, setOpenCategory] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: {
            description: "",
            value: 0,
            category: "",
        },
    });

    useEffect(() => {
        if (expense) {
            reset({
                description: expense.description || "",
                value: expense.value || 0,
                category: expense.category || "",
            });
            setEditable(false);
        }
    }, [expense, reset]);

    async function onSubmit(data) {
        await updateExpenseLocal(expense.id, data, userId);
        onSaved?.();
        onClose();
    }

    if (!expense) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <ThemedView style={styles.card}>
                    <View style={styles.header}>
                        <ThemedText
                            style={[styles.title, { color: COLORS.text }]}
                        >
                            Detalhes da Despesa
                        </ThemedText>

                        <IconButton
                            onPress={onClose}
                            icon="times-circle"
                            color={COLORS.icon}
                            backgroundColor={COLORS.background}
                        />
                    </View>

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
                                    editable={editable}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholder="Descrição"
                                    placeholderTextColor={COLORS.placeholder}
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: COLORS.inputBg,
                                            borderColor: COLORS.border,
                                            color: COLORS.text,
                                        },
                                    ]}
                                />
                                {errors.description && (
                                    <ThemedText style={styles.error}>
                                        {errors.description.message}
                                    </ThemedText>
                                )}
                            </>
                        )}
                    />

                    {/* VALOR */}
                    <Controller
                        control={control}
                        name="value"
                        render={({ field: { onChange, value } }) => (
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
                                    editable={editable}
                                    keyboardType="numeric"
                                    value={String(value)}
                                    onChangeText={(v) =>
                                        onChange(Number(v.replace(",", ".")))
                                    }
                                    placeholder="0,00"
                                    placeholderTextColor={COLORS.placeholder}
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
                        )}
                    />

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
                                    disabled={!editable}
                                    placeholder="Categoria"
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

                    {/* DATA (SOMENTE VISUAL) */}
                    <ThemedText style={[styles.label, { color: COLORS.text }]}>
                        Data
                    </ThemedText>
                    <TextInput
                        editable={false}
                        value={expense.date}
                        style={[
                            styles.input,
                            {
                                backgroundColor: COLORS.inputBg,
                                borderColor: COLORS.border,
                                color: COLORS.text,
                            },
                        ]}
                    />

                    {/* BOTÕES */}
                    {!editable ? (
                        <View style={{ width: "60%", alignSelf: "center" }}>
                            <ModernButton
                                text="Editar"
                                onPress={() => setEditable(true)}
                                icon="edit"
                            />
                        </View>
                    ) : (
                        <View
                            style={{
                                width: "60%",
                                alignSelf: "center",
                            }}
                        >
                            <ModernButton
                                text="Atualizar"
                                onPress={handleSubmit(onSubmit)}
                                icon="save"
                                disabled={!isDirty}
                            />
                        </View>
                    )}
                </ThemedView>
            </View>
        </Modal>
    );
}
