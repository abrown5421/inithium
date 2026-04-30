import { useState, useCallback } from "react";
import { Box, Text, Input, Select, Button } from "@inithium/ui";
import { Avatar } from "@inithium/ui";
import { ColorPicker } from "@inithium/ui";
import { useUpdateMeMutation } from "@inithium/store";
import type { AvatarOptions, ThemeFont } from "@inithium/types";

interface AvatarFormProps {
  userId: string;
  initials: string;
  initial?: AvatarOptions;
  onSaved?: () => void;
}

const DEFAULT_OPTIONS: AvatarOptions = {
  gradient: "linear-gradient(135deg, #0f5066 0%, #ADCEC4 100%)",
  font: "sans",
  variant: "circular",
};

const parseGradient = (
  gradient?: string
): { color1: string; color2: string; angle: number } => {
  if (!gradient) return { color1: "#0f5066", color2: "#ADCEC4", angle: 135 };

  const angleMatch = gradient.match(/(\d+)deg/);
  const hexMatches = gradient.match(/#[0-9a-fA-F]{3,6}/g);

  return {
    angle: angleMatch ? parseInt(angleMatch[1], 10) : 135,
    color1: hexMatches?.[0] ?? "#0f5066",
    color2: hexMatches?.[1] ?? "#ADCEC4",
  };
};

const buildGradient = (color1: string, color2: string, angle: number) =>
  `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;

const FONT_OPTIONS: { value: ThemeFont; label: string }[] = [
  { value: "sans", label: "Sans (System)" },
  { value: "serif", label: "Serif (System)" },
  { value: "mono", label: "Mono (System)" },
  { value: "display", label: "Display (System)" },
  { value: "body", label: "Body (System)" },
  { value: "inter-tight", label: "Inter Tight" },
  { value: "plus-jakarta-sans", label: "Plus Jakarta Sans" },
  { value: "sora", label: "Sora" },
  { value: "dm-sans", label: "DM Sans" },
  { value: "lora", label: "Lora" },
  { value: "space-grotesk", label: "Space Grotesk" },
  { value: "nunito", label: "Nunito" },
  { value: "raleway", label: "Raleway" },
  { value: "mulish", label: "Mulish" },
  { value: "merriweather", label: "Merriweather" },
  { value: "playfair-display", label: "Playfair Display" },
  { value: "ibm-plex-mono", label: "IBM Plex Mono" },
  { value: "fraunces", label: "Fraunces" },
  { value: "outfit", label: "Outfit" },
  { value: "manrope", label: "Manrope" },
  { value: "barlow", label: "Barlow" },
  { value: "epilogue", label: "Epilogue" },
  { value: "libre-baskerville", label: "Libre Baskerville" },
  { value: "josefin-sans", label: "Josefin Sans" },
  { value: "space-mono", label: "Space Mono" },
];

const VARIANT_OPTIONS = [
  { value: "circular", label: "Circular" },
  { value: "square", label: "Square" },
];

export const AvatarForm: React.FC<AvatarFormProps> = ({
  userId,
  initials,
  initial,
  onSaved,
}) => {
  const opts = initial ?? DEFAULT_OPTIONS;
  const { color1: initColor1, color2: initColor2, angle: initAngle } =
    parseGradient(opts.gradient);

  const [color1, setColor1] = useState(initColor1);
  const [color2, setColor2] = useState(initColor2);
  const [angle, setAngle] = useState(initAngle);
  const [font, setFont] = useState<ThemeFont>(opts.font ?? "sans");
  const [variant, setVariant] = useState<"circular" | "square">(
    opts.variant ?? "circular"
  );

  const [updateMe, { isLoading, isSuccess, isError }] = useUpdateMeMutation();

  const previewOptions: AvatarOptions = {
    gradient: buildGradient(color1, color2, angle),
    font,
    variant,
  };

  const handleAngleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) setAngle(Math.max(0, Math.min(360, val)));
    },
    []
  );

  const handleSave = async () => {
    await updateMe({
      userId,
      patch: {
        user_avatar: {
          gradient: buildGradient(color1, color2, angle),
          font,
          variant,
        },
      },
    });
    onSaved?.();
  };

  return (
    <Box direction="col" gap="0" className="w-full">
      <Box direction="col" gap="2" align="center" className="w-full">
        <Text size="xs" weight="semibold" color="surface2-contrast" className="uppercase tracking-widest self-start">
          Preview
        </Text>
        <Avatar
          large
          initials={initials}
          options={previewOptions}
          className="border-4 border-surface shadow-lg"
        />
      </Box>

      <Box
        direction="col"
        gap="5"
        className="w-full overflow-y-auto max-h-[52vh] pr-1 mt-5"
      >
        <Box direction="col" gap="3">
          <Box direction="col" gap="0">
            <Text size="sm" weight="semibold" color="surface-contrast">
              Gradient
            </Text>
            <Text size="xs" color="surface2-contrast">
              Choose two colors and a direction angle for your avatar background.
            </Text>
          </Box>

          <Box direction="col" gap="3" className="w-full md:flex-row md:flex md:gap-3">
            <Box className="flex-1 min-w-0">
              <ColorPicker
                label="Color 1"
                value={color1}
                onChange={setColor1}
                color="primary"
                variant="outlined"
                size="base"
              />
            </Box>
            <Box className="flex-1 min-w-0">
              <ColorPicker
                label="Color 2"
                value={color2}
                onChange={setColor2}
                color="primary"
                variant="outlined"
                size="base"
              />
            </Box>
          </Box>

          <Box direction="row" gap="3" align="end">
            <Box className="flex-1 min-w-0">
              <Input
                label="Angle (°)"
                type="number"
                min={0}
                max={360}
                value={String(angle)}
                onChange={handleAngleChange}
                description="0–360 degrees"
                color="primary"
                variant="outlined"
                size="base"
              />
            </Box>
            <Box
              className="h-10 w-24 rounded-lg shrink-0 ring-1 ring-surface2"
              style={{
                background: buildGradient(color1, color2, angle),
              } as React.CSSProperties}
            />
          </Box>
        </Box>

        <Select
          label="Initials Font"
          description="The typeface used to render your initials inside the avatar."
          options={FONT_OPTIONS}
          value={font}
          onChange={(e) => setFont(e.target.value as ThemeFont)}
          color="primary"
          variant="outlined"
          size="base"
        />

        <Select
          label="Shape"
          options={VARIANT_OPTIONS}
          value={variant}
          onChange={(e) =>
            setVariant(e.target.value as "circular" | "square")
          }
          color="primary"
          variant="outlined"
          size="base"
        />
      </Box>

      <Box direction="row" gap="2" justify="end" className="mt-5 pt-4 border-t border-surface2">
        {isError && (
          <Text size="xs" color="danger" className="self-center mr-auto">
            Failed to save. Please try again.
          </Text>
        )}
        {isSuccess && (
          <Text size="xs" color="success" className="self-center mr-auto">
            Avatar saved!
          </Text>
        )}
        <Button
          variant="filled"
          color="primary"
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving…" : "Save Avatar"}
        </Button>
      </Box>
    </Box>
  );
};

export default AvatarForm;