import { test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MainContent } from "../main-content";

// Mock the dependencies
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: any) => <div data-testid="file-system-provider">{children}</div>,
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: any) => <div data-testid="chat-provider">{children}</div>,
}));

vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div data-testid="chat-interface">Chat Interface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div data-testid="file-tree">File Tree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div data-testid="code-editor">Code Editor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div data-testid="preview-frame">Preview Frame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div data-testid="header-actions">Header Actions</div>,
}));

// Mock resizable components
vi.mock("@/components/ui/resizable", () => ({
  ResizableHandle: () => <div data-testid="resizable-handle" />,
  ResizablePanel: ({ children }: any) => <div data-testid="resizable-panel">{children}</div>,
  ResizablePanelGroup: ({ children }: any) => <div data-testid="resizable-panel-group">{children}</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

test("renders main content with providers", () => {
  render(<MainContent />);

  expect(screen.getByTestId("file-system-provider")).toBeDefined();
  expect(screen.getByTestId("chat-provider")).toBeDefined();
});

test("renders chat interface in left panel", () => {
  render(<MainContent />);

  expect(screen.getByText("React Component Generator")).toBeDefined();
  expect(screen.getByTestId("chat-interface")).toBeDefined();
});

test("renders preview and code toggle buttons", () => {
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: /preview/i });
  const codeButton = screen.getByRole("tab", { name: /code/i });

  expect(previewButton).toBeDefined();
  expect(codeButton).toBeDefined();
});

test("preview tab is selected by default", () => {
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: /preview/i });
  const codeButton = screen.getByRole("tab", { name: /code/i });

  expect(previewButton.getAttribute("data-state")).toBe("active");
  expect(codeButton.getAttribute("data-state")).toBe("inactive");
});

test("shows preview frame by default", () => {
  render(<MainContent />);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  // Code editor should not be visible initially
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("switches to code view when code tab is clicked", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  const codeButton = screen.getByRole("tab", { name: /code/i });
  await user.click(codeButton);

  // Code editor and file tree should now be visible
  expect(screen.getByTestId("code-editor")).toBeDefined();
  expect(screen.getByTestId("file-tree")).toBeDefined();

  // Preview frame should be hidden
  expect(screen.queryByTestId("preview-frame")).toBeNull();
});

test("switches back to preview when preview tab is clicked", async () => {
  const user = userEvent.setup();
  render(<MainContent />);

  // First switch to code view
  const codeButton = screen.getByRole("tab", { name: /code/i });
  await user.click(codeButton);
  expect(screen.getByTestId("code-editor")).toBeDefined();

  // Then switch back to preview
  const previewButton = screen.getByRole("tab", { name: /preview/i });
  await user.click(previewButton);

  expect(screen.getByTestId("preview-frame")).toBeDefined();
  expect(screen.queryByTestId("code-editor")).toBeNull();
});

test("tab buttons have correct aria attributes", () => {
  render(<MainContent />);

  const previewButton = screen.getByRole("tab", { name: /preview/i });
  const codeButton = screen.getByRole("tab", { name: /code/i });

  expect(previewButton.getAttribute("role")).toBe("tab");
  expect(codeButton.getAttribute("role")).toBe("tab");
  expect(previewButton.getAttribute("aria-selected")).toBe("true");
  expect(codeButton.getAttribute("aria-selected")).toBe("false");
});

test("passes user and project props correctly", () => {
  const user = {
    id: "test-user-id",
    email: "test@example.com",
  };

  const project = {
    id: "test-project-id",
    name: "Test Project",
    messages: [],
    data: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  render(<MainContent user={user} project={project} />);

  expect(screen.getByTestId("file-system-provider")).toBeDefined();
  expect(screen.getByTestId("chat-provider")).toBeDefined();
});
