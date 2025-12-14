"use client";

import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";

export default function FontSizePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // no-op — plugin placeholder in case you want to add keyboard shortcuts
    return () => {};
  }, [editor]);

  return null;
}
