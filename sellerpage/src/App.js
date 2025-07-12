// src/App.js
import React, { useState } from "react";
import sampleImage from "./sample.png";

const categoriesData = {
  Animals: {
    "Animal Feeding & Watering": [
      "Automatic Pet Feeder",
      "Bee Guards",
      "Bird Feeder Domes & Baffles",
      "Bird Feeders",
      "Butterfly Feeders",
      "Feed Scoops",
      "Hay Nets",
      "Hog Feeders",
      "Hog Watering Nipples",
      "Hummingbird Feeders",
      "Outdoor Bird Bath Stands",
      "Outdoor Bird Baths",
    ],
    "Animal Food": ["Dog Kennel", "Cat Tree"],
    "Animal Grooming": [
      "Animal Feed",
      "Bird Food",
      "Bird Seed Cakes",
      "Bird Treats",
      "Butterfly Nectar",
      "Cat Food",
      "Cat Treats",
      "Dog Food",
      "Dog Treats",
      "Fish Food",
      "Hummingbird Nectar",
      "Poultry Feed",
      "Reptile Food",
      "Small Animal Food",
      "Small Animal Treats",
      "Squirrel & Critter Food",
      "Wild Bird Feed",
    ],
    /* …other subcategories… */
  },
  Electronics: {
    "Phones & Tablets": ["Smartphone", "Tablet"],
    Computers: ["Laptop", "Monitor"],
  },
  Fashion: {
    Men: ["Shirts", "Jeans"],
    Women: ["Dresses", "Shoes"],
  },
};

export default function App() {
  // ▶️ Expand your form state to include all LLM-extracted fields
  const [form, setForm] = useState({
    productId: "",
    idType: "", // GTIN/UPC/…
    sku: "",
    productName: "",
    siteDescription: "",
    keyFeatures: "",
    brandName: "",
    fulfillmentOption: "",
    condition: "",
    sellingPrice: "",
    imageUrl: "",
    category: "",
    subcategory: "",
    productType: "",
  });

  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  // 1️⃣ Generic form change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    // If category changes, reset subcategory & productType
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subcategory: "", productType: "" } : {}),
      ...(name === "subcategory" ? { productType: "" } : {}),
    }));
  };

  // 2️⃣ File selector for PDF
  const handleFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  // 3️⃣ Image upload preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      // also store the URL or file object if you need to submit
      setForm((prev) => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    }
  };

  // 4️⃣ Upload PDF → extract → generate fields → populate form
  const handleFileUpload = async () => {
    if (!pdfFile) return;
    setUploading(true);
    setUploadMessage("Uploading...");

    try {
      const uploadData = new FormData();
      uploadData.append("file", pdfFile);

      // a) upload
      const uploadRes = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: uploadData,
      });
      const { session_id } = await uploadRes.json();

      // b) extract
      await fetch("http://127.0.0.1:8000/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });

      // c) generate
      const genRes = await fetch("http://127.0.0.1:8000/generate-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id }),
      });
      const genJson = await genRes.json();
      const fields = genJson.fields || {};

      // d) map JSON → form state (join bullets for keyFeatures)
      setForm((prev) => ({
        ...prev,
        productId: fields["Product ID"] || prev.productId,
        idType: fields["ID Type"] || prev.idType,
        sku: fields["SKU"] || prev.sku,
        productName: fields["Product name"] || prev.productName,
        siteDescription: fields["Site description"] || prev.siteDescription,
        keyFeatures: Array.isArray(fields["Key features"])
          ? fields["Key features"].join("\n• ")
          : fields["Key features"] || prev.keyFeatures,
        brandName: fields["Brand name"] || prev.brandName,
        fulfillmentOption:
          fields["Fulfillment option"] || prev.fulfillmentOption,
        condition: fields["Type of condition"] || prev.condition,
        sellingPrice: fields["Selling Price"] || prev.sellingPrice,
        imageUrl: Array.isArray(fields["Image URLs"])
          ? fields["Image URLs"][0]
          : fields["Image URLs"] || prev.imageUrl,
      }));

      setUploadMessage("Field extraction completed.");
    } catch (err) {
      console.error(err);
      setUploadMessage("Upload or extraction failed.");
    } finally {
      setUploading(false);
    }
  };

  // Derived dropdown lists
  const subcategories = form.category
    ? Object.keys(categoriesData[form.category])
    : [];
  const productTypes = form.subcategory
    ? categoriesData[form.category][form.subcategory]
    : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white h-12 flex items-center justify-center font-semibold text-lg">
        Create item
      </header>

      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col lg:flex-row gap-4 px-4 py-6 max-w-[1280px] mx-auto w-full overflow-auto">
          {/* ─── Left Panel ───────────────────────────────────────────────────────── */}
          <div className="bg-white rounded shadow p-6 flex-1 space-y-6">
            {/* Product Identifiers */}
            <h2 className="text-lg font-semibold">Product Identifiers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  ID Type
                </label>
                <select
                  name="idType"
                  value={form.idType}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="">Select</option>
                  <option value="GTIN">GTIN</option>
                  <option value="ISBN">ISBN</option>
                  <option value="UPC">UPC</option>
                  <option value="EAN">EAN</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Product ID
                </label>
                <input
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  placeholder="Enter Product ID"
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                className="border rounded w-full px-3 py-2 text-sm"
              />
            </div>

            {/* Item Info */}
            <h2 className="text-lg font-semibold">Item Info</h2>
            {/* AI helper banner */}
            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">
                    Optimize your content with AI
                  </p>
                  <p className="text-xs text-gray-600">
                    Use our AI to write product name, description and features.
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

            <div>
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

            <div>
              <label className="block text-sm font-medium mb-1">
                Site description
              </label>
              <textarea
                name="siteDescription"
                value={form.siteDescription}
                onChange={handleChange}
                rows={4}
                className="border rounded w-full px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Key Features
              </label>
              <textarea
                name="keyFeatures"
                value={form.keyFeatures}
                onChange={handleChange}
                placeholder="• "
                className="border rounded w-full px-3 py-2 text-sm min-h-[100px]"
              />
            </div>

            {/* Categorization */}
            <h2 className="text-lg font-semibold">Categorization</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="border rounded w-full px-3 py-2 text-sm"
              >
                <option value="">Select Category</option>
                {Object.keys(categoriesData).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div>
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
                  {subcategories.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {productTypes.length > 0 && (
              <div>
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
                  {productTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Brand Info */}
            <h2 className="text-lg font-semibold">Brand Info</h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Brand name
              </label>
              <input
                name="brandName"
                value={form.brandName}
                onChange={handleChange}
                className="border rounded w-full px-3 py-2 text-sm"
              />
            </div>

            {/* Fulfillment */}
            <h2 className="text-lg font-semibold">Fulfillment</h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Fulfillment option
              </label>
              <select
                name="fulfillmentOption"
                value={form.fulfillmentOption}
                onChange={handleChange}
                className="border rounded w-full px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option value="Seller Fulfilled">Seller Fulfilled</option>
                <option value="Walmart Fulfilled">Walmart Fulfilled</option>
              </select>
            </div>

            {/* Condition */}
            <h2 className="text-lg font-semibold">Condition</h2>
            <div>
              <label className="block text-sm font-medium mb-1">
                Type of condition
              </label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="border rounded w-full px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Refurbished">Refurbished</option>
              </select>
            </div>

            {/* Required to sell */}
            <div className="border rounded-md p-4 mt-6 shadow-sm">
              <h2 className="text-lg font-semibold flex items-center">
                Required to sell on Walmart website
                <svg
                  className="ml-2 w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Selling Price
                </label>
                <input
                  type="text"
                  name="sellingPrice"
                  value={form.sellingPrice}
                  onChange={handleChange}
                  placeholder="$"
                  className="border rounded w-full px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Shipping Weight (lbs)
                </label>
                <input
                  type="number"
                  className="border rounded w-full px-3 py-2 text-sm"
                  defaultValue={0}
                />
              </div>
            </div>
          </div>

          {/* ─── Right Preview Panel ─────────────────────────────────────────────── */}
          <div className="bg-white rounded shadow p-6 w-full lg:w-1/3 h-fit">
            <p className="text-sm text-gray-500 mb-2">Listing preview</p>
            <div className="flex justify-center items-center h-32 border border-dashed text-gray-300 mb-2">
              <img
                src={previewImage || form.imageUrl || sampleImage}
                alt="Listing Preview"
                className="h-full object-contain"
              />
            </div>
            <p className="font-semibold">
              {form.productName || "Product Name"}
            </p>
            <p className="text-sm text-gray-600">
              {form.sellingPrice ? `$ ${form.sellingPrice}` : "$ -"}
            </p>

            {/* Uploads */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />

              <label className="block text-sm font-medium mb-1">
                Upload Product PDF
              </label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
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

        {/* Footer */}
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
