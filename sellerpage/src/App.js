import React, { useState } from "react";

const categoriesData = {
  Animals: {
    "Animal Feeding & Watering": [
      "Automatic Pet Feeder",
      "Bee Guards",
      "Bird Feeders",
    ],
    "Animal Food": ["Dog Kennel", "Cat Tree"],
    "Animal Grooming": ["Dog Food", "Dog Treats"],
  },
  Electronics: {
    "Phones & Tablets": ["Smartphone", "Tablet"],
    Computers: ["Laptop", "Monitor"],
  },
};

export default function App() {
  const [form, setForm] = useState({
    productName: "",
    brandName: "",
    sellingPrice: "",
    category: "",
    subcategory: "",
    productType: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    if (name === "category") {
      updatedForm.subcategory = "";
      updatedForm.productType = "";
    } else if (name === "subcategory") {
      updatedForm.productType = "";
    }

    setForm(updatedForm);
  };

  const subcategories = form.category
    ? Object.keys(categoriesData[form.category])
    : [];
  const productTypes = form.subcategory
    ? categoriesData[form.category][form.subcategory]
    : [];

  const handleFileUpload = async () => {
    if (!pdfFile) return;
    setUploading(true);
    setUploadMessage("Uploading...");

    try {
      const uploadData = new FormData();
      uploadData.append("file", pdfFile);

      const uploadRes = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: uploadData,
      });

      const uploadJson = await uploadRes.json();
      const session_id = uploadJson.session_id;

      const genRes = await fetch("http://127.0.0.1:8000/generate-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });

      const genJson = await genRes.json();
      const fields = genJson.fields || {};

      setForm((prev) => ({
        ...prev,
        productName: fields["Product Title"] || prev.productName,
        brandName: fields["Brand"] || prev.brandName,
        sellingPrice: fields["Selling Price"] || prev.sellingPrice,
      }));

      setUploadMessage("Field extraction completed.");
    } catch (error) {
      setUploadMessage("Upload failed.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white h-12 flex items-center justify-center font-semibold text-lg">
        Create item
      </header>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col lg:flex-row gap-4 px-4 py-6 max-w-[1280px] mx-auto w-full overflow-auto">
          {/* Left Panel */}
          <div className="bg-white rounded shadow p-6 flex-1 space-y-6">
            <h2 className="text-lg font-semibold mb-4">Product Identifiers</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">
                Product ID
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <select className="border border-gray-300 px-3 py-2 rounded w-full sm:w-1/3">
                  <option value="">Select</option>
                  <option value="GTIN">GTIN</option>
                  <option value="ISBN">ISBN</option>
                  <option value="UPC">UPC</option>
                  <option value="EAN">EAN</option>
                </select>
                <input
                  type="text"
                  placeholder="Enter Product ID"
                  className="border px-3 py-2 rounded w-full border-gray-300"
                />
              </div>
              <p className="text-xs text-red-500 mt-1">Required</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input className="border rounded w-full px-3 py-2 text-sm" />
            </div>

            <h2 className="text-lg font-semibold mb-4">Item Info</h2>
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">
                    Optimize your content with AI
                  </p>
                  <p className="text-xs text-gray-600">
                    Use our AI to write content for product name, site
                    description and key features.
                    <a className="text-blue-600 ml-1 underline" href="#">
                      Learn more
                    </a>
                  </p>
                </div>
                <button className="border border-black text-sm px-3 py-1 rounded-full hover:bg-gray-100">
                  Help me write
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Product name
              </label>
              <input
                name="productName"
                value={form.productName}
                onChange={handleChange}
                className="border rounded w-full px-3 py-2 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Site description
              </label>
              <textarea
                className="border rounded w-full px-3 py-2 text-sm"
                rows="4"
              />
              <div className="text-xs text-right text-gray-500">0 / 100000</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Key Features
              </label>
              <textarea
                className="border rounded w-full px-3 py-2 text-sm min-h-[100px]"
                placeholder="• "
              />
            </div>

            <h2 className="text-lg font-semibold mb-4">Categorization</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border rounded w-full px-3 py-2 text-sm"
              >
                <option value="">Select Category</option>
                {Object.keys(categoriesData).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {form.category && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  className="border rounded w-full px-3 py-2 text-sm"
                >
                  <option value="">Select Subcategory</option>
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {form.subcategory && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Product Type
                </label>
                <select
                  name="productType"
                  value={form.productType}
                  onChange={handleChange}
                  className="border rounded w-full px-3 py-2 text-sm"
                >
                  <option value="">Select Product Type</option>
                  {productTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <h2 className="text-lg font-semibold mb-4">Brand Info</h2>
            <input
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              className="border rounded w-full px-3 py-2 text-sm mb-4"
            />

            <h2 className="text-lg font-semibold mb-4">Selling Info</h2>
            <input
              type="text"
              name="sellingPrice"
              value={form.sellingPrice}
              onChange={handleChange}
              placeholder="Price $"
              className="border rounded w-full px-3 py-2 text-sm mb-4"
            />
          </div>

          {/* Right Panel */}
          <div className="bg-white rounded shadow p-6 w-full lg:w-1/3 h-fit">
            <p className="text-sm text-gray-500 mb-2">Listing preview</p>
            <div className="flex justify-center items-center h-32 border border-dashed text-gray-300 mb-2">
              <span className="text-6xl">🖼️</span>
            </div>
            <p className="text-sm text-gray-600">Brand</p>
            <p className="font-semibold">{form.brandName || "Brand"}</p>
            <p className="font-semibold">
              {form.productName || "Product Name"}
            </p>
            <p className="text-sm text-gray-600">
              {form.sellingPrice ? `$ ${form.sellingPrice}` : "$ -"}
            </p>

            {/* File Upload Section */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">
                Upload Product PDF
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="mb-2"
              />
              <button
                onClick={handleFileUpload}
                disabled={uploading || !pdfFile}
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-400"
              >
                {uploading ? "Uploading..." : "Upload & Extract"}
              </button>
              {uploadMessage && (
                <p className="text-sm text-gray-500 mt-2">{uploadMessage}</p>
              )}
            </div>
          </div>
        </div>

        <footer className="flex justify-between items-center bg-white border-t px-8 py-4">
          <button className="border border-black px-6 py-2 rounded-full text-sm hover:bg-gray-100">
            Cancel
          </button>
          <div className="space-x-3">
            <button className="bg-gray-200 text-gray-500 px-6 py-2 rounded-full text-sm cursor-not-allowed">
              Save draft
            </button>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm hover:bg-blue-700">
              Submit
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
