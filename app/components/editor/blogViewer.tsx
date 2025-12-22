"use client";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import type { EditorThemeClasses } from "lexical";

const theme: EditorThemeClasses = {};

export default function BlogViewer({ content }: { content: any }) {
  const initializeEditorState = (editor: any) => {
    const editorState = editor.parseEditorState(content);
    editor.setEditorState(editorState);
  };

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "BlogViewer",
        editorState: initializeEditorState,
        editable: false,
        theme,
        onError(error) {
          console.error("Lexical Error:", error);
        },
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable className="outline-none" />}
        placeholder={null}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </LexicalComposer>
  );
}
