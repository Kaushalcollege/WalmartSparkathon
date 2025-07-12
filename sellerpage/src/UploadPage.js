// src/UploadPage.js
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const inputRef = useRef();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragover" || e.type === "dragenter");
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) await handleUpload(file);
  };

  const handleSelect = async (e) => {
    const file = e.target.files[0];
    if (file) await handleUpload(file);
  };

  async function handleUpload(pdfFile) {
    setUploading(true);
    try {
      // 1. Upload
      const uploadData = new FormData();
      uploadData.append("file", pdfFile);
      const uploadRes = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: uploadData,
      });
      const { session_id } = await uploadRes.json();

      // 2. Extract
      await fetch("http://127.0.0.1:8000/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });

      // 3. Generate
      const genRes = await fetch("http://127.0.0.1:8000/generate-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });
      const genJson = await genRes.json();
      const fields = genJson.fields || {};

      // 4. Redirect
      navigate("/seller", { state: { fields } });
    } catch (e) {
      alert("PDF extraction failed.");
      console.error(e);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div
        className={`w-full max-w-md p-8 rounded-2xl shadow-xl bg-white border border-gray-200 flex flex-col items-center transition ${
          dragActive ? "ring-2 ring-blue-400" : ""
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        {/* SVG */}
        <svg
          width="56"
          height="56"
          fill="none"
          viewBox="0 0 56 56"
          className="mb-4 text-blue-600"
        >
          <rect width="56" height="56" rx="16" fill="#e0e7ff" />
          <path
            d="M28 38V18m0 0l-6 6m6-6l6 6"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="font-bold text-xl mb-2">Upload</h2>
        <p className="text-gray-500 mb-6">
          Upload a Product Specification Document.
        </p>
        <input
          type="file"
          accept="application/pdf"
          ref={inputRef}
          style={{ display: "none" }}
          onChange={handleSelect}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
        >
          {uploading ? "Processing..." : "Select PDF"}
        </button>
      </div>
    </div>
  );
}
