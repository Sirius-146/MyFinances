import DateTimePicker from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Keyboard, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Button, Card, HelperText, Text, TextInput } from "react-native-paper";

import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

import { useThemeColor } from "@/hooks/use-theme-color";
import { CATEGORY_OPTIONS } from "../../constants/categories";
import { PAYMENT_OPTIONS } from "../../constants/payments";
import { auth } from "../../lib/firebase";
import { saveExpenseLocal, updateExpenseLocal } from "../../services/localExpensesService";

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

export default function ExpenseForm({ existingData = null }) {
  const {
    control,
    handleSubmit,
    reset,
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

  const user = auth.currentUser;
  const [openCategory, setOpenCategory] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);

  // cores do tema do seu app (hook customizado)
  const background = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const borderColor = useThemeColor({ light: "#ccc", dark: "#444" }, "border");

  const handleCreate = async (payload) => {
    try{
      await saveExpenseLocal(payload, user.uid);
      alert("Registro criado com sucesso!");
    } catch(error){
      alert("Houve um problema ao salvar");
      console.log(error);
    }
  };

  const handleUpdate = async (id, payload) => {
    try{
      await updateExpenseLocal(id, payload, user.uid);
      alert("Atualizado com sucesso!");
    } catch(error){
      alert("Houve um problema ao atualizar")
      console.log(error);
    }
  };

  const onSubmit = (data) => {
    if (existingData?.id) {
      handleUpdate(existingData.id, data);
    } else {
      handleCreate(data);
    }

    reset({
      category: "",
      payment: "",
      value: "",
      date: "",
      description: "",
    });

    setOpenCategory(false);
    setOpenPayment(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{ padding: 20, marginTop: 50, backgroundColor: background }}>
        <Card mode="contained" style={{ padding: 16, backgroundColor: cardColor }}>
          <Text variant="titleLarge" style={{ marginBottom: 16, color: textColor }}>
            {existingData ? "Editar Despesa" : "Registrar Despesa"}
          </Text>

          {/* ----------------------------
              CATEGORIA (DROPDOWN PICKER)
          ----------------------------- */}
          <Text style={{ marginBottom: 4, color: textColor }}>Categoria</Text>

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
                  onOpen={() => Keyboard.dismiss()}
                  setValue={(callback) => onChange(callback(value))}
                  placeholder="Selecione uma categoria"
                  style={{
                    marginBottom: errors.category ? 0 : 16,
                    backgroundColor: background,
                    borderColor: borderColor,
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: background,
                    borderColor: borderColor,
                  }}
                  textStyle={{ color: textColor }}
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
                  outlineColor={borderColor}
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
            render={({ field: { onChange, value } }) => {
              const displayDate = value
                ? (()=> {
                    const [y, m, d] = value.split('-');
                    return `${d}/${m}/${y}`;
                  })()
                : "";
              
              return (
                <>
                  <TouchableOpacity onPress={() => {Keyboard.dismiss(); setShowDatePicker(true)}}>
                    <TextInput
                      label="Data"
                      mode="outlined"
                      value={displayDate}
                      editable={false}
                      pointerEvents="none"
                      style={{ marginTop: 8 }}
                      outlineColor={borderColor}
                    />
                  </TouchableOpacity>
                  
                  {errors.date && (
                    <HelperText type="error">{errors.date.message}</HelperText>
                  )}
                  
                  {showDatePicker && (
                    <DateTimePicker
                      mode="date"
                      display="calendar"
                      value={ value ? new Date(value) : new Date() }
                      onChange={(event, selectedDate) => {
                        setShowDatePicker(false);
                        
                        if (selectedDate) {
                          const y = selectedDate.getFullYear();
                          const m = String(selectedDate.getMonth()+1).padStart(2,"0");
                          const d = String(selectedDate.getDate()).padStart(2,"0");
                          
                          onChange(`${y}-${m}-${d}`);
                        }
                      }}
                    />
                  )}
                </>
              );
            }}
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
                  outlineColor={borderColor}
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
          <Text style={{ marginBottom: 4, marginTop: 10, color: textColor }}>Forma de Pagamento</Text>

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
                  onOpen={() => Keyboard.dismiss()}
                  setValue={(callback) => onChange(callback(value))}
                  placeholder="Selecione a forma de pagamento"
                  style={{
                    marginBottom: errors.payment ? 0 : 16,
                    backgroundColor: background,
                    borderColor: borderColor,
                  }}
                  dropDownContainerStyle={{
                    backgroundColor: background,
                    borderColor: borderColor,
                  }}
                  textStyle={{ color: textColor }}
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
            style={{ marginTop: 20 }}
          >
            {existingData ? "Salvar Alterações" : "Registrar"}
          </Button>
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
}
