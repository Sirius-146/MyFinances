import { useThemeColor } from "@/hooks/use-theme-color";

export function useAppColors() {
    return {
        background: useThemeColor({}, "background"),
        card: useThemeColor({}, "card"),
        text: useThemeColor({}, "text"),
        textSecondary: useThemeColor({}, "textSecondary"),
        border: useThemeColor({}, "border"),
        icon: useThemeColor({}, "icon"),
        success: useThemeColor({}, "success"),
        inputBg: useThemeColor({}, "inputBg"),
        placeholder: useThemeColor({}, "placeholder"),
        fail: useThemeColor({}, "fail"),
        tint: useThemeColor({}, "tint"),
    };
}
