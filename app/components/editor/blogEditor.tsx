"use client";

import React, { useCallback, useEffect } from "react";

// Lexical React
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

// Lexical core
import { $getRoot } from "lexical";
import type { EditorState } from "lexical";

// Code highlighting (CORRECT)
import {
  CodeNode,
  CodeHighlightNode,
  registerCodeHighlighting,
} from "@lexical/code";

// Custom
import Toolbar from "./toolbar";
import ImageNode from "./nodes/imageNode";
import FontSizePlugin from "./plugins/fontSizePlugin";

// Styles
import "./editor.css";

/* ✅ Correct theme structure */
const theme = {
  paragraph: "my-para",
  heading: {
    h1: "text-3xl font-extrabold",
    h2: "text-2xl font-bold",
    h3: "text-xl font-semibold",
  },
  list: {
    ul: "ml-6 list-disc",
    ol: "ml-6 list-decimal",
    listitem: "my-1",
  },
  code: "bg-gray-100 rounded px-2 py-1 font-mono text-sm",
};

type BlogEditorProps = {
  initialHtml?: string;
  onChange?: (text: string) => void;
  readOnly?: boolean;
  uploadEndpoint?: string;
};

/* ✅ Code highlighting registrar (REPLACES CodeHighlightPlugin) */
function CodeHighlighting() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return registerCodeHighlighting(editor);
  }, [editor]);

  return null;
}

export default function BlogEditor({
  initialHtml = "",
  onChange,
  readOnly = false,
  uploadEndpoint,
}: BlogEditorProps) {
  const initialConfig = {
    namespace: "BlogEditor",
    theme,
    editable: !readOnly,
    nodes: [ImageNode, CodeNode, CodeHighlightNode],
    onError(error: Error) {
      console.error("Lexical error:", error);
    },
  };

  const handleChange = useCallback(
    (editorState: EditorState) => {
      if (!onChange) return;

      editorState.read(() => {
        const root = $getRoot();
        onChange(root.getTextContent());
      });
    },
    [onChange]
  );

  const uploadUrl =
    uploadEndpoint ||
    (process.env.NEXT_PUBLIC_API_BASE_URL
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/upload-image`
      : "/api/upload-image");

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="bg-white rounded-xl border border-gray-300 shadow p-4">
        <Toolbar uploadUrl={uploadUrl} />

        <div className="mt-3 border rounded-md p-4 bg-white">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="editor-input min-h-[300px] px-1 outline-none" />
            }
            placeholder={<div className="text-gray-400">Write your story…</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />

          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <CodeHighlighting />
          <FontSizePlugin />
          <OnChangePlugin onChange={handleChange} />
        </div>
      </div>
    </LexicalComposer>
  );
}
