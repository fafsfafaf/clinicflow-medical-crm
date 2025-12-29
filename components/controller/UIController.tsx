
import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '../../lib/store/useThemeStore';
import { useBulkBarSettings } from '../../lib/theme/useBulkBarSettings';
import { useNewLeadSheetSettings } from '../../lib/theme/useNewLeadSheetSettings';
import { useHighlighterSettings } from '../../lib/theme/useHighlighterSettings';
import { Settings2, X, RotateCcw, Monitor, Layout, PaintBucket, Type, PanelRight, GripHorizontal, MousePointerClick, FileInput, ArrowUp, ArrowDown, MoveVertical, Highlighter } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { FONTS } from '../../lib/theme/iconBarTokens';

// Fonts available in index.html import
const FONT_OPTIONS = [
  { label: 'Inter (Default)', value: 'Inter' },
  { label: 'Nunito (Rounded)', value: 'Nunito' },
  { label: 'Quicksand (Round)', value: 'Quicksand' },
  { label: 'Outfit (Modern)', value: 'Outfit' },
  { label: 'Manrope (Clean)', value: 'Manrope' },
  { label: 'DM Sans (Geo)', value: 'DM Sans' },
  { label: 'Plus Jakarta (Tech)', value: 'Plus Jakarta Sans' },
];

const Slider = ({ value, min, max, onChange, label }: { value: number, min: number, max: number, onChange: (val: number) => void, label: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-slate-500">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
    />
  </div>
);

const ColorPicker = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-400 font-mono">{value}</span>
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded border-none cursor-pointer bg-transparent"
      />
    </div>
  </div>
);

const FontSelect = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => (
  <div className="space-y-1">
    <span className="text-xs font-medium text-slate-600">{label}</span>
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-8 text-xs border border-slate-200 rounded-md bg-slate-50 px-2 focus:outline-none focus:ring-1 focus:ring-slate-400"
    >
      {FONT_OPTIONS.map((font) => (
        <option key={font.value} value={font.value}>{font.label}</option>
      ))}
    </select>
  </div>
);

const UIController = () => {
  const theme = useThemeStore();
  const bulkBar = useBulkBarSettings();
  const sheetSettings = useNewLeadSheetSettings();
  const highlighterSettings = useHighlighterSettings();
  
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cardStartRef = useRef({ x: 0, y: 0 });

  // Handle Dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      
      // Calculate new position
      const newX = cardStartRef.current.x + dx;
      const newY = cardStartRef.current.y + dy;

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow drag from header
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    cardStartRef.current = { ...position };
  };

  const handleReset = () => {
    theme.resetToDefaults();
    bulkBar.resetDefaults();
    sheetSettings.resetDefaults();
    highlighterSettings.resetDefaults();
  };

  if (!theme.showController) {
    return (
      <button 
        onClick={theme.toggleController}
        className="fixed bottom-6 right-6 z-[100] bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-transform hover:scale-105"
      >
        <Settings2 className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Card 
      className="fixed z-[100] w-[340px] max-h-[85vh] overflow-y-auto shadow-2xl border-slate-200 bg-white/95 backdrop-blur-sm"
      style={{
        left: position.x,
        top: position.y,
        transition: isDragging ? 'none' : 'opacity 0.2s', // Prevent transition lag while dragging
      }}
    >
      <div 
        className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <GripHorizontal className="w-4 h-4 text-slate-400" /> UI Controller
        </h3>
        <div className="flex gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleReset} title="Reset All">
            <RotateCcw className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={theme.toggleController}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-8">
        
        {/* Presets */}
        <div className="grid grid-cols-3 gap-2">
          {['subtle', 'balanced', 'strong'].map((preset) => (
            <button
              key={preset}
              onClick={() => theme.applyPreset(preset as any)}
              className="px-2 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md capitalize transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Section: Highlighter Popover Settings */}
        <div className="space-y-4 border-l-2 border-amber-400 pl-4 bg-amber-50/30 rounded-r-lg p-3">
           <div className="flex items-center gap-2 text-xs font-bold text-amber-600 pb-2 border-b border-amber-100 mb-2">
             <Highlighter className="w-3.5 h-3.5" /> Highlighter Popover (Live)
           </div>

           <div className="grid grid-cols-2 gap-3">
             <Slider label="Width (px)" value={highlighterSettings.style.width} min={180} max={400} onChange={(v) => highlighterSettings.updateStyle({ width: v })} />
             <Slider label="Radius" value={highlighterSettings.style.borderRadius} min={0} max={30} onChange={(v) => highlighterSettings.updateStyle({ borderRadius: v })} />
           </div>

           <div className="grid grid-cols-2 gap-3">
             <Slider label="Grid Cols" value={highlighterSettings.style.gridColumns} min={2} max={6} onChange={(v) => highlighterSettings.updateStyle({ gridColumns: v })} />
             <Slider label="Gap" value={highlighterSettings.style.gap} min={0} max={20} onChange={(v) => highlighterSettings.updateStyle({ gap: v })} />
           </div>

           <div className="grid grid-cols-2 gap-3">
             <Slider label="Padding" value={highlighterSettings.style.padding} min={0} max={30} onChange={(v) => highlighterSettings.updateStyle({ padding: v })} />
             <Slider label="Btn Size" value={highlighterSettings.style.buttonSize} min={20} max={60} onChange={(v) => highlighterSettings.updateStyle({ buttonSize: v })} />
           </div>

           <ColorPicker label="Background" value={highlighterSettings.style.backgroundColor} onChange={(v) => highlighterSettings.updateStyle({ backgroundColor: v })} />
           <ColorPicker label="Border" value={highlighterSettings.style.borderColor} onChange={(v) => highlighterSettings.updateStyle({ borderColor: v })} />
           
           <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600">Shadow</span>
              <input type="checkbox" checked={highlighterSettings.style.shadow} onChange={(e) => highlighterSettings.updateStyle({ shadow: e.target.checked })} />
           </div>
        </div>

        {/* Section: New Lead Sheet Settings */}
        <div className="space-y-4 border-l-2 border-emerald-500 pl-4 bg-emerald-50/20 rounded-r-lg p-3">
           <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 pb-2 border-b border-emerald-100 mb-2">
             <FileInput className="w-3.5 h-3.5" /> Modal Layout Controller (Live)
           </div>
           
           {/* Modal Height & Scroll */}
           <div className="space-y-3 pb-3 border-b border-emerald-100/50">
             <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-900">Scroll Behavior</span>
                <div className="flex bg-emerald-100/50 p-0.5 rounded-lg">
                  <button 
                    onClick={() => sheetSettings.updateSettings({ scrollBehavior: 'content' })}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                      sheetSettings.scrollBehavior === 'content' ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600 hover:bg-emerald-200/50"
                    )}
                  >
                    Content
                  </button>
                  <button 
                    onClick={() => sheetSettings.updateSettings({ scrollBehavior: 'body' })}
                    className={cn(
                      "px-2 py-1 text-[10px] font-bold rounded-md transition-all",
                      sheetSettings.scrollBehavior === 'body' ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600 hover:bg-emerald-200/50"
                    )}
                  >
                    Body
                  </button>
                </div>
             </div>
             
             <Slider label="Modal Max Height (vh)" value={sheetSettings.sheetMaxHeightVh} min={50} max={100} onChange={(v) => sheetSettings.updateSettings({ sheetMaxHeightVh: v })} />
           </div>

           {/* Header Spacing */}
           <div className="space-y-2">
             <div className="text-[10px] font-bold text-emerald-600 uppercase">Header</div>
             <div className="grid grid-cols-2 gap-3">
               <Slider label="Padding X" value={sheetSettings.headerPaddingX} min={0} max={60} onChange={(v) => sheetSettings.updateSettings({ headerPaddingX: v })} />
               <Slider label="Padding Y" value={sheetSettings.headerPaddingY} min={0} max={60} onChange={(v) => sheetSettings.updateSettings({ headerPaddingY: v })} />
             </div>
           </div>

           {/* Content Spacing */}
           <div className="space-y-2">
             <div className="text-[10px] font-bold text-emerald-600 uppercase">Body Content</div>
             <div className="grid grid-cols-2 gap-3">
               <Slider label="Padding Top" value={sheetSettings.contentPaddingTop} min={0} max={100} onChange={(v) => sheetSettings.updateSettings({ contentPaddingTop: v })} />
               <Slider label="Padding Btm" value={sheetSettings.contentPaddingBottom} min={0} max={100} onChange={(v) => sheetSettings.updateSettings({ contentPaddingBottom: v })} />
             </div>
             <Slider label="Padding X" value={sheetSettings.contentPaddingX} min={0} max={60} onChange={(v) => sheetSettings.updateSettings({ contentPaddingX: v })} />
             
             <div className="grid grid-cols-2 gap-3 mt-2">
               <Slider label="Section Gap" value={sheetSettings.sectionGap} min={0} max={80} onChange={(v) => sheetSettings.updateSettings({ sectionGap: v })} />
               <Slider label="Field Gap" value={sheetSettings.fieldGap} min={0} max={40} onChange={(v) => sheetSettings.updateSettings({ fieldGap: v })} />
             </div>
           </div>

           {/* Footer Spacing */}
           <div className="space-y-2 pt-2 border-t border-emerald-100/50">
             <div className="text-[10px] font-bold text-emerald-600 uppercase flex justify-between items-center">
                <span>Footer</span>
                <button 
                  onClick={() => sheetSettings.updateSettings({ safeAreaBottom: !sheetSettings.safeAreaBottom })}
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded border transition-colors",
                    sheetSettings.safeAreaBottom ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-white border-slate-200 text-slate-400"
                  )}
                >
                  Safe Area
                </button>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <Slider label="Padding Top" value={sheetSettings.footerPaddingTop} min={0} max={60} onChange={(v) => sheetSettings.updateSettings({ footerPaddingTop: v })} />
               <Slider label="Padding Btm" value={sheetSettings.footerPaddingBottom} min={0} max={100} onChange={(v) => sheetSettings.updateSettings({ footerPaddingBottom: v })} />
             </div>
             <Slider label="Content-Footer Gap" value={sheetSettings.contentFooterGap} min={0} max={60} onChange={(v) => sheetSettings.updateSettings({ contentFooterGap: v })} />
           </div>
        </div>

        {/* Section: Bulk Bar (LIVE) */}
        <div className="space-y-4 border-l-2 border-primary pl-4 bg-slate-50/50 rounded-r-lg p-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary pb-1 border-b border-slate-200/50">
            <MousePointerClick className="w-3 h-3" /> Bulk Action Bar (Live)
          </div>
          
          <ColorPicker label="Background" value={bulkBar.style.backgroundColor} onChange={(v) => bulkBar.updateStyle({ backgroundColor: v })} />
          <ColorPicker label="Text Color" value={bulkBar.style.textColor} onChange={(v) => bulkBar.updateStyle({ textColor: v })} />
          <ColorPicker label="Accent Color" value={bulkBar.style.accentColor} onChange={(v) => bulkBar.updateStyle({ accentColor: v })} />
          <ColorPicker label="Border Color" value={bulkBar.style.borderColor} onChange={(v) => bulkBar.updateStyle({ borderColor: v })} />

          <div className="grid grid-cols-2 gap-3">
             <Slider label="Radius" value={bulkBar.style.borderRadius} min={0} max={40} onChange={(v) => bulkBar.updateStyle({ borderRadius: v })} />
             <Slider label="Bottom Offset" value={bulkBar.style.bottomOffset} min={0} max={100} onChange={(v) => bulkBar.updateStyle({ bottomOffset: v })} />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <Slider label="Pad X" value={bulkBar.style.paddingX} min={0} max={40} onChange={(v) => bulkBar.updateStyle({ paddingX: v })} />
             <Slider label="Pad Y" value={bulkBar.style.paddingY} min={0} max={30} onChange={(v) => bulkBar.updateStyle({ paddingY: v })} />
          </div>

          <div className="flex items-center justify-between">
             <span className="text-xs font-medium text-slate-600">Glass Effect</span>
             <input type="checkbox" checked={bulkBar.style.showGlassEffect} onChange={(e) => bulkBar.updateStyle({ showGlassEffect: e.target.checked })} />
          </div>
        </div>

        {/* Section: Layout */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
            <Layout className="w-3 h-3" /> Layout & Spacing
          </div>
          <Slider 
            label="Window Padding" 
            value={theme.padding} 
            min={0} max={64} 
            onChange={(v) => theme.updateSetting('padding', v)} 
          />
          <Slider 
            label="Corner Radius" 
            value={theme.radius} 
            min={0} max={48} 
            onChange={(v) => theme.updateSetting('radius', v)} 
          />
        </div>

      </div>
    </Card>
  );
};

export default UIController;
