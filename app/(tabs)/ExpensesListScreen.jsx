// =============================
// ExpensesListScreen.jsx (compatível com EXPO ROUTER)
// =============================
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { getAllExpenses } from '../../services/expensesService';
import { getUser } from '../../services/getUser';
import { getLocalExpenses } from '../../services/localExpensesService';
import { getTheme } from '../../styles/theme';
import ExpenseCard from '../../utils/ExpensesCard';

export default function ExpensesListScreen() {
  const router = useRouter();
  const COLORS = getTheme();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState('');
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
      } else {
        // Caso offline, carrega do AsyncStorage
        const localData = await getLocalExpenses();
        setExpenses(localData);
      }
    } catch (error) {
      console.log('The error is here' + error);
      const localData = await getLocalExpenses();
      setExpenses(localData);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      if(!userId) return;
      loadExpenses();
    }, [userId])
  );

  return (
    <View style={{ flex: 1, padding: 20, paddingTop: 50, backgroundColor: COLORS.background }}>
      <Text style={{ fontSize: 22, marginBottom: 20, color: COLORS.text }}>
        Minhas Despesas
      </Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={expenses}
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