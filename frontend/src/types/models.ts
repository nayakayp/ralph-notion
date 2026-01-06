// Re-export store types
export type { User } from "@/stores/authStore";
export type { Workspace } from "@/stores/workspaceStore";
export type { Page } from "@/stores/pageStore";

// Block types for the editor
export type BlockType =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulletList"
  | "numberedList"
  | "todoList"
  | "toggle"
  | "quote"
  | "divider"
  | "callout"
  | "code"
  | "image"
  | "video"
  | "embed"
  | "table"
  | "columns";

export interface BlockProperties {
  checked?: boolean;
  language?: string;
  caption?: string;
  url?: string;
  color?: string;
  icon?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: BlockProperties;
  children?: Block[];
}
