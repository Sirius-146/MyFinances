import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { router } from "expo-router";
import type { User } from "firebase/auth";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { Modal, TouchableOpacity, View } from "react-native";
import { auth } from "../../lib/firebase";
import { deleteUserAccount } from "../../services/deleteUser";
import ModernButton from "../../utils/ModernButton";
import PasswordConfirmationModal from "./components/PasswordConfirmationModal";

export default function SettingsScreen() {
    const user: User | null = auth.currentUser;

    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [deleting, setDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [confirmDeleteModal, setConfirmDeleteModal] =
        useState<boolean>(false);

    const inputBg = useThemeColor(
        { light: "#fff", dark: "#1b1b1b" },
        "background"
    );
    const txtColor = useThemeColor({ light: "#444", dark: "#ddd" }, "text");
    const bgColor = useThemeColor(
        { light: "#ccc", dark: "#333" },
        "background"
    );

    async function handleDeleteUser() {
        if (!user) return;
        await deleteUserAccount({
            user,
            confirmPassword,
            setDeleting,
            setDeleteError,
            setShowDeleteModal,
            setConfirmPassword,
        });
        router.dismissAll();
        router.replace("/(home)/Home");
    }

    async function logOut() {
        await signOut(auth);
        router.dismissAll();
        router.replace("/(auth)/login");
    }
    return (
        <ThemedView style={{ flex: 1, justifyContent: "center", padding: 20 }}>
            <ModernButton
                text="Excluir Conta"
                onPress={() => setShowDeleteModal(true)}
                icon="trash-alt"
                colors={["#D30000", "#FF2800"]}
            />

            <View style={{ marginTop: 20 }}>
                <ModernButton
                    text="Sair"
                    onPress={logOut}
                    icon="sign-out-alt"
                    colors={["#D30000", "#FF2800"]}
                />
            </View>

            <PasswordConfirmationModal
                visible={showDeleteModal}
                password={confirmPassword}
                onChangePassword={setConfirmPassword}
                onCancel={() => {
                    setShowDeleteModal(false);
                    setConfirmPassword("");
                    setDeleteError("");
                }}
                onConfirm={() => {
                    setShowDeleteModal(false);
                    setConfirmDeleteModal(true);
                }}
                loading={deleting}
                errorMessage={deleteError}
            />

            <Modal
                visible={confirmDeleteModal}
                transparent
                animationType="fade"
            >
                <ThemedView
                    style={{
                        flex: 1,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 25,
                    }}
                >
                    <ThemedView
                        style={{
                            width: "100%",
                            borderRadius: 14,
                            padding: 20,
                            backgroundColor: inputBg,
                        }}
                    >
                        <ThemedText
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 10,
                                textAlign: "center",
                            }}
                        >
                            Excluir Conta
                        </ThemedText>

                        <ThemedText
                            style={{
                                fontSize: 15,
                                color: txtColor,
                                textAlign: "center",
                                marginBottom: 15,
                            }}
                        >
                            Essa é uma ação permanente. Sua conta e todos os
                            registros serão removidos de forma irreversível.
                            {"\n"}
                            Confirma a exclusão?
                        </ThemedText>

                        {/* Botões */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 10,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => setConfirmDeleteModal(false)}
                                style={{
                                    flex: 1,
                                    marginRight: 8,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: "center",
                                    backgroundColor: bgColor,
                                }}
                            >
                                <ThemedText>Cancelar</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDeleteUser}
                                style={{
                                    flex: 1,
                                    marginLeft: 8,
                                    paddingVertical: 12,
                                    borderRadius: 10,
                                    alignItems: "center",
                                    backgroundColor: "#d9534f",
                                }}
                            >
                                <ThemedText
                                    style={{
                                        color: "#fff",
                                        fontWeight: "bold",
                                    }}
                                >
                                    Excluir
                                </ThemedText>
                            </TouchableOpacity>
                        </View>
                    </ThemedView>
                </ThemedView>
            </Modal>
        </ThemedView>
    );
}
