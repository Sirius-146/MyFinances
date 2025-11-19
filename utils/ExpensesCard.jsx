// =============================
// ExpenseCard.jsx (card animado reutilizável)
// =============================

import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { CATEGORY_LABELS } from '../constants/categories';
import { getTheme } from '../styles/theme';
import { CategoryIcon } from './categoryIcons';

function parseDateAsLocal(dateStr){
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month-1, day);
}

export default function ExpenseCard({ item, onPress }) {
  const COLORS = getTheme();

  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      exiting={FadeOut.duration(200)}
      style={{
        backgroundColor: COLORS.card,
        padding: 14,
        marginBottom: 12,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
      }}
    >
      {/* Ícone da categoria */}
      <View style={{ marginRight: 14 }}>
        <CategoryIcon category={item.category} size={26} color={COLORS.primary} />
      </View>

      {/* Conteúdo */}
      <TouchableOpacity style={{ flex: 1 }} onPress={onPress}>
        <Text style={{ fontSize: 18, color: COLORS.text }}>{item.description}</Text>

        <Text style={{ color: COLORS.textSecondary }}>
          {CATEGORY_LABELS[item.category] || item.category} · {item.payment}
        </Text>

        <Text style={{ color: COLORS.textSecondary }}>
          {(() =>{
            const d = parseDateAsLocal(item.date);
            return d ? d.toLocaleDateString('pt-BR') : '';
          })()}
        </Text>
      </TouchableOpacity>

      {/* Valor */}
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.primary }}>
        R$ {Number(item.value).toFixed(2)}
      </Text>
    </Animated.View>
  );
}