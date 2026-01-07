import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Shadcn UI Components", () => {
  describe("Button", () => {
    it("should render with default variant", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("bg-primary");
    });

    it("should render with destructive variant", () => {
      render(<Button variant="destructive">Delete</Button>);

      const button = screen.getByRole("button", { name: /delete/i });
      expect(button).toHaveClass("bg-destructive");
    });

    it("should render with outline variant", () => {
      render(<Button variant="outline">Outline</Button>);

      const button = screen.getByRole("button", { name: /outline/i });
      expect(button).toHaveClass("border");
      expect(button).toHaveClass("border-input");
    });

    it("should render with different sizes", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole("button", { name: /small/i });
      expect(button).toHaveClass("h-9");
    });

    it("should handle click events", async () => {
      const user = userEvent.setup();
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button", { name: /click me/i });
      await user.click(button);

      expect(clicked).toBe(true);
    });

    it("should be disabled when disabled prop is passed", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button", { name: /disabled/i });
      expect(button).toBeDisabled();
    });

    it("should apply Tailwind CSS classes correctly", () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole("button", { name: /custom/i });
      expect(button).toHaveClass("custom-class");
      // Should still have base classes
      expect(button).toHaveClass("inline-flex");
      expect(button).toHaveClass("items-center");
    });
  });

  describe("Input", () => {
    it("should render correctly", () => {
      render(<Input placeholder="Enter text" />);

      const input = screen.getByPlaceholderText("Enter text");
      expect(input).toBeInTheDocument();
    });

    it("should accept different types", () => {
      render(<Input type="email" placeholder="Enter email" />);

      const input = screen.getByPlaceholderText("Enter email");
      expect(input).toHaveAttribute("type", "email");
    });

    it("should handle user input", async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Type here" />);

      const input = screen.getByPlaceholderText("Type here");
      await user.type(input, "Hello World");

      expect(input).toHaveValue("Hello World");
    });

    it("should be disabled when disabled prop is passed", () => {
      render(<Input disabled placeholder="Disabled input" />);

      const input = screen.getByPlaceholderText("Disabled input");
      expect(input).toBeDisabled();
    });

    it("should apply Tailwind CSS classes correctly", () => {
      render(<Input className="custom-input" placeholder="Custom" />);

      const input = screen.getByPlaceholderText("Custom");
      expect(input).toHaveClass("custom-input");
      // Should have base classes
      expect(input).toHaveClass("flex");
      expect(input).toHaveClass("rounded-md");
    });
  });

  describe("Card", () => {
    it("should render Card component", () => {
      render(<Card data-testid="card">Card content</Card>);

      const card = screen.getByTestId("card");
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("rounded-lg");
      expect(card).toHaveClass("border");
    });

    it("should render CardHeader component", () => {
      render(<CardHeader data-testid="card-header">Header</CardHeader>);

      const header = screen.getByTestId("card-header");
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass("flex");
      expect(header).toHaveClass("flex-col");
    });

    it("should render CardTitle component", () => {
      render(<CardTitle>Title</CardTitle>);

      const title = screen.getByText("Title");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("text-2xl");
      expect(title).toHaveClass("font-semibold");
    });

    it("should render CardDescription component", () => {
      render(<CardDescription>Description</CardDescription>);

      const description = screen.getByText("Description");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm");
    });

    it("should render CardContent component", () => {
      render(<CardContent data-testid="card-content">Content</CardContent>);

      const content = screen.getByTestId("card-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass("p-6");
    });

    it("should render CardFooter component", () => {
      render(<CardFooter data-testid="card-footer">Footer</CardFooter>);

      const footer = screen.getByTestId("card-footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass("flex");
      expect(footer).toHaveClass("items-center");
    });

    it("should render complete Card with all subcomponents", () => {
      render(
        <Card data-testid="full-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description text</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the card content</p>
          </CardContent>
          <CardFooter>
            <Button>Action</Button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId("full-card")).toBeInTheDocument();
      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card description text")).toBeInTheDocument();
      expect(screen.getByText("This is the card content")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /action/i })).toBeInTheDocument();
    });
  });

  describe("Tailwind CSS Classes", () => {
    it("should apply utility classes correctly", () => {
      render(
        <div data-testid="tailwind-test" className="flex items-center gap-4 p-4">
          <Button className="w-full">Full Width</Button>
        </div>
      );

      const container = screen.getByTestId("tailwind-test");
      expect(container).toHaveClass("flex");
      expect(container).toHaveClass("items-center");
      expect(container).toHaveClass("gap-4");
      expect(container).toHaveClass("p-4");

      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-full");
    });
  });
});
