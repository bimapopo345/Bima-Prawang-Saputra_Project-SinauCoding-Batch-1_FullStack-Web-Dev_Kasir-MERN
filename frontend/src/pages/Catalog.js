// frontend/src/pages/Catalog.js
import React, { useEffect, useState } from "react";
import axios from "axios";

const Catalog = ({ setToast }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  // Filter category
  const [activeCategory, setActiveCategory] = useState("All");

  // Form
  const [formMode, setFormMode] = useState("add");
  const [selectedItem, setSelectedItem] = useState(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // GET /api/menu
  const fetchMenuItems = async () => {
    try {
      const res = await axios.get("/api/menu");
      setMenuItems(res.data);
      setFilteredItems(res.data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setToast?.({ type: "error", message: "Gagal mengambil data menu" });
    }
  };

  // Filter
  const handleCategoryFilter = (cat) => {
    setActiveCategory(cat);
    if (cat === "All") {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(
        (item) => item.category.toLowerCase() === cat.toLowerCase()
      );
      setFilteredItems(filtered);
    }
    handleResetForm();
  };

  const handleSelectItem = (item) => {
    setFormMode("edit");
    setSelectedItem(item);
    setName(item.name);
    setCategory(item.category);
    setPrice(item.price);
    setDescription(item.description);
    setImagePreview(item.image);
    setImageFile(null);
  };

  const handleAddNew = () => {
    setFormMode("add");
    handleResetForm();
  };

  const handleResetForm = () => {
    setSelectedItem(null);
    setName("");
    setCategory("");
    setPrice("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // CREATE/UPDATE
  const handleSubmitForm = async () => {
    try {
      let uploadedImagePath = "";

      // Upload file jika user pilih
      if (imageFile) {
        const formData = new FormData();
        formData.append("imageFile", imageFile);

        const uploadRes = await axios.post("/api/menu/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedImagePath = uploadRes.data.imagePath;
      }

      const newItem = {
        name,
        category,
        price: Number(price),
        description,
        image:
          uploadedImagePath ||
          imagePreview ||
          "https://via.placeholder.com/300x200.png?text=No+Image",
      };

      if (formMode === "add") {
        // POST /api/menu
        const res = await axios.post("/api/menu", newItem);
        if (res.status === 201) {
          setToast?.({ type: "success", message: "Berhasil menambah menu" });
          fetchMenuItems();
          handleResetForm();
        }
      } else {
        // UPDATE
        if (!selectedItem) return;
        const res = await axios.put(`/api/menu/${selectedItem._id}`, newItem);
        if (res.status === 200) {
          setToast?.({ type: "success", message: "Menu berhasil diupdate" });
          fetchMenuItems();
          handleResetForm();
          setFormMode("add");
        }
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      setToast?.({ type: "error", message: "Gagal menyimpan data" });
    }
  };

  // DELETE
  const handleDelete = async (item) => {
    if (!window.confirm(`Yakin menghapus "${item.name}"?`)) return;
    try {
      console.log("Deleting item._id:", item._id); // debug
      const res = await axios.delete(`/api/menu/${item._id}`);
      console.log("Delete response:", res.data); // debug

      setToast?.({ type: "success", message: "Menu berhasil dihapus" });
      fetchMenuItems();

      // kalau sedang edit item yg dihapus, reset form
      if (selectedItem && selectedItem._id === item._id) {
        handleResetForm();
        setFormMode("add");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      // Lihat error.response, error.response?.status, dsb
      setToast?.({ type: "error", message: "Gagal menghapus data" });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Kiri: List Menu */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">List Menu</h1>
          <span className="text-sm text-gray-500">
            Total: {filteredItems.length} Menu
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => handleCategoryFilter("All")}
            className={`px-4 py-2 rounded-lg border ${
              activeCategory === "All" ? "bg-blue-600 text-white" : ""
            }`}
          >
            All Menu
          </button>
          <button
            onClick={() => handleCategoryFilter("Food")}
            className={`px-4 py-2 rounded-lg border ${
              activeCategory === "Food" ? "bg-blue-600 text-white" : ""
            }`}
          >
            Foods
          </button>
          <button
            onClick={() => handleCategoryFilter("Beverages")}
            className={`px-4 py-2 rounded-lg border ${
              activeCategory === "Beverages" ? "bg-blue-600 text-white" : ""
            }`}
          >
            Beverages
          </button>
          <button
            onClick={() => handleCategoryFilter("Dessert")}
            className={`px-4 py-2 rounded-lg border ${
              activeCategory === "Dessert" ? "bg-blue-600 text-white" : ""
            }`}
          >
            Dessert
          </button>
        </div>

        {/* Daftar Item */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg overflow-hidden bg-white shadow-sm"
            >
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-40 object-cover"
                />
                <span className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                  {item.category}
                </span>
              </div>
              <div className="p-3">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-blue-600 font-semibold">
                    Rp {item.price.toLocaleString()}
                  </span>
                  <div className="flex space-x-2">
                    {/* Edit button */}
                    <button
                      onClick={() => handleSelectItem(item)}
                      className="text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536M2 12.5a9.5
                           9.5 0 1119 0 9.5 9.5 0 01-19 0zm10-3h1v3h-1v-3z"
                        />
                      </svg>
                    </button>
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-400 hover:text-red-600"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.136
                           21H7.864a2 2 0 01-1.997-1.858L5 7m5
                           4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0
                           00-1 1v3m5 0H9"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanan: Form Add/Edit */}
      <div className="w-[350px] sm:w-[400px] border-l bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl">
            {formMode === "add" ? "Add Menu" : "Edit Menu"}
          </h2>
          <button
            onClick={handleAddNew}
            className="bg-blue-600 text-white px-2 py-1 rounded"
          >
            +
          </button>
        </div>

        {/* Preview */}
        <div
          className="mt-4 border-dashed border-2 border-gray-300
            flex items-center justify-center h-32 overflow-hidden rounded-md"
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="h-full object-cover"
            />
          ) : (
            <div className="text-gray-400 text-sm text-center">
              Drag/Drop or &nbsp;
              <label className="text-blue-600 underline cursor-pointer">
                Choose File
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select category</option>
              <option value="Food">Food</option>
              <option value="Beverages">Beverages</option>
              <option value="Dessert">Dessert</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Price</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
            />
          </div>
        </div>

        <button
          onClick={handleSubmitForm}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default Catalog;
