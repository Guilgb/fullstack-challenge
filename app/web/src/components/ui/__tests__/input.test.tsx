import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";
import { renderWithProviders } from "@/test/test-utils";

describe("Input", () => {
  it("should render input field", () => {
    renderWithProviders(<Input />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("should accept and display value", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Input />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test value");

    expect(input).toHaveValue("test value");
  });

  it("should handle onChange events", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "a");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should be disabled when disabled prop is true", () => {
    renderWithProviders(<Input disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("should display placeholder", () => {
    renderWithProviders(<Input placeholder="Enter text..." />);

    expect(screen.getByPlaceholderText("Enter text...")).toBeInTheDocument();
  });

  it("should support different input types", () => {
    renderWithProviders(<Input type="email" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should support password type", () => {
    const { container } = renderWithProviders(<Input type="password" />);

    const input = container.querySelector('input[type="password"]');
    expect(input).toBeInTheDocument();
  });

  it("should support number type", () => {
    const { container } = renderWithProviders(<Input type="number" />);

    const input = container.querySelector('input[type="number"]');
    expect(input).toBeInTheDocument();
  });

  it("should support custom className", () => {
    renderWithProviders(<Input className="custom-input" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input");
  });

  it("should support defaultValue", () => {
    renderWithProviders(<Input defaultValue="default text" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("default text");
  });

  it("should support controlled value", async () => {
    const { rerender } = renderWithProviders(<Input value="initial" readOnly />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("initial");

    rerender(<Input value="updated" readOnly />);
    expect(input).toHaveValue("updated");
  });

  it("should support required attribute", () => {
    renderWithProviders(<Input required />);

    const input = screen.getByRole("textbox");
    expect(input).toBeRequired();
  });

  it("should support maxLength attribute", () => {
    renderWithProviders(<Input maxLength={10} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxLength", "10");
  });

  it("should support aria-label", () => {
    renderWithProviders(<Input aria-label="Email address" />);

    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("should support autoComplete", () => {
    renderWithProviders(<Input autoComplete="email" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("autoComplete", "email");
  });

  it("should support readOnly", () => {
    renderWithProviders(<Input readOnly value="readonly text" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("readOnly");
  });
});
