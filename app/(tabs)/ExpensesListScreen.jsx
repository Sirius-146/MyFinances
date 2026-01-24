import { useAppColors } from "@/hooks/use-app-colors";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MonthYearHeader from "../../components/MonthYearHeader";
import { CATEGORY_OPTIONS } from "../../constants/categories";
import { auth } from "../../lib/firebase";
import { getMonthExpenses } from "../../services/expensesService";
import {
    deleteExpenseLocal,
    getLocalExpenses,
} from "../../services/localExpensesService";
import ExpenseCard from "../../utils/ExpensesCard";
import { mergeLocalAndRemote } from "../../utils/mergeLocalAndRemote";
import ModalExpenseDetails from "../../utils/ModalExpenseDetails";
import { isOnline } from "../../utils/network";
import { ToastMessage } from "../../utils/ToastMessage";

export default function ExpensesListScreen() {
    const COLORS = useAppColors();

    const user = auth.currentUser;

    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0",
        )}`;
    });

    const [openCategory, setOpenCategory] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [categoryItems, setCategoryItems] = useState([
        { label: "Todas", value: "all" },
        ...CATEGORY_OPTIONS,
    ]);

    const loadExpenses = async () => {
        try {
            setLoading(true);

            // 1) Carregar sempre do armazenamento local
            const localData = await getLocalExpenses(
                user.uid,
                `@expenses/${selectedMonth}`,
            );
            setExpenses(localData);
            setFilteredExpenses(localData);

            // 2) Se não tiver internet -> encerra
            const IsOnline = await isOnline();
            if (!IsOnline) {
                setLoading(false);
                return;
            }

            // 3) Bucar do Firestore (apenas mês atual):
            const cloudData = await getMonthExpenses(user.uid, selectedMonth);

            // 4) Mesclar dados
            const merged = mergeLocalAndRemote(localData, cloudData);

            // 5) Salvar cache atualizado
            // A ser implantado no futuro

            // 6) Exibir
            setExpenses(merged);
            setFilteredExpenses(merged);
        } catch (error) {
            console.log("Error in loadExpenses" + error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (!user) return;
            loadExpenses();
        }, [user, selectedMonth]),
    );

    useEffect(() => {
        if (selectedCategory === "all") {
            setFilteredExpenses(expenses);
        } else {
            const filtered = expenses.filter(
                (item) => item.category === selectedCategory,
            );
            setFilteredExpenses(filtered);
        }
    }, [selectedCategory, expenses]);

    function sumExpenses() {
        let total = 0;
        for (let expense of filteredExpenses) {
            total += expense.value;
        }
        return total;
    }

    async function handleDelete(expenseId) {
        try {
            await deleteExpenseLocal(expenseId, user.uid);
            setToastMessage("Registro excluído com sucesso!");
            setToastVisible(true);
        } catch (error) {
            setToastMessage("Houve um problema ao excluir");
            setToastVisible(true);
            setToastType("error");
            console.log(error);
        } finally {
            loadExpenses();
        }
    }

    return (
        <View
            style={{
                flex: 1,
                padding: 20,
                paddingTop: 50,
                backgroundColor: COLORS.background,
            }}
        >
            <Text
                style={{ fontSize: 22, marginBottom: 20, color: COLORS.text }}
            >
                Minhas Despesas
            </Text>

            <MonthYearHeader
                value={selectedMonth}
                onChange={setSelectedMonth}
                COLORS={COLORS}
            />

            {/* ============================= DropdownPicker de Filtragem ============================== */}
            <DropDownPicker
                open={openCategory}
                value={selectedCategory}
                items={categoryItems}
                setOpen={setOpenCategory}
                setValue={setSelectedCategory}
                setItems={setCategoryItems}
                placeholder="Filtrar por categoria"
                style={{
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.border,
                    marginBottom: 20,
                }}
                dropDownContainerStyle={{
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.border,
                }}
                labelStyle={{ color: COLORS.text }}
                listItemLabelStyle={{ color: COLORS.text }}
                zIndex={100}
            />
            <View
                style={{
                    backgroundColor: COLORS.card,
                    alignItems: "center",
                    paddingVertical: 10,
                    marginBlockEnd: 5,
                    borderRadius: 12,
                }}
            >
                <Text
                    style={{
                        fontSize: 18,
                        color: COLORS.text,
                    }}
                >
                    Total:{" "}
                    <Text
                        style={{
                            color: COLORS.icon,
                        }}
                    >
                        R$
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "bold",
                            }}
                        >
                            {Number(sumExpenses()).toFixed(2)}
                        </Text>
                    </Text>
                </Text>
            </View>
            {loading ? (
                <ActivityIndicator size="large" />
            ) : (
                <FlatList
                    data={filteredExpenses}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <ExpenseCard
                            item={item}
                            onPress={() => {
                                setSelectedExpense(item);
                                setShowModal(true);
                            }}
                            onDeletePress={() => {
                                setSelectedExpense(item);
                                setShowDeleteModal(true);
                            }}
                            colors={COLORS}
                        />
                    )}
                />
            )}
            <ModalExpenseDetails
                userId={user.uid}
                visible={showModal}
                onClose={() => setShowModal(false)}
                expense={selectedExpense}
                onSaved={() => {
                    loadExpenses();
                }}
            />

            <ToastMessage
                visible={toastVisible}
                message={toastMessage}
                type={toastType}
                onHide={() => setToastVisible(false)}
            />

            <Modal visible={showDeleteModal} transparent animationType="fade">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 25,
                    }}
                >
                    <View
                        style={{
                            width: "100%",
                            borderRadius: 14,
                            padding: 20,
                            backgroundColor: "#fff",
                        }}
                    >
                        <Text style={{ fontSize: 16, paddingBottom: 10 }}>
                            Confirma a exclusão?
                        </Text>

                        <View style={{ flexDirection: "row" }}>
                            <TouchableOpacity
                                onPress={() => setShowDeleteModal(false)}
                                style={{
                                    flex: 1,
                                    marginRight: 8,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: "center",
                                    backgroundColor: "#ccc",
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: "bold",
                                        color: "#fff",
                                    }}
                                >
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={async () => {
                                    await handleDelete(selectedExpense.id);
                                    setShowDeleteModal(false);
                                    setSelectedExpense(null);
                                }}
                                style={{
                                    flex: 1,
                                    marginLeft: 8,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: "center",
                                    backgroundColor: "#d9534f",
                                }}
                            >
                                <Text
                                    style={{
                                        fontWeight: "bold",
                                        color: "#fff",
                                    }}
                                >
                                    Excluir
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
