import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ThemeColor,
  ThemeFont,
  TextSize,
  TextWeight,
  TextStyle,
  TextDecoration,
  TextAs,
} from "./text.types";
import { Text } from "./text";

const CONTENT = "Hello World";

const renderText = (props = {}) => render(<Text {...props}>{CONTENT}</Text>);

const getText = (): HTMLElement => screen.getByText(CONTENT);

describe("Text Component", () => {
  describe("Defaults", () => {
    it("should render a <p> tag by default", () => {
      renderText();
      expect(getText().tagName).toBe("P");
    });

    it("should apply default color, font, size, weight, fontStyle and decoration classes", () => {
      renderText();
      const { className } = getText();
      expect(className).toContain("text-primary");
      expect(className).toContain("font-sans");
      expect(className).toContain("text-base");
      expect(className).toContain("font-normal");
      expect(className).toContain("not-italic");
      expect(className).toContain("no-underline");
    });
  });

  describe("Semantic Element Matrix", () => {
    const tagMatrix: Array<[TextAs, string]> = [
      ["h1", "H1"],
      ["h2", "H2"],
      ["h3", "H3"],
      ["h4", "H4"],
      ["h5", "H5"],
      ["h6", "H6"],
      ["p", "P"],
      ["span", "SPAN"],
      ["label", "LABEL"],
      ["strong", "STRONG"],
      ["em", "EM"],
      ["small", "SMALL"],
      ["blockquote", "BLOCKQUOTE"],
      ["figcaption", "FIGCAPTION"],
      ["legend", "LEGEND"],
      ["dt", "DT"],
      ["dd", "DD"],
      ["li", "LI"],
    ];

    it.each(tagMatrix)(
      'should render as <%s> when as="%s"',
      (as, expectedTag) => {
        renderText({ as });
        expect(getText().tagName).toBe(expectedTag);
      },
    );
  });

  describe("Color Matrix", () => {
    const colorMatrix: Array<[ThemeColor, string]> = [
      ["primary", "text-primary"],
      ["secondary", "text-secondary"],
      ["accent", "text-accent"],
      ["success", "text-success"],
      ["warning", "text-warning"],
      ["danger", "text-danger"],
      ["info", "text-info"],
      ["surface2", "text-surface2"],
    ];

    it.each(colorMatrix)(
      'should apply "%s" color class for color="%s"',
      (color, expectedClass) => {
        renderText({ color });
        expect(getText().className).toContain(expectedClass);
      },
    );
  });

  describe("Font Family Matrix", () => {
    const fontMatrix: Array<[ThemeFont, string]> = [
      ["sans", "font-sans"],
      ["serif", "font-serif"],
      ["mono", "font-mono"],
      ["display", "font-display"],
      ["body", "font-body"],
      ["inter-tight", "inter-tight"],
      ["plus-jakarta-sans", "plus-jakarta-sans"],
      ["sora", "sora"],
      ["dm-sans", "dm-sans"],
      ["lora", "lora"],
      ["space-grotesk", "space-grotesk"],
      ["nunito", "nunito"],
      ["raleway", "raleway"],
      ["mulish", "mulish"],
      ["merriweather", "merriweather"],
      ["playfair-display", "playfair-display"],
      ["ibm-plex-mono", "ibm-plex-mono"],
      ["fraunces", "fraunces"],
      ["outfit", "outfit"],
      ["manrope", "manrope"],
      ["barlow", "barlow"],
      ["epilogue", "epilogue"],
      ["libre-baskerville", "libre-baskerville"],
      ["josefin-sans", "josefin-sans"],
      ["space-mono", "space-mono"],
    ];

    it.each(fontMatrix)(
      'should apply "%s" font class for font="%s"',
      (font, expectedClass) => {
        renderText({ font });
        expect(getText().className).toContain(expectedClass);
      },
    );
  });

  describe("Size Matrix", () => {
    const sizeMatrix: Array<[TextSize, string]> = [
      ["xs", "text-xs"],
      ["sm", "text-sm"],
      ["base", "text-base"],
      ["lg", "text-lg"],
      ["xl", "text-xl"],
      ["2xl", "text-2xl"],
      ["3xl", "text-3xl"],
      ["4xl", "text-4xl"],
      ["5xl", "text-5xl"],
    ];

    it.each(sizeMatrix)(
      'should apply "%s" size class for size="%s"',
      (size, expectedClass) => {
        renderText({ size });
        expect(getText().className).toContain(expectedClass);
      },
    );
  });

  describe("Weight Matrix", () => {
    const weightMatrix: Array<[TextWeight, string]> = [
      ["thin", "font-thin"],
      ["light", "font-light"],
      ["normal", "font-normal"],
      ["medium", "font-medium"],
      ["semibold", "font-semibold"],
      ["bold", "font-bold"],
      ["extrabold", "font-extrabold"],
      ["black", "font-black"],
    ];

    it.each(weightMatrix)(
      'should apply "%s" weight class for weight="%s"',
      (weight, expectedClass) => {
        renderText({ weight });
        expect(getText().className).toContain(expectedClass);
      },
    );
  });

  describe("Font Style Matrix", () => {
    const fontStyleMatrix: Array<[TextStyle, string]> = [
      ["normal", "not-italic"],
      ["italic", "italic"],
    ];

    it.each(fontStyleMatrix)(
      'should apply "%s" font-style class for fontStyle="%s"',
      (fontStyle, expectedClass) => {
        renderText({ fontStyle });
        expect(getText().className).toContain(expectedClass);
      },
    );
  });

  describe("Decoration Matrix", () => {
    const decorationMatrix: Array<[TextDecoration, string]> = [
      ["none", "no-underline"],
      ["underline", "underline"],
      ["line-through", "line-through"],
      ["overline", "overline"],
    ];

    it.each(decorationMatrix)(
      'should apply "%s" decoration class for decoration="%s"',
      (decoration, expectedClass) => {
        renderText({ decoration });
        expect(getText().className).toContain(expectedClass);
      },
    );
  });

  describe("Composition", () => {
    it("should merge consumer className without overwriting token classes", () => {
      renderText({ className: "custom-class" });
      const { className } = getText();
      expect(className).toContain("custom-class");
      expect(className).toContain("text-primary");
    });

    it("should forward arbitrary HTML attributes", () => {
      renderText({ "aria-label": "descriptive-label", id: "text-id" });
      const el = getText();
      expect(el.getAttribute("aria-label")).toBe("descriptive-label");
      expect(el.getAttribute("id")).toBe("text-id");
    });

    it("should apply a combined multi-prop style correctly", () => {
      renderText({
        color: "danger",
        font: "mono",
        size: "2xl",
        weight: "bold",
        fontStyle: "italic",
        decoration: "underline",
      });
      const { className } = getText();
      expect(className).toContain("text-danger");
      expect(className).toContain("font-mono");
      expect(className).toContain("text-2xl");
      expect(className).toContain("font-bold");
      expect(className).toContain("italic");
      expect(className).toContain("underline");
    });
  });
});
