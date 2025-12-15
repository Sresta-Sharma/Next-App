"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $setBlocksType } from "@lexical/selection";
import {
  $getSelection,
  $isRangeSelection,
  TextNode,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getRoot,
  type TextFormatType,
  type ElementFormatType,
  $createParagraphNode,
} from "lexical";
import { $createHeadingNode } from "@lexical/rich-text";
import { $createCodeNode } from "@lexical/code";
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
  title,
  active = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-3 py-1 border rounded-full text-sm
                  max-sm:px-2 max-sm:text-xs
                  cursor-pointer
                hover:bg-[#F3F3F3] transition-colors duration-150
                  ${active ? "bg-gray-900 text-white border-gray-900"
                     : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"}
               `}
    >
      {children}
    </button>
  );
}

export default function Toolbar({ uploadUrl }: ToolbarProps) {
  const [editor] = useLexicalComposerContext();
  const [fontSize, setFontSize] = useState<number>(16);

  // Track active text formats
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  // Listen to selection changes to update active styles
  useEffect(() => {
  return editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const selection = $getSelection();

      if (!$isRangeSelection(selection)) {
        setIsBold(false);
        setIsItalic(false);
        setIsUnderline(false);
        return;
      }

      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
    });
  });
}, [editor]);
  
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
        // Normal paragraph
        $setBlocksType(selection, () => $createParagraphNode());
      } else {
        // H1 / H2 / H3
        $setBlocksType(selection, () =>
          $createHeadingNode(`h${level}` as "h1" | "h2" | "h3")
        );
      }
    });
  },
  [editor]
);

  const insertCodeBlock = useCallback(() => {
  editor.update(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    $setBlocksType(selection, () => $createCodeNode());
  });
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
      const newSize = Math.max(12, Math.min(80, fontSize + delta));
      setFontSize(newSize);

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return;

        const nodes = selection.getNodes();

      nodes.forEach(node => {
        if (node instanceof TextNode) {
          const style = node.getStyle() || "";
          // Update font-size in style string (or append)
          const newStyle = updateFontSizeInStyle(style, newSize);
          node.setStyle(newStyle);
        }
      });
    });
  },
  [editor, fontSize]
  );

  // Helper function to update font-size in style string
function updateFontSizeInStyle(style: string, fontSize: number): string {
  // Remove existing font-size
  const styleWithoutFontSize = style.replace(/font-size:\s*\d+px;?/gi, "");
  // Append new font-size
  return `${styleWithoutFontSize} font-size: ${fontSize}px;`.trim();
}

  const applySubscript = useCallback(() => {
    execFormat("subscript");
  }, [execFormat]);

  const applySuperscript = useCallback(() => {
    execFormat("superscript");
  }, [execFormat]);

  const align = useCallback(
    (dir: "left" | "center" | "right" | "justify") => {
      editor.dispatchCommand(
        FORMAT_ELEMENT_COMMAND,
        dir as ElementFormatType
      );
    },
    [editor]
  );

  return (
    <div className="flex flex-col gap-2 overflow-x-auto">
      {/* Row 1 */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-2">
          <Button title="Normal Paragraph" onClick={() => setHeading(null)}>Normal</Button>
          <Button title="Heading 1" onClick={() => setHeading(1)}>H1</Button>
          <Button title="Heading 2" onClick={() => setHeading(2)}>H2</Button>
          <Button title="Heading 3" onClick={() => setHeading(3)}>H3</Button>
        </div>

        <div className="ml-4 flex gap-2">
          <Button title="Bullet List"
            onClick={() =>
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
            }
          >
            • List
          </Button>
          <Button title="Numbered List"
            onClick={() =>
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
            }
          >
            1. List
          </Button>
          <Button title="Insert CodeBlock" onClick={insertCodeBlock}>{`<>`}</Button>
        </div>

        <div className="ml-auto flex gap-2 max-sm:ml-0">
          <label className="px-3 py-1 border rounded-full text-sm cursor-pointer
                            bg-white text-gray-800 border-gray-300 hover:bg-gray-100
                            transition-colors duration-150">
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
      <div className="flex items-center gap-2 flex-wrap">
        <Button title="Bold" onClick={() => execFormat("bold")} active={isBold}>B</Button>
        <Button title="Italic" onClick={() => execFormat("italic")} active={isItalic}>I</Button>
        <Button title="Underline" onClick={() => execFormat("underline")} active={isUnderline}>U</Button>
        <Button title="Subscript" onClick={applySubscript}>X₂</Button>
        <Button title="Superscript" onClick={applySuperscript}>X³</Button>

        <div className="ml-4 flex items-center gap-2">
          <Button onClick={() => changeFontSize(-2)}>-</Button>
          {/* Editable font size input */}
          <input
            type="number"
            min={12}
            max={80}
            value={fontSize}
            onChange={(e) => {
              let val = parseInt(e.target.value);
              if (isNaN(val)) val = 16;
              val = Math.min(80, Math.max(12, val));
              setFontSize(val);

              editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;

                selection.getNodes().forEach((node) => {
                  if (node instanceof TextNode) {
                    const style = node.getStyle() || "";
                    const newStyle = updateFontSizeInStyle(style, val);
                    node.setStyle(newStyle);
                  }
                });
              });
            }}
            className="w-12 text-center text-sm border border-gray-300 rounded px-1 py-0.5"
          />
          <Button onClick={() => changeFontSize(2)}>+</Button>
        </div>

        <div className="ml-auto flex gap-2">
          <Button title="Align Left" onClick={() => align("left")}>Left</Button>
          <Button title="Align Center" onClick={() => align("center")}>Center</Button>
          <Button title="Align Right" onClick={() => align("right")}>Right</Button>
          <Button title="Justify Text" onClick={() => align("justify")}>Justify</Button>
        </div>
      </div>
    </div>
  );
}
