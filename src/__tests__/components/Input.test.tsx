import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("render input element", () => {
    render(<Input placeholder="Ketik di sini" />);
    expect(screen.getByPlaceholderText("Ketik di sini")).toBeInTheDocument();
  });

  it("renders as input element", () => {
    render(<Input />);
    const input = document.querySelector("input");
    expect(input).toBeInTheDocument();
    expect(input?.tagName).toBe("INPUT");
  });

  it("type email", () => {
    render(<Input type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("type password", () => {
    render(<Input type="password" />);
    const input = document.querySelector("input[type='password']");
    expect(input).toBeInTheDocument();
  });

  it("menerima onChange", async () => {
    const user = userEvent.setup();
    let value = "";
    render(<Input onChange={(e) => { value = e.target.value; }} />);
    await user.type(screen.getByRole("textbox"), "hello");
    expect(value).toBe("hello");
  });

  it("menerima className tambahan", () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole("textbox").className).toContain("custom-input");
  });

  it("disabled state", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("required state", () => {
    render(<Input required />);
    expect(screen.getByRole("textbox")).toBeRequired();
  });

  it("forwardRef bekerja", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input).toBeInstanceOf(HTMLInputElement);
  });
});