const CATEGORY_OPTIONS = [
  { label: "Alimentação", value: "alimentacao" },
  { label: "Transporte", value: "transporte" },
  { label: "Lazer", value: "lazer" },
  { label: "Compras", value: "compras" },
  { label: "Moradia", value: "moradia" },
  { label: "Saúde", value: "saude" },
  { label: "Educação", value: "educacao" },
  { label: "Outros", value: "outros" },
];

const CATEGORY_LABELS = CATEGORY_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

export { CATEGORY_LABELS, CATEGORY_OPTIONS };
