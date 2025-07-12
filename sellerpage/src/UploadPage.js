// src/UploadPage.js
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const pdfInputRef = useRef();
  const imgInputRef = useRef();
  const [dragActive, setDragActive] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const navigate = useNavigate();

  // --- PDF Upload Handlers ---
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

  // --- Image Upload Handlers ---
  const handleImageSelect = (e) => {
    setSelectedImages([...e.target.files]);
  };

  async function handleImageUpload() {
    if (!selectedImages.length) return;
    setImageUploading(true);
    try {
      const formData = new FormData();
      selectedImages.forEach((img) => formData.append("files", img));
      const uploadRes = await fetch("http://127.0.0.1:8000/upload-images", {
        method: "POST",
        body: formData,
      });
      const { session_id } = await uploadRes.json();

      // Extract
      await fetch("http://127.0.0.1:8000/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });

      // Generate
      const genRes = await fetch("http://127.0.0.1:8000/generate-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });
      const genJson = await genRes.json();
      const fields = genJson.fields || {};

      // Redirect
      navigate("/seller", { state: { fields } });
    } catch (e) {
      alert("Image extraction failed.");
      console.error(e);
    } finally {
      setImageUploading(false);
      setSelectedImages([]);
    }
  }

  // --- UI Render ---
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white border border-gray-200 flex flex-col items-center">
        {/* PDF Upload Section */}
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
        <p className="text-gray-500 mb-6">Upload a Document or Image(s).</p>
        <input
          type="file"
          accept="application/pdf"
          ref={pdfInputRef}
          style={{ display: "none" }}
          onChange={handleSelect}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition mb-3"
          onClick={() => pdfInputRef.current.click()}
          disabled={uploading || imageUploading}
        >
          {uploading ? "Processing..." : "Select PDF"}
        </button>

        {/* OR separator */}
        <div className="my-3 flex items-center w-full">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="px-2 text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Image Upload Section */}
        <input
          type="file"
          accept="image/*"
          multiple
          ref={imgInputRef}
          style={{ display: "none" }}
          onChange={handleImageSelect}
        />
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg shadow transition"
          onClick={() => imgInputRef.current.click()}
          disabled={imageUploading || uploading}
        >
          {imageUploading ? "Processing..." : "Select Images"}
        </button>

        {selectedImages.length > 0 && (
          <div className="my-4 w-full">
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedImages.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt={`Selected ${idx}`}
                  className="w-16 h-16 object-cover rounded shadow"
                />
              ))}
            </div>
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded shadow w-full"
              onClick={handleImageUpload}
              disabled={imageUploading}
            >
              {imageUploading ? "Processing..." : "Done"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
