import nx from "@nx/eslint-plugin";
import baseConfig from "../../../eslint.config.mjs";

export default [
    ...nx.configs["flat/react"],
    ...baseConfig,
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        // Override or add rules here
        rules: {}
    },
    {
        // The theme's default colours, its scale generator and hex validation work in raw colours (decision 0119).
        files: ["src/lib/theme.config.ts", "src/lib/color-scales.service.ts", "src/lib/theme.service.ts"],
        rules: { "inithium/no-fixed-colors": "off" }
    }
];
