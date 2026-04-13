import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Popover } from "./Popover";

describe("Popover Component", () => {
  const renderPopover = (props = {}) => {
    return render(
      <Popover 
        buttonLabel="Trigger" 
        {...props}
      >
        <div data-testid="panel-content">Panel Content</div>
      </Popover>
    );
  };

  it("renders the trigger button with the provided label", () => {
    renderPopover();
    const button = screen.getByRole("button", { name: /trigger/i });
    expect(button).toBeDefined();
  });

  it("does not show the panel content by default", () => {
    renderPopover();
    const content = screen.queryByTestId("panel-content");
    expect(content).toBeNull();
  });

  it("toggles the panel visibility when the trigger is clicked", async () => {
    renderPopover();
    const trigger = screen.getByRole("button", { name: /trigger/i });

    fireEvent.click(trigger);
    const content = await screen.findByTestId("panel-content");
    expect(content).toBeDefined();

    fireEvent.click(trigger);
    expect(screen.queryByTestId("panel-content")).toBeNull();
  });

  it("applies the correct theme color and variant classes", () => {
    renderPopover({ color: "danger", variant: "outlined" });
    const trigger = screen.getByRole("button", { name: /trigger/i });

    const classes = Array.from(trigger.classList);
    expect(classes).toContain("bg-transparent");
    expect(classes).toContain("border-danger");
    expect(classes).toContain("text-danger");
  });

  it("applies size-specific classes", () => {
    renderPopover({ size: "lg" });
    const trigger = screen.getByRole("button", { name: /trigger/i });

    expect(trigger.className).toContain("px-6");
    expect(trigger.className).toContain("py-3");
    expect(trigger.className).toContain("text-lg");
  });

  it("supports custom className on the trigger", () => {
    renderPopover({ className: "custom-trigger-class" });
    const trigger = screen.getByRole("button", { name: /trigger/i });
    expect(trigger.classList.contains("custom-trigger-class")).toBe(true);
  });
});