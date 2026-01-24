export type PaymentOptions = {
    label: string;
    value: string;
};

const PAYMENT_OPTIONS: PaymentOptions[] = [
    { label: "Dinheiro", value: "dinheiro" },
    { label: "Cartão", value: "cartao" },
    { label: "Pix", value: "pix" },
];

export { PAYMENT_OPTIONS };
