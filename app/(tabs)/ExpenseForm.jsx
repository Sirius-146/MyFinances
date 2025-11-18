import DateTimePicker from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";
import { COLORS } from "../../styles/default";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { CATEGORY_OPTIONS } from "../../constants/categories";
import { createExpense, updateExpense } from "../../services/expensesService";
import { getUser } from '../../services/getUser';

// ----------------------------
// VALIDAÇÃO COM YUP
// ----------------------------
const schema = yup.object({
  category: yup.string().required("Selecione uma categoria."),
  value: yup
    .number()
    .typeError("Informe um valor numérico.")
    .positive("O valor deve ser positivo.")
    .required("Valor é obrigatório."),
  date: yup.string().required("A data é obrigatória."),
  description: yup.string().max(200, "Máximo de 200 caracteres."),
  payment: yup.string().required("Informe a forma de pagamento"),
});

const PAYMENT_OPTIONS = [
  { label: "Dinheiro", value: "dinheiro" },
  { label: "Cartão", value: "cartao" },
  { label: "Pix", value: "pix" },
];


export default function ExpenseForm({ existingData = null }) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      category: existingData?.category || "",
      value: existingData?.value?.toString() || "",
      date: existingData?.date || "",
      description: existingData?.description || "",
      payment: existingData?.payment || "",
    },
    resolver: yupResolver(schema),
    mode: "onChange",
  });

  
  const [userId, setUserId] = useState('');
  useEffect(()=>{
    getUser(setUserId);
  }, []);

  // Estado do dropdown
  const [openCategory, setOpenCategory] = useState(false);

  // Estado do DatePicker
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [openPayment, setOpenPayment] = useState(false);

  // ----------------------------
  // Funções genéricas simulando banco
  // ----------------------------
  const handleCreate = (payload) => {
    createExpense(userId, payload);
  };

  const handleUpdate = (id, payload) => {
    updateExpense(userId, id, payload);
  };

  const onSubmit = (data) => {
    if (existingData?.id) {
      handleUpdate(existingData.id, data);
    } else {
      handleCreate(data);
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Card style={{ padding: 16 }}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>
          {existingData ? "Editar Despesa" : "Registrar Despesa"}
        </Text>

        {/* ----------------------------
            CATEGORIA (DROPDOWN PICKER)
        ----------------------------- */}
        <Text style={{ marginBottom: 4 }}>Categoria</Text>

        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <>
              <DropDownPicker
                open={openCategory}
                value={value}
                items={CATEGORY_OPTIONS}
                setOpen={setOpenCategory}
                setValue={(callback) => {
                  const val = callback(value);
                  onChange(val);
                }}
                placeholder="Selecione uma categoria"
                style={{ marginBottom: errors.category ? 0 : 16 }}
              />
              {errors.category && (
                <HelperText type="error">
                  {errors.category.message}
                </HelperText>
              )}
            </>
          )}
        />

        {/* ----------------------------
            VALOR
        ----------------------------- */}
        <Controller
          control={control}
          name="value"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                label="Valor (R$)"
                mode="outlined"
                keyboardType="numeric"
                value={value}
                onChangeText={onChange}
                style={{ marginTop: 8 }}
              />
              {errors.value && (
                <HelperText type="error">{errors.value.message}</HelperText>
              )}
            </>
          )}
        />

        {/* ----------------------------
            DATA (DATE PICKER)
        ----------------------------- */}
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <TextInput
                    label="Data"
                    mode="outlined"
                    value={value}
                    editable={false}
                    pointerEvents="none"
                    style={{ marginTop: 8 }}
                />
              </TouchableOpacity>

              {errors.date && (
                <HelperText type="error">{errors.date.message}</HelperText>
              )}

              {showDatePicker && (
                <DateTimePicker
                  mode="date"
                  display="calendar"
                  value={
                    value ? new Date(value) : new Date()
                  }
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const iso = selectedDate.toISOString().split("T")[0];
                      onChange(iso);
                    }
                  }}
                />
              )}
            </>
          )}
        />

        {/* ----------------------------
            DESCRIÇÃO
        ----------------------------- */}
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <>
              <TextInput
                label="Descrição (opcional)"
                mode="outlined"
                value={value}
                onChangeText={onChange}
                multiline
                style={{ marginTop: 8 }}
              />
              {errors.description && (
                <HelperText type="error">
                  {errors.description.message}
                </HelperText>
              )}
            </>
          )}
        />

        {/* ---------------------------------------
          FORMA DE PAGAMENTO (DROPDOWN)
        ---------------------------------------- */}
        <Text style={{ marginBottom: 4, marginTop: 10 }}>Forma de Pagamento</Text>

        <Controller
          control={control}
          name="payment"
          render={({ field: { onChange, value } }) => (
            <>
              <DropDownPicker
                open={openPayment}  // você vai adicionar esse state logo abaixo
                value={value}
                items={PAYMENT_OPTIONS}
                setOpen={setOpenPayment}
                setValue={(callback) => {
                  const val = callback(value);
                  onChange(val);
                }}
                placeholder="Selecione a forma de pagamento"
                style={{
                  marginBottom: errors.payment ? 0 : 16,
                }}
              />

              {errors.payment && (
                <HelperText type="error">
                  {errors.payment.message}
                </HelperText>
              )}
            </>
          )}
        />

        {/* ----------------------------
            BOTÃO DE ENVIO
        ----------------------------- */}
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
          style={{ marginTop: 20, backgroundColor: COLORS.buttons, color: '#FFF'}}
        >
          {existingData ? "Salvar Alterações" : "Registrar"}
        </Button>
      </Card>
    </View>
  );
}
