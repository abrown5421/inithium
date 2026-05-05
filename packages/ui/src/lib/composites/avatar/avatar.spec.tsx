import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar } from "./avatar";
import type { AvatarOptions } from "@inithium/types";

describe("Avatar", () => {
  const baseOptions: AvatarOptions = {
    gradient: "linear-gradient(to right, red, blue)",
    variant: "circular",
  };

  it("renders image with correct src and alt", () => {
    render(<Avatar src="avatar.jpg" alt="User Avatar" />);
    const img = screen.getByRole("img") as HTMLImageElement;

    expect(img).toBeTruthy();
    expect(img.src).toContain("avatar.jpg");
    expect(img.alt).toBe("User Avatar");
  });

  it("falls back to default alt when not provided", () => {
    render(<Avatar src="avatar.jpg" />);
    const img = screen.getByRole("img");

    expect(img.getAttribute("alt")).toBe("User avatar");
  });

  it("renders initials when src is not provided", () => {
    render(<Avatar initials="AB" options={baseOptions} />);
    expect(screen.getByText("AB")).toBeTruthy();
  });

  it("renders initials container when gradient option is provided", () => {
    render(<Avatar initials="AB" options={baseOptions} />);
    const element = screen.getByText("AB").parentElement as HTMLElement;

    expect(element).toBeTruthy();
    expect(element.textContent).toBe("AB");
  });

  it("renders initials container when no gradient is provided", () => {
    render(<Avatar initials="AB" />);
    const element = screen.getByText("AB").parentElement as HTMLElement;

    expect(element).toBeTruthy();
    expect(element.textContent).toBe("AB");
  });

  it("renders as button when onClick is provided", () => {
    const handleClick = vi.fn();
    render(<Avatar onClick={handleClick} initials="AB" />);

    const button = screen.getByRole("button");
    expect(button).toBeTruthy();
  });

  it("triggers onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Avatar onClick={handleClick} initials="AB" />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is focusable when clickable", () => {
    render(<Avatar onClick={() => {}} initials="AB" />);
    const button = screen.getByRole("button");

    expect(button.getAttribute("tabIndex")).toBe("0");
  });

  it("does not render button role when onClick is not provided", () => {
    render(<Avatar initials="AB" />);
    const buttons = screen.queryAllByRole("button");

    expect(buttons.length).toBe(0);
  });

  it("applies circular variant by default", () => {
    const { container } = render(<Avatar initials="AB" />);
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain("rounded-full");
  });

  it("applies square variant when specified", () => {
    const { container } = render(
      <Avatar initials="AB" options={{ variant: "square" }} />
    );
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain("rounded-md");
  });

  it("applies large size styles when large is true", () => {
    const { container } = render(<Avatar initials="AB" large />);
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain("h-32");
    expect(root.className).toContain("w-32");
  });

  it("applies default size styles when large is false", () => {
    const { container } = render(<Avatar initials="AB" />);
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain("h-12");
    expect(root.className).toContain("w-12");
  });

  it("applies additional className prop", () => {
    const { container } = render(
      <Avatar initials="AB" className="custom-class" />
    );
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain("custom-class");
  });

  it("applies hover and cursor styles when clickable", () => {
    const { container } = render(
      <Avatar initials="AB" onClick={() => {}} />
    );
    const root = container.firstChild as HTMLElement;

    expect(root.className).toContain("cursor-pointer");
    expect(root.className).toContain("hover:opacity-80");
  });

  it("does not apply clickable styles when not clickable", () => {
    const { container } = render(<Avatar initials="AB" />);
    const root = container.firstChild as HTMLElement;

    expect(root.className).not.toContain("cursor-pointer");
  });

  it("renders image instead of initials when both src and initials provided", () => {
    render(<Avatar src="avatar.jpg" initials="AB" />);
    const img = screen.getByRole("img");

    expect(img).toBeTruthy();
    expect(screen.queryByText("AB")).toBeNull();
  });

  it("forwards additional props to root element", () => {
    const { container } = render(
      <Avatar initials="AB" data-testid="avatar-root" />
    );

    const root = container.querySelector('[data-testid="avatar-root"]');
    expect(root).toBeTruthy();
  });
});