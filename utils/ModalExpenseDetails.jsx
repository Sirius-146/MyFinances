import { useEffect, useState } from "react";
import { Modal, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Button, Text, TextInput } from "react-native-paper";
import { CATEGORY_OPTIONS } from "../constants/categories";
import { updateExpenseLocal } from "../services/localExpensesService";
import { getTheme } from "../styles/theme";

export default function ModalExpenseDetails({
    userId,
    visible,
    onClose,
    expense,
    onSaved,
}) {
    const COLORS = getTheme();

    const [editable, setEditable] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Campos editáveis
    const [form, setForm] = useState({
        description: "",
        value: "",
        category: "",
        date: "",
    });

    // Dropdowns
    const [openCategory, setOpenCategory] = useState(false);
    const [categoryItems, setCategoryItems] = useState(CATEGORY_OPTIONS);

    // Carregar dados ao abrir
    useEffect(() => {
        if (expense) {
            setForm({
                description: expense.description || "",
                value: String(expense.value || ""),
                category: expense.category || "",
                date: expense.date || "",
            });
            setEditable(false);
            setIsDirty(false);
        }
    }, [expense]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        try {
            await updateExpenseLocal(expense.id, form, userId);
            onSaved?.();
            onClose();
        } catch (error) {
            console.log("Erro ao salvar:", error);
        }
    };

    if (!expense) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View
                style={{
                    flex: 1,
                    backgroundColor: COLORS.modalBackground,
                    justifyContent: "center",
                    padding: 20,
                }}
            >
                <View
                    style={{
                        backgroundColor: COLORS.card,
                        padding: 20,
                        borderRadius: 12,
                        maxHeight: "90%",
                    }}
                >
                    <Text
                        style={{
                            color: COLORS.text,
                            fontSize: 20,
                            marginBottom: 20,
                        }}
                    >
                        Detalhes da Despesa
                    </Text>

                    {/* Campo: título */}
                    <TextInput
                        label="Descrição"
                        value={form.description}
                        mode="outlined"
                        disabled={!editable}
                        onChangeText={(val) => handleChange("description", val)}
                        style={{ marginBottom: 14 }}
                    />

                    {/* Campo: valor */}
                    <TextInput
                        label="Valor"
                        value={form.value}
                        mode="outlined"
                        disabled={!editable}
                        keyboardType="numeric"
                        onChangeText={(val) => handleChange("value", val)}
                        style={{ marginBottom: 14 }}
                    />

                    {/* Categoria */}
                    <DropDownPicker
                        open={openCategory}
                        value={form.category}
                        items={categoryItems}
                        setOpen={setOpenCategory}
                        setValue={(cb) => {
                            handleChange("category", cb(form.category));
                        }}
                        setItems={setCategoryItems}
                        disabled={!editable}
                        placeholder="Categoria"
                        style={{
                            backgroundColor: COLORS.input,
                            borderColor: COLORS.border,
                            marginBottom: openCategory ? 150 : 14,
                        }}
                        dropDownContainerStyle={{
                            backgroundColor: COLORS.card,
                            borderColor: COLORS.border,
                        }}
                        labelStyle={{ color: COLORS.text }}
                        listItemLabelStyle={{ color: COLORS.text }}
                    />

                    {/* Data */}
                    <TextInput
                        label="Data"
                        value={form.date}
                        mode="outlined"
                        disabled={true} // não editável no momento
                        style={{ marginBottom: 20 }}
                    />

                    {/* Botões */}
                    {!editable ? (
                        <Button
                            mode="contained"
                            onPress={() => setEditable(true)}
                            style={{
                                backgroundColor: COLORS.primary,
                                marginBottom: 10,
                            }}
                        >
                            {" "}
                            Editar
                        </Button>
                    ) : (
                        <Button
                            mode="contained"
                            onPress={handleSave}
                            disabled={!isDirty}
                            style={{
                                backgroundColor: isDirty
                                    ? COLORS.success
                                    : COLORS.disabled,
                                marginBottom: 10,
                            }}
                        >
                            {" "}
                            Salvar
                        </Button>
                    )}

                    <Button onPress={onClose} textColor={COLORS.text}>
                        Fechar
                    </Button>
                </View>
            </View>
        </Modal>
    );
}
