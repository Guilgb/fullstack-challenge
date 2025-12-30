import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { renderWithProviders } from "@/test/test-utils";

describe("Button", () => {
  it("should render button with children", () => {
    renderWithProviders(<Button>Click me</Button>);

    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    renderWithProviders(<Button disabled>Click me</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should not call onClick when disabled", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );

    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render with default variant", () => {
    renderWithProviders(<Button>Default</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should render with destructive variant", () => {
    renderWithProviders(<Button variant="destructive">Delete</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Delete");
  });

  it("should render with outline variant", () => {
    renderWithProviders(<Button variant="outline">Outline</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Outline");
  });

  it("should render with secondary variant", () => {
    renderWithProviders(<Button variant="secondary">Secondary</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Secondary");
  });

  it("should render with ghost variant", () => {
    renderWithProviders(<Button variant="ghost">Ghost</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Ghost");
  });

  it("should render with link variant", () => {
    renderWithProviders(<Button variant="link">Link</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Link");
  });

  it("should render with small size", () => {
    renderWithProviders(<Button size="sm">Small</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Small");
  });

  it("should render with large size", () => {
    renderWithProviders(<Button size="lg">Large</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Large");
  });

  it("should render with icon size", () => {
    renderWithProviders(<Button size="icon">X</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("X");
  });

  it("should support custom className", () => {
    renderWithProviders(<Button className="custom-class">Custom</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-class");
  });

  it("should support type attribute", () => {
    renderWithProviders(<Button type="submit">Submit</Button>);

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should render with aria-label", () => {
    renderWithProviders(<Button aria-label="Close dialog">X</Button>);

    expect(screen.getByLabelText(/close dialog/i)).toBeInTheDocument();
  });
});
