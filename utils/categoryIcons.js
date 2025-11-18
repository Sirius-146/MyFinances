// =============================
// categoryIcons.js (mapa de ícones FontAwesome5)
// =============================
import { FontAwesome5 } from '@expo/vector-icons';

export const categoryIcons = {
  "alimentacao": "utensils",
  "transporte": "car",
  "lazer": "gamepad",
  "compras": "shopping-bag",
  "saude": "heartbeat",
  "moradia": "home",
  "educacao": "book",
  "Outros": "ellipsis-h",
};

export function CategoryIcon({ category, color = "#000", size = 20 }) {
  const iconName = categoryIcons[category] || "ellipsis-h";
  return <FontAwesome5 name={iconName} size={size} color={color} />;
}