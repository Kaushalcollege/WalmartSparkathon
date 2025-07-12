// src/App.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import sampleImage from "./sample.png";
import axios from "axios";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const extractedFields = location.state?.fields || {};

  const [form, setForm] = useState({
    productId: "",
    idType: "",
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

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [productTypeOptions, setProductTypeOptions] = useState([]);
  const [llmLoading, setLlmLoading] = useState(false);

  // ----------- LLM-powered options fetcher -----------
  const fetchLlmOptions = async (category, subcategory) => {
    setLlmLoading(true);
    try {
      const res = await axios.post("http://localhost:8001/match-categories", {
        extracted_category: category || extractedFields["Category"] || "",
        extracted_subcategory:
          subcategory || extractedFields["Subcategory"] || "",
        extracted_product_type: extractedFields["Product Type"] || "",
        product_name: extractedFields["Product name"] || "",
      });
      setForm((prev) => ({
        ...prev,
        category: res.data.category || "",
        subcategory: res.data.subcategory || "",
        productType: res.data.product_type || "",
      }));
      setCategoryOptions(res.data.category_options || []);
      setSubcategoryOptions(res.data.subcategory_options || []);
      setProductTypeOptions(res.data.product_type_options || []);
    } catch (err) {
      setCategoryOptions([]);
      setSubcategoryOptions([]);
      setProductTypeOptions([]);
    }
    setLlmLoading(false);
  };

  // ----------- On mount: get options from LLM -----------
  useEffect(() => {
    if (!extractedFields || Object.keys(extractedFields).length === 0) return;
    fetchLlmOptions();
    // eslint-disable-next-line
  }, [extractedFields]);

  // ----------- Fill other fields on mount -----------
  useEffect(() => {
    const idTypesPriority = ["EAN", "GTIN", "ISBN", "UPC"];
    let detectedIdType = "";
    let detectedIdValue = "";

    for (const idType of idTypesPriority) {
      const value = extractedFields[idType];
      if (value && value !== "Not available") {
        detectedIdType = idType;
        detectedIdValue = value;
        break;
      }
    }
    if (!detectedIdType) {
      detectedIdType = extractedFields["ID Type"] || "";
      detectedIdValue = extractedFields["Product ID"] || "";
    }

    setForm((prev) => ({
      ...prev,
      productId: detectedIdValue || "",
      idType: detectedIdType || "",
      sku: extractedFields["SKU"] || "",
      productName: extractedFields["Product name"] || "",
      siteDescription: extractedFields["Site description"] || "",
      keyFeatures: Array.isArray(extractedFields["Key features"])
        ? extractedFields["Key features"].join("\n- ")
        : extractedFields["Key features"] || "",
      brandName: extractedFields["Brand name"] || "",
      fulfillmentOption: extractedFields["Fulfillment option"] || "",
      condition: extractedFields["Type of condition"] || "",
      sellingPrice: extractedFields["Selling Price"] || "",
      imageUrl: Array.isArray(extractedFields["Image URLs"])
        ? extractedFields["Image URLs"][0]
        : extractedFields["Image URLs"] || "",
    }));
    // eslint-disable-next-line
  }, [extractedFields]);

  // ----------- Dynamic Dropdown Handlers -----------
  const handleCategoryChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      category: value,
      subcategory: "",
      productType: "",
    }));
    await fetchLlmOptions(value, "");
  };
  const handleSubcategoryChange = async (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      subcategory: value,
      productType: "",
    }));
    await fetchLlmOptions(form.category, value);
  };
  const handleProductTypeChange = (e) => {
    setForm((prev) => ({
      ...prev,
      productType: e.target.value,
    }));
  };

  // ----------- Generic Field Handler -----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ----------- UI -----------
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white h-12 flex items-center justify-center font-semibold text-lg">
        Create item
      </header>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex flex-col lg:flex-row gap-4 px-4 py-6 max-w-[1280px] mx-auto w-full overflow-auto">
          {/* Left Panel */}
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
              <label className="block text-sm font-semibold mb-1">SKU</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                className="border rounded w-full px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
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
              <label className="block text-sm font-semibold mb-1">
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
              <label className="block text-sm font-semibold mb-1">
                Key Features
              </label>
              <textarea
                name="keyFeatures"
                value={form.keyFeatures}
                onChange={handleChange}
                placeholder="- "
                className="border rounded w-full px-3 py-2 text-sm min-h-[100px]"
              />
            </div>

            {/* AI-powered Categorization */}
            <h2 className="text-lg font-semibold">
              Categorization (AI-powered)
            </h2>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleCategoryChange}
                className="border rounded w-full px-3 py-2 text-sm"
                disabled={llmLoading}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Subcategory
              </label>
              <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleSubcategoryChange}
                className="border rounded w-full px-3 py-2 text-sm"
                disabled={llmLoading || !form.category}
              >
                <option value="">Select Subcategory</option>
                {subcategoryOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Product Type
              </label>
              <select
                name="productType"
                value={form.productType}
                onChange={handleProductTypeChange}
                className="border rounded w-full px-3 py-2 text-sm"
                disabled={llmLoading || !form.category || !form.subcategory}
              >
                <option value="">Select Product Type</option>
                {productTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

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
          {/* Right Preview Panel */}
          <div className="bg-white rounded shadow p-6 w-full lg:w-1/3 h-fit">
            <p className="text-sm text-gray-500 mb-2">Listing preview</p>
            <div className="flex justify-center items-center h-32 border border-dashed text-gray-300 mb-2">
              <img
                src={form.imageUrl || sampleImage}
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
          </div>
        </div>
        {/* Footer */}
        <footer className="flex justify-between items-center bg-white border-t px-8 py-4">
          <button
            className="border border-black px-6 py-2 rounded-full text-sm hover:bg-gray-100"
            onClick={() => navigate("/")}
          >
            Back to Upload
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
