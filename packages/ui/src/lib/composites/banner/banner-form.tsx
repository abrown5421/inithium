import { useState, useCallback } from "react";
import { Box, Text, Slider, Button } from "@inithium/ui";
import { Banner } from "@inithium/ui";
import { AutoIncrementingList } from "@inithium/ui";
import { ColorPicker } from "@inithium/ui";
import { useUpdateMeMutation } from "@inithium/store";
import type { TrianglifyOptions } from "@inithium/types";

interface BannerFormProps {
  userId: string;
  initial?: TrianglifyOptions;
  onSaved?: () => void;
}

const DEFAULT_OPTIONS = {
  cell_size: 35,
  variance: 0.55,
  x_colors: ["#0f5066", "#ffffff"] as string[],
  y_colors: ["#08594c", "#000000"] as string[],
};

const normalizeColors = (value?: string | string[]): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
};

export const BannerForm: React.FC<BannerFormProps> = ({
  userId,
  initial,
  onSaved,
}) => {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...initial,
  };


  const [variance, setVariance] = useState<number>(opts.variance);
  const [cellSize, setCellSize] = useState<number>(opts.cell_size);

  const initialX = normalizeColors(opts.x_colors);
  const initialY = normalizeColors(opts.y_colors);

  const [xColors, setXColors] = useState<string[]>(
    initialX.length >= 2 ? initialX : DEFAULT_OPTIONS.x_colors
  );

  const [yColors, setYColors] = useState<string[]>(
    initialY.length >= 2 ? initialY : DEFAULT_OPTIONS.y_colors
  );

  const [updateMe, { isLoading, isSuccess, isError }] = useUpdateMeMutation();

  const previewOptions: TrianglifyOptions = {
    variance,
    cell_size: cellSize,
    x_colors: xColors,
    y_colors: yColors,
  };

  const updateColorAt = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    hex: string
  ) => setter((prev) => prev.map((c, i) => (i === index ? hex : c)));

  const handleXColorChange = useCallback(
    (index: number, hex: string) => updateColorAt(setXColors, index, hex),
    []
  );

  const handleYColorChange = useCallback(
    (index: number, hex: string) => updateColorAt(setYColors, index, hex),
    []
  );

  const syncLength = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    count: number,
    fillColor: string
  ) =>
    setter((prev) =>
      count > prev.length
        ? [...prev, ...Array(count - prev.length).fill(fillColor)]
        : prev.slice(0, count)
    );

  const syncXLength = useCallback(
    (count: number) => syncLength(setXColors, count, "#6366f1"),
    []
  );

  const syncYLength = useCallback(
    (count: number) => syncLength(setYColors, count, "#3b82f6"),
    []
  );

  const handleSave = async () => {
    await updateMe({
      userId,
      patch: {
        user_banner: {
          variance,
          cell_size: cellSize,
          x_colors: xColors,
          y_colors: yColors,
        },
      },
    });
    onSaved?.();
  };

  return (
    <Box direction="col"  className="w-full">
      <div className="grid grid-cols-12 gap-8 w-full">
        <Box direction="col" gap="4" className="col-span-5">
          <Box direction="col" gap="2">
            <Text
              size="xs"
              weight="semibold"
              color="surface2-contrast"
              className="uppercase tracking-widest"
            >
              Preview
            </Text>
            <div className="w-full rounded-lg overflow-hidden ring-1 ring-surface2 shadow-sm">
              <Banner
                options={previewOptions}
                height="180px"
                alt="Banner preview"
              />
            </div>
          </Box>

          <Box direction="col" gap="4" mt="4">
            <Slider
              label="Variance"
              description="Controls irregularity."
              variant="outlined"
              color="primary"
              min={0}
              max={1}
              step={0.01}
              value={variance}
              onChange={setVariance}
              showValue
              formatValue={(v) => v.toFixed(2)}
            />
            <Slider
              label="Cell Size"
              description="Size of triangles."
              variant="outlined"
              color="primary"
              min={20}
              max={300}
              step={5}
              value={cellSize}
              onChange={setCellSize}
              showValue
              formatValue={(v) => `${v}px`}
            />
          </Box>
        </Box>

        <Box
          direction="col"
          gap="4"
          className="col-span-7 overflow-y-auto max-h-[65vh] pr-4"
        >
          <Box direction="col" gap="4">
            <Box direction="col" >
              <Text size="sm" weight="semibold" color="surface-contrast">
                X-Axis Colors
              </Text>
              <Text size="xs" color="surface2-contrast">
                Horizontal interpolation (2-8 colors).
              </Text>
            </Box>
            <AutoIncrementingList
              min={2}
              max={8}
              defaultCount={xColors.length}
              onChange={syncXLength}
              gap="4"
              renderItem={(index) => (
                <ColorPicker
                  label={`X Color ${index + 1}`}
                  value={xColors[index] ?? "#6366f1"}
                  onChange={(hex) => handleXColorChange(index, hex)}
                  color="primary"
                  variant="outlined"
                  size="base"
                />
              )}
            />
          </Box>

          <Box direction="col" gap="4">
            <Box direction="col" >
              <Text size="sm" weight="semibold" color="surface-contrast">
                Y-Axis Colors
              </Text>
              <Text size="xs" color="surface2-contrast">
                Vertical interpolation (2-8 colors).
              </Text>
            </Box>
            <AutoIncrementingList
              min={2}
              max={8}
              defaultCount={yColors.length}
              onChange={syncYLength}
              gap="4"
              renderItem={(index) => (
                <ColorPicker
                  label={`Y Color ${index + 1}`}
                  value={yColors[index] ?? "#3b82f6"}
                  onChange={(hex) => handleYColorChange(index, hex)}
                  color="primary"
                  variant="outlined"
                  size="base"
                />
              )}
            />
          </Box>
        </Box>
      </div>

      <Box
        direction="row"
        gap="2"
        justify="end"
        className="mt-8 pt-4 border-t border-surface2"
      >
        {isError && (
          <Text size="xs" color="danger" className="self-center mr-auto">
            Failed to save. Please try again.
          </Text>
        )}
        {isSuccess && (
          <Text size="xs" color="success" className="self-center mr-auto">
            Banner saved!
          </Text>
        )}
        <Button
          variant="filled"
          color="primary"
          size="sm"
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving…" : "Save Banner"}
        </Button>
      </Box>
    </Box>
  );
};

export default BannerForm;