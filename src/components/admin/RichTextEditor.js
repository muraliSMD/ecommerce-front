"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill-new/dist/quill.snow.css";

// ReactQuill must be imported dynamically to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return RQ;
  },
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

export default function RichTextEditor({ value, onChange, placeholder }) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [
          { list: "ordered" },
          { list: "bullet" },
          { indent: "-1" },
          { indent: "+1" },
        ],
        ["link", "clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
  ];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all">
      <style jsx global>{`
        .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid #f3f4f6 !important;
          background-color: #f9fafb;
          border-top-left-radius: 1rem;
          border-top-right-radius: 1rem;
        }
        .ql-container {
          border: none !important;
          font-family: inherit !important;
          font-size: 1rem !important;
          border-bottom-left-radius: 1rem;
          border-bottom-right-radius: 1rem;
        }
        .ql-editor {
          min-height: 150px;
          padding: 1.5rem !important;
        }
        .ql-editor.ql-blank::before {
            font-style: normal;
            color: #9ca3af;
        }
        .ql-snow .ql-stroke {
            stroke: #6b7280;
        }
        .ql-snow .ql-fill {
            fill: #6b7280;
        }
      `}</style>
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="text-gray-900"
      />
    </div>
  );
}
