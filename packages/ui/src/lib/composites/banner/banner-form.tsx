import { useState, useCallback, useRef } from "react";
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

const DEFAULT_OPTIONS: TrianglifyOptions = {
  variance: 0.75,
  cell_size: 75,
  x_colors: ["#6366f1", "#8b5cf6"],
  y_colors: ["#3b82f6", "#06b6d4"],
};

export const BannerForm: React.FC<BannerFormProps> = ({
  userId,
  initial,
  onSaved,
}) => {
  const opts = initial ?? DEFAULT_OPTIONS;

  const [variance, setVariance] = useState(opts.variance);
  const [cellSize, setCellSize] = useState(opts.cell_size);
  const [xColors, setXColors] = useState<string[]>(
    opts.x_colors.length >= 2 ? opts.x_colors : [...DEFAULT_OPTIONS.x_colors]
  );
  const [yColors, setYColors] = useState<string[]>(
    opts.y_colors.length >= 2 ? opts.y_colors : [...DEFAULT_OPTIONS.y_colors]
  );

  const [updateMe, { isLoading, isSuccess, isError }] = useUpdateMeMutation();

  const previewOptions: TrianglifyOptions = {
    variance,
    cell_size: cellSize,
    x_colors: xColors,
    y_colors: yColors,
  };

  const handleXColorChange = useCallback((index: number, hex: string) => {
    setXColors((prev) => {
      const next = [...prev];
      next[index] = hex;
      return next;
    });
  }, []);

  const handleYColorChange = useCallback((index: number, hex: string) => {
    setYColors((prev) => {
      const next = [...prev];
      next[index] = hex;
      return next;
    });
  }, []);

  const syncXLength = useCallback((count: number) => {
    setXColors((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill("#6366f1")];
      }
      return prev.slice(0, count);
    });
  }, []);

  const syncYLength = useCallback((count: number) => {
    setYColors((prev) => {
      if (count > prev.length) {
        return [...prev, ...Array(count - prev.length).fill("#3b82f6")];
      }
      return prev.slice(0, count);
    });
  }, []);

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
    <Box direction="col" gap="0" className="w-full">
      <Box direction="col" gap="2" className="w-full">
        <Text size="xs" weight="semibold" color="surface2-contrast" className="uppercase tracking-widest">
          Preview
        </Text>
        <div className="w-full rounded-lg overflow-hidden ring-1 ring-surface2">
          <Banner options={previewOptions} height="160px" alt="Banner preview" />
        </div>
      </Box>

      <Box
        direction="col"
        gap="5"
        className="w-full overflow-y-auto max-h-[55vh] pr-1 mt-5"
      >
        <Box direction="col" gap="1">
          <Slider
            label="Variance"
            description="Controls how irregular the triangulation pattern appears."
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
        </Box>

        <Box direction="col" gap="1">
          <Slider
            label="Cell Size"
            description="Larger values produce bigger triangles."
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

        <Box direction="col" gap="3">
          <Box direction="col" gap="0">
            <Text size="sm" weight="semibold" color="surface-contrast">
              X-Axis Colors
            </Text>
            <Text size="xs" color="surface2-contrast">
              Colors interpolated along the horizontal axis. Min 2, max 8.
            </Text>
          </Box>
          <AutoIncrementingList
            min={2}
            max={8}
            defaultCount={xColors.length}
            onChange={syncXLength}
            gap="3"
            renderItem={(index) => (
              <ColorPicker
                label={`Color ${index + 1}`}
                value={xColors[index] ?? "#6366f1"}
                onChange={(hex) => handleXColorChange(index, hex)}
                color="primary"
                variant="outlined"
                size="base"
              />
            )}
          />
        </Box>

        <Box direction="col" gap="3">
          <Box direction="col" gap="0">
            <Text size="sm" weight="semibold" color="surface-contrast">
              Y-Axis Colors
            </Text>
            <Text size="xs" color="surface2-contrast">
              Colors interpolated along the vertical axis. Min 2, max 8.
            </Text>
          </Box>
          <AutoIncrementingList
            min={2}
            max={8}
            defaultCount={yColors.length}
            onChange={syncYLength}
            gap="3"
            renderItem={(index) => (
              <ColorPicker
                label={`Color ${index + 1}`}
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

      <Box direction="row" gap="2" justify="end" className="mt-5 pt-4 border-t border-surface2">
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