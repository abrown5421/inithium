import baseConfig from "../../../eslint.config.mjs";

export default [
    ...baseConfig,
    {
        // Theme colours are stored as hex, so the schema's examples are hex (decision 0119).
        files: ["src/lib/ui/theme.schema.ts"],
        rules: { "inithium/no-fixed-colors": "off" }
    }
];
