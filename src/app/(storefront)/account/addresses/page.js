"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FiTrash2, FiPlus, FiMapPin, FiPhone, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    address3: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    label: "Home"
  });

  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get("/user/addresses");
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (newAddress) => {
      const { data } = await api.post("/user/addresses", newAddress);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
      toast.success("Address added successfully");
      setShowAddForm(false);
      setFormData({ 
        name: "", email: "", phone: "", address1: "", address2: "", address3: "", city: "", state: "", pincode: "", landmark: "", label: "Home" 
      });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add address"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/user/addresses?id=${id}`);
    },
    onSuccess: () => {
       queryClient.invalidateQueries(["addresses"]);
       toast.success("Address removed");
    },
    onError: (err) => toast.error("Failed to remove address"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.address || !formData.phone) {
        toast.error("Please fill all fields");
        return;
    }
    addMutation.mutate(formData);
  };

  if (isLoading) return <div className="p-8 text-center">Loading addresses...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-gray-900">Address Book</h1>
        <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
            <FiPlus /> {showAddForm ? "Cancel" : "Add New"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8 animate-in fade-in slide-in-from-top-4">
            <h3 className="text-xl font-bold mb-6">New Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name *</label>
                    <input 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Full Name"
                    />
                </div>
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number *</label>
                    <input 
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                         placeholder="+1 234 567 890"
                    />
                 </div>
                 <div className="md:col-span-2">
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Address Line 1 *</label>
                    <input 
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                         value={formData.address1}
                         onChange={e => setFormData({...formData, address1: e.target.value})}
                         placeholder="House No, Building Name"
                    />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Address Line 2</label>
                    <input 
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                         value={formData.address2}
                         onChange={e => setFormData({...formData, address2: e.target.value})}
                         placeholder="Street, Area"
                    />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Address Line 3</label>
                    <input 
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                         value={formData.address3}
                         onChange={e => setFormData({...formData, address3: e.target.value})}
                         placeholder="Landmark (Optional)"
                    />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">City *</label>
                    <input 
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                         value={formData.city}
                         onChange={e => setFormData({...formData, city: e.target.value})}
                         placeholder="City"
                    />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">State</label>
                    <input 
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                         value={formData.state}
                         onChange={e => setFormData({...formData, state: e.target.value})}
                         placeholder="State"
                    />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pincode *</label>
                    <input 
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                         value={formData.pincode}
                         onChange={e => setFormData({...formData, pincode: e.target.value})}
                         placeholder="Pincode"
                    />
                 </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Landmark</label>
                    <input 
                         className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-colors"
                         value={formData.landmark}
                         onChange={e => setFormData({...formData, landmark: e.target.value})}
                         placeholder="Landmark"
                    />
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Label</label>
                    <div className="flex gap-4">
                        {["Home", "Office", "Other"].map(l => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => setFormData({...formData, label: l})}
                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                                    formData.label === l 
                                    ? "bg-black text-white border-black" 
                                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <button 
                    disabled={addMutation.isPending}
                    className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-secondary transition-colors disabled:opacity-50"
                >
                    {addMutation.isPending ? "Saving..." : "Save Address"}
                </button>
            </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses?.map((item) => (
            <div key={item._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative group">
                <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                             <FiMapPin />
                        </div>
                        <div>
                             <p className="font-bold text-gray-900">{item.name}</p>
                             {item.isDefault && <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
                        </div>
                     </div>
                     <button 
                        onClick={() => {
                            if(window.confirm("Are you sure?")) deleteMutation.mutate(item._id);
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-2"
                     >
                        <FiTrash2 />
                     </button>
                </div>
                <div className="space-y-1 text-sm text-gray-500 pl-13 ml-12 border-l-2 border-gray-50 pl-4">
                    {/* Display formatted address if available, otherwise fallback to legacy 'address' field */}
                    {item.address1 ? (
                        <>
                            <p>{item.address1} {item.address2 && `, ${item.address2}`}</p>
                            <p>{item.city} {item.state && `, ${item.state}`} - {item.pincode}</p>
                            {item.landmark && <p className="text-xs text-gray-400">Near {item.landmark}</p>}
                        </>
                    ) : (
                        <p>{item.address}</p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                        <FiPhone size={14} /> {item.phone}
                    </div>
                </div>
            </div>
        ))}
        {addresses?.length === 0 && !showAddForm && (
            <div className="md:col-span-2 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500 mb-4">You haven&apos;t saved any addresses yet.</p>
                <button 
                    onClick={() => setShowAddForm(true)}
                    className="text-primary font-bold hover:underline"
                >
                    Add your first address
                </button>
            </div>
        )}
      </div>
    </div>
  );
}
