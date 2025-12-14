"use client";

import * as React from "react";
import type { JSX } from "react";
import type { DOMConversionMap } from "lexical";


import {
  DecoratorNode,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
} from "lexical";

type SerializedImageNode = SerializedLexicalNode & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  type: "image";
};

class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string;
  __width?: number;
  __height?: number;

  static getType() {
    return "image";
  }

  static clone(node: ImageNode) {
    return new ImageNode(
      node.__src,
      node.__alt,
      node.__width,
      node.__height,
      node.__key
    );
  }

  static importDOM(): DOMConversionMap | null {
  return {
    img: () => ({
      conversion: (domNode: Node) => {
        if (domNode instanceof HTMLImageElement) {
          return {
            node: $createImageNode({
              src: domNode.src,
              alt: domNode.alt,
            }),
          };
        }
        return null;
      },
      priority: 0,
    }),
  };
}

  constructor(
    src: string,
    alt = "",
    width?: number,
    height?: number,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__alt = alt;
    this.__width = width;
    this.__height = height;
  }

  createDOM(config: EditorConfig) {
    const img = document.createElement("img");
    img.src = this.__src;
    img.alt = this.__alt;
    img.style.maxWidth = "100%";
    img.style.display = "block";
    img.className = "rounded-md";
    return img;
  }

  updateDOM(prevNode: ImageNode) {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.src = this.__src;
    element.alt = this.__alt;
    element.style.maxWidth = "100%";
    return { element };
  }

  decorate() {
    return (
      <img src={this.__src} alt={this.__alt} className="rounded-md" />
    );
  }

  static importJSON(serializedNode: SerializedImageNode) {
    return $createImageNode({
      src: serializedNode.src,
      alt: serializedNode.alt,
      width: serializedNode.width,
      height: serializedNode.height,
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      alt: this.__alt,
      width: this.__width,
      height: this.__height,
    };
  }
}

export function $createImageNode({
  src,
  alt = "",
  width,
  height,
}: {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}) {
  return new ImageNode(src, alt, width, height);
}

export default ImageNode;
