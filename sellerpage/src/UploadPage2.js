// src/UploadPage2.js
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage2() {
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
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7fa]">
      <div
        className={`w-full max-w-xl mx-auto py-14 px-8 rounded-2xl shadow-2xl bg-white flex flex-col items-center border border-gray-100 transition ${
          dragActive ? "ring-2 ring-blue-400" : ""
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        style={{
          minHeight: "350px",
        }}
      >
        {/* Blue icon w/ up arrow, matches screenshot 1 */}
        <div
          className="rounded-2xl bg-[#e6ebff] mb-6 flex items-center justify-center"
          style={{ width: 80, height: 80 }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 17V9"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 13l4-4 4 4"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-bold text-3xl mb-3">Upload</h2>
        <p className="text-gray-500 text-xl mb-8 text-center">
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
          className="bg-[#2563eb] hover:bg-blue-700 text-white text-lg font-medium px-8 py-3 rounded-xl shadow transition"
          onClick={() => inputRef.current.click()}
          disabled={uploading}
        >
          {uploading ? "Processing..." : "Select PDF"}
        </button>
      </div>
    </div>
  );
}
