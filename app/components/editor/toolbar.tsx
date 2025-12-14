"use client";

import React, { useCallback, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getRoot,
  type TextFormatType,
  type ElementFormatType,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";

import { $createImageNode } from "./nodes/imageNode";

type ToolbarProps = {
  uploadUrl?: string;
};

function Button({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1 border rounded-md text-sm hover:bg-[#F3F3F3] transition"
    >
      {children}
    </button>
  );
}

const HEADING_MAP: Record<number, ElementFormatType> = {
  1: "h1" as ElementFormatType,
  2: "h2" as ElementFormatType,
  3: "h3" as ElementFormatType,
};

export default function Toolbar({ uploadUrl }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState<number>(16);

  const execFormat = useCallback(
    (format: TextFormatType) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor]
  );

  const setHeading = useCallback(
    (level: number | null) => {
      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        if (level === null) {
          // explicit cast to ElementFormatType
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "paragraph" as ElementFormatType);
        } else {
          const el = HEADING_MAP[level];
          if (el) {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, el);
          }
        }
      });
    },
    [editor]
  );

  const insertCodeBlock = useCallback(() => {
    // 'code' is not a plain string of unknown type; cast explicitly
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "code" as ElementFormatType);
  }, [editor]);

  const insertImageFromFile = useCallback(
    async (file?: File) => {
      if (!file) return;

      try {
        const fd = new FormData();
        fd.append("file", file);

        const url =
          uploadUrl ||
          (process.env.NEXT_PUBLIC_API_BASE_URL
            ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-image`
            : "/api/upload-image");

        const res = await fetch(url, {
          method: "POST",
          body: fd,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();

        const imageUrl =
          data.url || data.path || data.location || data.result?.url;

        if (!imageUrl) throw new Error("No URL returned from upload");

        editor.update(() => {
          const imageNode = $createImageNode({ src: imageUrl });
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode]);
          } else {
            $getRoot().append(imageNode);
          }
        });
      } catch (err) {
        console.error("Image upload error:", err);
        alert("Image upload failed. Check console.");
      }
    },
    [editor, uploadUrl]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) insertImageFromFile(f);
      e.currentTarget.value = "";
    },
    [insertImageFromFile]
  );

  const changeFontSize = useCallback(
    (delta: number) => {
      const newSize = Math.max(12, Math.min(48, fontSize + delta));
      setFontSize(newSize);

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        selection.getNodes().forEach((node) => {
          try {
            // @ts-ignore style setter that might exist on element nodes
            node.setStyle && node.setStyle("font-size", `${newSize}px`);
          } catch {}
        });
      });
    },
    [editor, fontSize]
  );

  const applySubscript = useCallback(() => {
    execFormat("subscript");
  }, [execFormat]);

  const applySuperscript = useCallback(() => {
    execFormat("superscript");
  }, [execFormat]);

  const align = useCallback(
    (dir: "left" | "center" | "right" | "justify") => {
      // ElementFormatType may not include 'align-left' by default across versions.
      // Casting is explicit so TypeScript is satisfied.
      editor.dispatchCommand(
        FORMAT_ELEMENT_COMMAND,
        (`align-${dir}` as unknown) as ElementFormatType
      );
    },
    [editor]
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Row 1 */}
      <div className="flex items-center gap-2">
        <div className="flex gap-2">
          <Button onClick={() => setHeading(null)}>Normal</Button>
          <Button onClick={() => setHeading(1)}>H1</Button>
          <Button onClick={() => setHeading(2)}>H2</Button>
          <Button onClick={() => setHeading(3)}>H3</Button>
        </div>

        <div className="ml-4 flex gap-2">
          <Button
            onClick={() =>
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
            }
          >
            • List
          </Button>
          <Button
            onClick={() =>
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            }
          >
            1. List
          </Button>
          <Button onClick={insertCodeBlock}>{`<>`}</Button>
        </div>

        <div className="ml-auto flex gap-2">
          <label className="px-3 py-1 border rounded-md text-sm cursor-pointer hover:bg-[#F3F3F3]">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Row 2 */}
      <div className="flex items-center gap-2">
        <Button onClick={() => execFormat("bold")}>B</Button>
        <Button onClick={() => execFormat("italic")}>I</Button>
        <Button onClick={() => execFormat("underline")}>U</Button>
        <Button onClick={applySubscript}>X₂</Button>
        <Button onClick={applySuperscript}>X³</Button>

        <div className="ml-4 flex items-center gap-2">
          <Button onClick={() => changeFontSize(-2)}>-</Button>
          <div className="text-sm px-2">{fontSize}px</div>
          <Button onClick={() => changeFontSize(2)}>+</Button>
        </div>

        <div className="ml-auto flex gap-2">
          <Button onClick={() => align("left")}>Left</Button>
          <Button onClick={() => align("center")}>Center</Button>
          <Button onClick={() => align("right")}>Right</Button>
          <Button onClick={() => align("justify")}>Justify</Button>
        </div>
      </div>
    </div>
  );
}
