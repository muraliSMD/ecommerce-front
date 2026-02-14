"use client";

import { useState, useMemo } from "react";
import { FiChevronRight, FiChevronDown, FiCheck, FiFolder } from "react-icons/fi";

const CategoryNode = ({ category, allCategories, selectedId, onSelect, level = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Find children
    const children = useMemo(() => 
        allCategories.filter(c => c.parent?._id === category._id || c.parent === category._id),
    [allCategories, category._id]);

    const hasChildren = children.length > 0;
    const isSelected = selectedId === category._id;

    // Auto-expand if selected category is a descendant
    // This is a bit complex for a recursive component without passing down "selectedPath"
    // For now, manual expansion or simple "expand all" might be easier, 
    // but improving UX: if `isSelected`, parent should be open. 
    // Handled by parent check? No, this node doesn't know if it's in the path of selected.
    // Let's keep it simple: manual toggle.

    return (
        <div className="select-none">
            <div 
                className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/10 text-primary font-bold" : "hover:bg-gray-50 text-gray-700"
                }`}
                style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect(category._id);
                }}
            >
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                    className={`p-0.5 rounded hover:bg-black/5 text-gray-400 ${!hasChildren ? "invisible" : ""}`}
                >
                    {isOpen ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                </button>
                
                <span className="text-sm flex-1 truncate">{category.name}</span>
                {isSelected && <FiCheck size={14} />}
            </div>

            {isOpen && hasChildren && (
                <div>
                    {children.map(child => (
                        <CategoryNode 
                            key={child._id} 
                            category={child} 
                            allCategories={allCategories} 
                            selectedId={selectedId}
                            onSelect={onSelect}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function CategorySelector({ categories, value, onChange, className = "" }) {
    const [searchTerm, setSearchTerm] = useState("");

    // Identify root categories
    const rootCategories = useMemo(() => 
        categories?.filter(c => !c.parent) || [], 
    [categories]);

    // Simple search filtering (flattens tree if searching)
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return rootCategories;
        return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm, rootCategories]);

    const selectedCategory = categories?.find(c => c._id === value);

    // Helper to get breadcrumb path
    const getPath = (catId) => {
        const cat = categories?.find(c => c._id === catId);
        if (!cat) return "";
        const parentPath = cat.parent ? getPath(typeof cat.parent === 'object' ? cat.parent._id : cat.parent) : "";
        return parentPath ? `${parentPath} > ${cat.name}` : cat.name;
    };

    return (
        <div className={`border border-gray-200 rounded-xl overflow-hidden bg-white ${className}`}>
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
                 {selectedCategory ? (
                    <div className="text-sm font-bold text-primary mb-2 break-all">
                        Selected: {getPath(value)}
                    </div>
                 ) : (
                    <div className="text-sm text-gray-400 mb-2 italic">No category selected</div>
                 )}
                <input 
                    type="text" 
                    placeholder="Search categories..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm outline-none focus:border-primary"
                />
            </div>
            <div className="max-h-60 overflow-y-auto p-2">
                {searchTerm ? (
                    <div className="space-y-1">
                        {filteredCategories.map(cat => (
                            <div 
                                key={cat._id}
                                onClick={() => onChange(cat._id)}
                                className={`px-3 py-2 rounded-lg cursor-pointer text-sm ${value === cat._id ? "bg-primary/10 text-primary font-bold" : "hover:bg-gray-50 text-gray-700"}`}
                            >
                                {getPath(cat._id)}
                            </div>
                        ))}
                        {filteredCategories.length === 0 && <p className="text-xs text-center text-gray-400 py-4">No results found</p>}
                    </div>
                ) : (
                    <div className="space-y-1">
                        {rootCategories.map(cat => (
                            <CategoryNode 
                                key={cat._id} 
                                category={cat} 
                                allCategories={categories} 
                                selectedId={value} 
                                onSelect={onChange} 
                            />
                        ))}
                        {rootCategories.length === 0 && <p className="text-xs text-center text-gray-400 py-4">No categories available</p>}
                    </div>
                )}
            </div>
        </div>
    );
}
