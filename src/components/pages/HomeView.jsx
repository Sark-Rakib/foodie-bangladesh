"use client";

import Link from "next/link";
import { Search, Filter, Grid, Check, X, Upload, User, MapPin, Palette, LayoutDashboard, LayoutGrid, LayoutSidebarClose, LayoutSidebarOpen, LayoutBottom, LayerPanel, DownLoad, Heart, Logo } from "lucide-react";
import { useI18n } from "@/i18n/LanguageProvider";
import { useFoodie } from "@/components/FoodieProvider";
import { useState, useEffect, useCallback } from "react";
import { DIVISIONS_GEO, TOTAL_CATALOG } from "@/data/catalog";
import { foods } from "@/data/foods";
import { useOrigin } from "@/hooks/useOrigin";
import { Container, Stat, ProgressBar } from "@/components/ui";
import BangladeshFoodMap from "@/components/BangladeshFoodMap";
import DistrictDirectory from "@/components/DistrictDirectory";
import DownloadCardButton from "@/components/DownloadCardButton";
import FoodHeroCollage from "@/components/FoodHeroCollage";

const CARD_LANGS = [
  { code: "bn", label: "বাংলা" },
  { code: "en", label: "English" },
];

const divisionsData = [
  { id: "dhaka", name: "Dhaka", nameBn: "ঢাকা", foods: 13 },
  { id: "chattogram", name: "Chattogram", nameBn: "চট্টগ্রাম", foods: 11 },
  { id: "rajshahi", name: "Rajshahi", nameBn: "রাজশাহী", foods: 8 },
  { id: "khulna", name: "Khulna", nameBn: "খুলনা", foods: 10 },
  { id: "barishal", name: "Barishal", nameBn: "বরিশাল", foods: 6 },
  { id: "sylhet", name: "Sylhet", nameBn: "সিলেট", foods: 4 },
  { id: "rangpur", name: "Rangpur", nameBn: "রংপুর", foods: 8 },
  { id: "mymensingh", name: "Mymensingh", nameBn: "ময়মনসিংহ", foods: 4 },
];

export default function HomeView() {
  const { t, lang } = useI18n();
  const { triedIds } = useFoodie();
  const [name, setName] = useState("");
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [showDistrictNames, setShowDistrictNames] = useState(false);
  const [theme, setTheme] = useState("green");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [exportWidth, setExportWidth] = useState(1080);
  const [exportHeight, setExportHeight] = useState(1350);
  const num = (n) => formatNumber(n, lang);
  const [searchQuery, setSearchQuery] = useState("");

  // Compute selected foods count and division stats
  const selectedFoodsCount = triedIds.length;
  const totalFoods = TOTAL_CATALOG;
  const completion = Math.round((selectedFoodsCount / totalFoods) * 100);
  const levelInfo = levelFor(selectedFoodsCount);
  const levelProgress = progressWithinLevel(selectedFoodsCount);

  // Toggle division selection
  const toggleDivision = (divisionId) => {
    setSelectedDivisions(prev => {
      if (prev.includes(divisionId)) return prev.filter(id => id !== divisionId);
      return [...prev, divisionId];
    });
  };

  // Download the card
  const handleDownload = async () => {
    // Trigger download with fixed 4:5 dimensions
    // The DownloadCardButton component handles the html-to-image export
  };

  return (
    <>
      <Container className="py-10 sm:py-14">
        {/* Top Bar with Theme Selector and User Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* Theme Selector */}
            <div className="flex gap-1">
              {CARD_LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setTheme(code)}
                  className={`
                    inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors ${
                      theme === code 
                        ? "bg-forest text-cream" 
                        : "bg-transparent text-forest/60 hover:bg-forest/20 hover:text-forest"
                    }
                  `}
                >
                  {code === "bn" ? "বাংলা" : "EN"}
                </button>
              ))}
            </div>
            
            {/* User Name Input */}
            <div className="relative w-48">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="আপনার নাম"
                className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                aria-label="User name"
              />
              <label 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none"
              >
                Name
              </label>
            </div>
          </div>

          {/* Customization Controls */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-muted">
              <Input className="h-4 w-4" /> 
              Show District Names
            </label>
            <Checkbox
              checked={showDistrictNames}
              onCheckedChange={() => setShowDistrictNames(!showDistrictNames)}
            />
          </div>
          
          {/* Upload Photo */}
          <button
            type="button"
            onClick={() => {
              setProfilePhoto(null);
            }}
            className="rounded-full bg-forest px-4 py-2 text-sm font-medium text-cream hover:bg-forest-dark"
          >
            <Upload className="h-4 w-4 mr-2" />Upload Profile Photo
          </button>
          {profilePhoto && (
            <img
              src={profilePhoto}
              alt="Profile"
              className="mt-2 w-12 h-12 rounded-full object-cover"
            />
          )}
        </div>
      </Container>

      {/* Main Two-Column Layout */}
      <Container className="grid gap-6 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr]">
        {/* LEFT SIDEBAR: Selection Panel */}
        <div className="space-y-4">
          {/* Search Input */}
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex gap-2">
              <Search className="h-4 w-4 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="খাবার বা জেলা_search..."
                className="flex-1 px-3 py-2 border rounded outline-none focus:ring-2 focus:ring-forest"
                placeholderColor="forest"
              />
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="border rounded-lg p-4 mb-4">
            <button
              type="button"
              onClick={() => {
                setSelectedDivisions(divisionsData.map(d => d.id));
              }}
              className="w-full rounded-lg bg-terracotta px-4 py-2.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta-dark"
            >
              <Check className="h-4 w-4 mr-2" />সব বাছাই
            </button>
          </div>

          {/* Division Foods with Counters */}
          <div className="space-y-2">
            {divisionsData.map((division) => (
              <div
                key={division.id}
                className={`
                  rounded-lg p-3 border ${selectedDivisions.includes(division.id) 
                    ? "border-terracotta bg-terracotta/15 text-terracotta" 
                    : "border-border bg-transparent text-forest"}
                  hover:border-terracotta hover:bg-terracotta/10
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-forest">
                    {lang === "bn" ? division.nameBn : division.name}
                  </span>
                  <span className="text-xs text-muted">
                    {division.foods} খাবার
                  </span>
                </div>
                <div className="mt-1">
                  {division.foods > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {Array.from({ length: 3 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          className="
                            rounded-full border border-line bg-cream px-1.5 py-0.5 text-[9px] font-medium text-forest transition-colors hover:border-terracotta hover:text-terracotta
                          "
                        >
                          {i < division.foods ? `${i + 1}` : ""}
                        </button>
                      ))}
                      {division.foods > 3 && (
                        <span className="text-[9px] text-muted">+{division.foods - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Overall Counters */}
          <div className="border rounded-lg p-4 pt-4">
            <div className="flex justify-between text-sm text-muted mb-2">
              <span>Selected</span>
              <span className="font-medium">{num(selectedFoodsCount)} / {num(totalFoods)}</span>
            </div>
            <ProgressBar value={completion} />
            <div className="text-sm text-muted">
              {num(completion)}% complete
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Live Preview & Canvas Card */}
        <div className="space-y-4">
          {/* Theme Preview Section */}
          <div className="rounded-2xl bg-white p-6 border border-border">
            <h2 className="font-display text-xl font-semibold text-forest mb-4">
              {t("foodMap.title")}
            </h2>
            
            {/* Map Area */}
            <BangladeshFoodMap
              selectedId={selectedDistrict}
              displayName={name}
              showControls={false}
            />

            {/* Food Selection Area */}
            {selectedDistrict && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-border">
                <h3 className="font-medium text-forest mb-3">
                  {t("foodMap.foodInDistrict")} {lang === "bn" ? selectedDistrict : "District"}
                </h3>
                <p className="text-sm text-muted">
                  {t("foodMap.selectFood")}
                </p>
              </div>
            )}

            {/* Stats Section */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="font-medium text-forest">{num(selectedFoodsCount)}</div>
                  <div>খাবার試了</div>
                </div>
                <div>
                  <div className="font-medium text-forest">{num(totalFoods)}</div>
                  <div>whole foods</div>
                </div>
              </div>
              <ProgressBar value={completion} />
              <div className="mt-2 text-center">
                <span className="font-semibold text-forest">
                  {t(`levels.l${levelInfo.index}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <DownloadCardButton
            getNode={() => document.querySelector('.card-export')?.current}
            filename="foodie-bangladesh-card.png"
            exportWidth={exportWidth}
            exportHeight={exportHeight}
          />
        </div>
      </Container>

      {/* Footer Watermark */}
      <div className="mt-6 text-center text-xs text-muted">
        Foodie Bangladesh • foodiebd.com
      </div>
    </>
  );
}
