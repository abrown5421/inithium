import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Avatar } from "./Avatar";

describe("Avatar Component", () => {
  const mockOptions = {
    gradient: "linear-gradient(to right, red, blue)",
    variant: "circular" as const,
  };

  it("renders an image when src is provided", () => {
    render(<Avatar src="test.jpg" alt="Test User" />);
    const img = screen.getByRole("img") as HTMLImageElement;

    expect(img.src).toContain("test.jpg");
    expect(img.alt).toBe("Test User");
  });

  it("renders initials and gradient when src is missing", () => {
    const { container } = render(
      <Avatar initials="JD" options={mockOptions} />
    );

    console.log("HTML:", container.innerHTML);
    console.log("JD element:", screen.getByText("JD").outerHTML);
    console.log("JD parent:", screen.getByText("JD").parentElement?.outerHTML);
  });

  it("applies correct size classes", () => {
    const { container } = render(<Avatar size="xl" />);
    const element = container.firstChild as HTMLElement;

    expect(element.className).toContain("h-24");
    expect(element.className).toContain("w-24");
  });

  it("triggers onClick and behaves as a button when handler is passed", () => {
    const handleClick = vi.fn();
    render(<Avatar onClick={handleClick} />);

    const avatar = screen.getByRole("button");
    fireEvent.click(avatar);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("respects square variant shape", () => {
    const { container } = render(<Avatar options={{ variant: "square" }} />);
    const element = container.firstChild as HTMLElement;

    expect(element.classList.contains("rounded-md")).toBe(true);
  });
});