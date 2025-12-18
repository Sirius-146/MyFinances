import { useAppColors } from "@/hooks/use-app-colors";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import MonthYearHeader from "../../components/MonthYearHeader";
import { CATEGORY_OPTIONS } from "../../constants/categories";
import { auth } from "../../lib/firebase";
import { getAllExpenses } from "../../services/expensesService";
import {
    deleteExpenseLocal,
    getLocalExpenses,
} from "../../services/localExpensesService";
import ExpenseCard from "../../utils/ExpensesCard";
import { mergeLocalAndRemote } from "../../utils/mergeLocalAndRemote";
import ModalExpenseDetails from "../../utils/ModalExpenseDetails";
import { isOnline } from "../../utils/network";

export default function ExpensesListScreen() {
    const COLORS = useAppColors();

    const user = auth.currentUser;

    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
            2,
            "0"
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
                `@expenses/${selectedMonth}`
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
            const cloudData = await getAllExpenses(user.uid, selectedMonth);

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
        }, [user, selectedMonth])
    );

    useEffect(() => {
        if (selectedCategory === "all") {
            setFilteredExpenses(expenses);
        } else {
            const filtered = expenses.filter(
                (item) => item.category === selectedCategory
            );
            setFilteredExpenses(filtered);
        }
    }, [selectedCategory, expenses]);

    async function handleDelete(expenseId) {
        try {
            await deleteExpenseLocal(expenseId, user.uid);
            alert("Registro excluído com sucesso!");
        } catch (error) {
            alert("Houve um problema ao excluir");
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

            {/* =============================
          DropdownPicker de Filtragem
      ============================== */}
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
                            onDeletePress={() => handleDelete(item.id)}
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
        </View>
    );
}
