// =============================
// ExpenseCard.jsx (card animado reutilizável)
// =============================

import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';
import { CATEGORY_LABELS } from '../constants/categories';
import { getTheme } from '../styles/theme';
import { CategoryIcon } from './categoryIcons';

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
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {/* Valor */}
      <Text style={{ fontWeight: 'bold', fontSize: 16, color: COLORS.primary }}>
        R$ {Number(item.value).toFixed(2)}
      </Text>
    </Animated.View>
  );
}