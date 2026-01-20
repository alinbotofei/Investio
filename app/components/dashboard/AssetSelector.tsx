"use client";

import { useState, useEffect } from "react";
import Icon from "../ui/Icon";
import { AssetCategory } from "@/lib/types/assets";
import { assetHelpers } from "@/app/lib/utils/watchlist";

interface AssetOption {
  symbol: string;
  name: string;
  category: AssetCategory;
}

interface AssetSelectorProps {
  selectedSymbol: string;
  onSelect: (symbol: string, category: AssetCategory) => void;
  availableAssets?: AssetOption[];
}

export default function AssetSelector({
  selectedSymbol,
  onSelect,
  availableAssets = [],
}: AssetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "all">(
    "all"
  );

  const selectedAsset = availableAssets.find(
    (asset) => asset.symbol === selectedSymbol
  );

  const filteredAssets = availableAssets.filter((asset) => {
    const matchesCategory =
      categoryFilter === "all" || asset.category === categoryFilter;
    const matchesSearch =
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelect = (asset: AssetOption) => {
    onSelect(asset.symbol, asset.category);
    setIsOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".asset-selector")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="asset-selector relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/50 rounded-xl px-4 py-3 transition-all group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${assetHelpers.getCategoryColor(
              selectedAsset?.category || "stock"
            )} flex items-center justify-center flex-shrink-0`}
          >
            <Icon
              name={assetHelpers.getCategoryIcon(
                selectedAsset?.category || "stock"
              )}
              className="text-white text-[20px]"
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-bold text-white truncate">
              {assetHelpers.formatSymbol(selectedSymbol)}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {selectedAsset?.name || "Select asset"}
            </div>
          </div>
        </div>
        <Icon
          name={isOpen ? "expand_less" : "expand_more"}
          className="text-slate-400 group-hover:text-white text-[20px] flex-shrink-0 transition-colors"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[500px] flex flex-col">
          <div className="p-3 border-b border-slate-700/50 space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              autoFocus
            />
            <div className="flex gap-1.5">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  categoryFilter === "all"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                    : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                }`}
              >
                All
              </button>
              {(["stock", "crypto", "forex"] as AssetCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    categoryFilter === cat
                      ? `bg-gradient-to-r ${assetHelpers.getCategoryColor(
                          cat
                        )} text-white`
                      : "bg-slate-700/50 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {assetHelpers.getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredAssets.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No assets found
              </div>
            ) : (
              <div className="p-2">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => handleSelect(asset)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                      asset.symbol === selectedSymbol
                        ? "bg-cyan-500/10 border border-cyan-500/30"
                        : "hover:bg-slate-700/50"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${assetHelpers.getCategoryColor(
                        asset.category
                      )} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon
                        name={assetHelpers.getCategoryIcon(asset.category)}
                        className="text-white text-[16px]"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-semibold text-white truncate">
                        {assetHelpers.formatSymbol(asset.symbol)}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {asset.name}
                      </div>
                    </div>
                    {asset.symbol === selectedSymbol && (
                      <Icon
                        name="check_circle"
                        className="text-cyan-400 text-[18px] flex-shrink-0"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
