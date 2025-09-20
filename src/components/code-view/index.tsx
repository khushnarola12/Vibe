"use client";

import { useEffect } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism.css";

// load only the languages you need
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";

import "./code-theme.css";

interface Props {
  code: string;
  lang: string;
}

export const CodeView = ({ code, lang }: Props) => {
    useEffect(()=>{
        Prism.highlightAll()
    },[code])

  return (
    <pre className="p-2  m-0 text-m">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  );
};
