/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
    light: {
        background: "#FFFFFF",
        card: "#F5F5F7",
        text: "#1A1A1A",
        textSecondary: "#555",
        border: "ccc",
        // border: "#000080",
        icon: "#4F46E5",
        success: "#1F51FF",
        tint: "#1F51FF",
        tabIconDefault: "#687076",
        tabIconSelected: tintColorLight,

        inputBg: "#f5f5f5",
        placeholder: "#666",
        fail: "#FF2800",
    },
    dark: {
        background: "#0D0D0D",
        card: "#1A1A1A",
        text: "#EDEDED",
        textSecondary: "#CCC",
        border: "#444",
        // border: "#00f0ff",
        icon: "#7B6CF6",
        success: "#1F51FF",
        tint: "#00f0ff",
        tabIconDefault: "#9BA1A6",
        tabIconSelected: tintColorDark,

        inputBg: "#1a1a1a",
        placeholder: "#aaa",
        fail: "#FF2800",
    },
};

export const Fonts = Platform.select({
    ios: {
        /** iOS `UIFontDescriptorSystemDesignDefault` */
        sans: "system-ui",
        /** iOS `UIFontDescriptorSystemDesignSerif` */
        serif: "ui-serif",
        /** iOS `UIFontDescriptorSystemDesignRounded` */
        rounded: "ui-rounded",
        /** iOS `UIFontDescriptorSystemDesignMonospaced` */
        mono: "ui-monospace",
    },
    default: {
        sans: "normal",
        serif: "serif",
        rounded: "normal",
        mono: "monospace",
    },
    web: {
        sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        serif: "Georgia, 'Times New Roman', serif",
        rounded:
            "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
        mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
});
