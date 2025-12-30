import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge } from "@/components/ui/badge";
import { renderWithProviders } from "@/test/test-utils";

describe("Badge", () => {
  it("should render badge with children", () => {
    renderWithProviders(<Badge>Test Badge</Badge>);

    expect(screen.getByText("Test Badge")).toBeInTheDocument();
  });

  it("should render with default variant", () => {
    renderWithProviders(<Badge>Default</Badge>);

    const badge = screen.getByText("Default");
    expect(badge).toBeInTheDocument();
  });

  it("should render with secondary variant", () => {
    renderWithProviders(<Badge variant="secondary">Secondary</Badge>);

    const badge = screen.getByText("Secondary");
    expect(badge).toBeInTheDocument();
  });

  it("should render with destructive variant", () => {
    renderWithProviders(<Badge variant="destructive">Destructive</Badge>);

    const badge = screen.getByText("Destructive");
    expect(badge).toBeInTheDocument();
  });

  it("should render with outline variant", () => {
    renderWithProviders(<Badge variant="outline">Outline</Badge>);

    const badge = screen.getByText("Outline");
    expect(badge).toBeInTheDocument();
  });

  it("should render with low priority variant", () => {
    renderWithProviders(<Badge variant="low">Low Priority</Badge>);

    const badge = screen.getByText("Low Priority");
    expect(badge).toBeInTheDocument();
  });

  it("should render with medium priority variant", () => {
    renderWithProviders(<Badge variant="medium">Medium Priority</Badge>);

    const badge = screen.getByText("Medium Priority");
    expect(badge).toBeInTheDocument();
  });

  it("should render with high priority variant", () => {
    renderWithProviders(<Badge variant="high">High Priority</Badge>);

    const badge = screen.getByText("High Priority");
    expect(badge).toBeInTheDocument();
  });

  it("should render with urgent priority variant", () => {
    renderWithProviders(<Badge variant="urgent">Urgent</Badge>);

    const badge = screen.getByText("Urgent");
    expect(badge).toBeInTheDocument();
  });

  it("should support custom className", () => {
    renderWithProviders(<Badge className="custom-badge">Custom</Badge>);

    const badge = screen.getByText("Custom");
    expect(badge).toHaveClass("custom-badge");
  });

  it("should support custom HTML attributes", () => {
    renderWithProviders(<Badge data-testid="test-badge">Test</Badge>);

    expect(screen.getByTestId("test-badge")).toBeInTheDocument();
  });

  it("should render with icon children", () => {
    renderWithProviders(
      <Badge>
        <span>Icon</span> Badge
      </Badge>
    );

    expect(screen.getByText("Icon")).toBeInTheDocument();
    expect(screen.getByText("Badge")).toBeInTheDocument();
  });

  it("should support onClick handler", async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<Badge onClick={handleClick}>Clickable</Badge>);

    const badge = screen.getByText("Clickable");
    await user.click(badge);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render with aria-label", () => {
    renderWithProviders(<Badge aria-label="Status badge">Active</Badge>);

    expect(screen.getByLabelText("Status badge")).toBeInTheDocument();
  });
});
