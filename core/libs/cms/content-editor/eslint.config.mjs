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
        // Measuring drawn colours paints on a canvas in fixed colours (decision 0119).
        files: ["src/lib/contrast-scan.service.ts"],
        rules: { "inithium/no-fixed-colors": "off" }
    }
];
