// =============================
// ExpensesListScreen.jsx (compatível com EXPO ROUTER)
// =============================
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { CATEGORY_OPTIONS } from '../../constants/categories';
import { getAllExpenses } from '../../services/expensesService';
import { getUser } from '../../services/getUser';
import { getLocalExpenses } from '../../services/localExpensesService';
import { getTheme } from '../../styles/theme';
import ExpenseCard from '../../utils/ExpensesCard';

export default function ExpensesListScreen() {
  const router = useRouter();
  const COLORS = getTheme();

  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  const [openCategory, setOpenCategory] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categoryItems, setCategoryItems ] = useState([
    {label: "Todas", value: "all"},
    ...CATEGORY_OPTIONS
  ]);

  useEffect(()=>{
    getUser(setUserId);
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
  
      // Tenta carregar do Firestore
      const cloudData = await getAllExpenses(userId);
  
      if (cloudData && cloudData.length) {
        setExpenses(cloudData);
        setFilteredExpenses(cloudData);
      } else {
        const localData = await getLocalExpenses();
        setExpenses(localData);
        setFilteredExpenses(localData);
      }
    } catch (error) {
      console.log('Error in loadExpenses' + error);
      const localData = await getLocalExpenses();
      setExpenses(localData);
      setFilteredExpenses(localData);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      if(!userId) return;
      loadExpenses();
    }, [userId])
  );

  useEffect(() => {
    if(selectedCategory === "all"){
      setFilteredExpenses(expenses);
    }else{
      const filtered = expenses.filter((item) => item.category === selectedCategory);
      setFilteredExpenses(filtered);
    }
  }, [selectedCategory, expenses]);

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 50, backgroundColor: COLORS.background }}>
      <Text style={{ fontSize: 22, marginBottom: 20, color: COLORS.text }}>
        Minhas Despesas
      </Text>

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
        placeholder='Filtrar por categoria'
        style={{backgroundColor: COLORS.card, borderColor: COLORS.border, marginBottom:20}}
        dropDownContainerStyle={{backgroundColor: COLORS.card, borderColor: COLORS.border}}
        labelStyle={{color: COLORS.text}}
        listItemLabelStyle={{color: COLORS.text}}
        zIndex={999}
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
                onPress={() => router.push({ pathname: "/form", params: { id: item.id } })}
              />
            )}
          />
        )}
    </View>
  );
}