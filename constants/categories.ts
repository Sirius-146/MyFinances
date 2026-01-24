export type CategoryOptions = {
    label: string;
    value: string;
    color: string;
};

const CATEGORY_OPTIONS: CategoryOptions[] = [
    { label: "Alimentação", value: "alimentacao", color: "#FF9800" }, // Laranja
    { label: "Transporte", value: "transporte", color: "#03A9F4" }, // Azul Claro
    { label: "Lazer", value: "lazer", color: "#E91E63" }, // Rosa
    { label: "Compras", value: "compras", color: "#00BCD4" }, // Ciano
    { label: "Moradia", value: "moradia", color: "#4CAF50" }, // Verde
    { label: "Saúde", value: "saude", color: "#F44336" }, // Vermelho
    { label: "Educação", value: "educacao", color: "#673AB7" }, // Roxo
    { label: "Outros", value: "outros", color: "#9E9E9E" }, // Cinza
];

const CATEGORY_LABELS = CATEGORY_OPTIONS.reduce<Record<string, string>>(
    (acc, item) => {
        acc[item.value] = item.label;
        return acc;
    },
    {}
);

const CATEGORY_COLORS = CATEGORY_OPTIONS.reduce<Record<string, string>>(
    (acc, item) => {
        acc[item.value] = item.color;
        return acc;
    },
    {}
);

export { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_OPTIONS };
