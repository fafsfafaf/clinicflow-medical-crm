import React, { useState, useRef, useEffect } from 'react';
import { Settings2, X, Type, Palette, Timer, MousePointer2, BoxSelect, Circle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { useIconBarSettings } from '../../lib/theme/useIconBarSettings';
import { FONTS, POSITIONS } from '../../lib/theme/iconBarTokens';
import { cn } from '../../lib/utils';

const Slider = ({ value, min, max, onChange, label, step = 1 }: { value: number, min: number, max: number, onChange: (val: number) => void, label: string, step?: number }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-slate-500">
      <span>{label}</span>
      <span>{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step}
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

export const IconBarController = () => {
  const { labelStyle, buttonStyle, updateLabelStyle, updateButtonStyle, resetDefaults } = useIconBarSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'buttons' | 'labels'>('buttons');
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const cardStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({ x: cardStartRef.current.x + dx, y: cardStartRef.current.y + dy });
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
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    cardStartRef.current = { ...position };
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-6 z-[99] bg-white text-slate-600 border border-slate-200 p-3 rounded-full shadow-lg hover:bg-slate-50 transition-transform hover:scale-105"
        title="Icon Bar Settings"
      >
        <MousePointer2 className="w-5 h-5" />
      </button>
    );
  }

  return (
    <Card 
      className="fixed z-[100] w-[320px] max-h-[80vh] overflow-y-auto shadow-2xl border-slate-200 bg-white/95 backdrop-blur-sm"
      style={{ left: position.x, top: position.y }}
    >
      <div 
        className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-sm z-10 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-400" /> Icon Controller
        </h3>
        <div className="flex gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetDefaults} title="Reset">
            <X className="w-3 h-3 rotate-45" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        <button 
          onClick={() => setActiveTab('buttons')}
          className={cn("flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors", activeTab === 'buttons' ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600")}
        >
          Buttons
        </button>
        <button 
          onClick={() => setActiveTab('labels')}
          className={cn("flex-1 py-3 text-xs font-semibold uppercase tracking-wider transition-colors", activeTab === 'labels' ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-400 hover:text-slate-600")}
        >
          Labels
        </button>
      </div>

      <div className="p-4 space-y-6">
        
        {/* === BUTTONS TAB === */}
        {activeTab === 'buttons' && (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
                <BoxSelect className="w-3 h-3" /> Dimensions
              </div>
              <Slider label="Button Size (px)" value={buttonStyle.size} min={20} max={48} onChange={(v) => updateButtonStyle({ size: v })} />
              <Slider label="Icon Scale (px)" value={buttonStyle.iconScale} min={10} max={24} onChange={(v) => updateButtonStyle({ iconScale: v })} />
              <Slider label="Gap (px)" value={buttonStyle.gap} min={0} max={24} onChange={(v) => updateButtonStyle({ gap: v })} />
              <Slider label="Radius (px)" value={buttonStyle.radius} min={0} max={30} onChange={(v) => updateButtonStyle({ radius: v })} />
              <Slider label="Border Width" value={buttonStyle.borderWidth} min={0} max={4} onChange={(v) => updateButtonStyle({ borderWidth: v })} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
                <Palette className="w-3 h-3" /> Colors (Normal)
              </div>
              <ColorPicker label="Icon Color" value={buttonStyle.normalColor} onChange={(v) => updateButtonStyle({ normalColor: v })} />
              <ColorPicker label="Background" value={buttonStyle.normalBg} onChange={(v) => updateButtonStyle({ normalBg: v })} />
              <ColorPicker label="Border" value={buttonStyle.borderColor} onChange={(v) => updateButtonStyle({ borderColor: v })} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
                <MousePointer2 className="w-3 h-3" /> Colors (Hover)
              </div>
              <ColorPicker label="Icon Color" value={buttonStyle.hoverColor} onChange={(v) => updateButtonStyle({ hoverColor: v })} />
              <ColorPicker label="Background" value={buttonStyle.hoverBg} onChange={(v) => updateButtonStyle({ hoverBg: v })} />
              <ColorPicker label="Border" value={buttonStyle.hoverBorderColor} onChange={(v) => updateButtonStyle({ hoverBorderColor: v })} />
            </div>
          </>
        )}

        {/* === LABELS TAB === */}
        {activeTab === 'labels' && (
          <>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
                <Type className="w-3 h-3" /> Typography
              </div>
              
              <div className="space-y-1">
                 <span className="text-xs font-medium text-slate-600">Font Family</span>
                 <select 
                    value={labelStyle.fontFamily}
                    onChange={(e) => updateLabelStyle({ fontFamily: e.target.value })}
                    className="w-full text-xs p-1 border rounded bg-slate-50"
                 >
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                 </select>
              </div>

              <Slider label="Size (px)" value={labelStyle.fontSize} min={10} max={16} onChange={(v) => updateLabelStyle({ fontSize: v })} />
              
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Weight</span>
                    <select 
                       value={labelStyle.fontWeight}
                       onChange={(e) => updateLabelStyle({ fontWeight: Number(e.target.value) })}
                       className="w-full text-xs p-1 border rounded bg-slate-50"
                    >
                       <option value={400}>Regular</option>
                       <option value={500}>Medium</option>
                       <option value={600}>SemiBold</option>
                       <option value={700}>Bold</option>
                    </select>
                 </div>
                 <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">Transform</span>
                    <select 
                       value={labelStyle.textTransform}
                       onChange={(e) => updateLabelStyle({ textTransform: e.target.value as any })}
                       className="w-full text-xs p-1 border rounded bg-slate-50"
                    >
                       <option value="none">None</option>
                       <option value="uppercase">Uppercase</option>
                       <option value="capitalize">Capitalize</option>
                    </select>
                 </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
                <Palette className="w-3 h-3" /> Appearance
              </div>
              
              <ColorPicker label="Text Color" value={labelStyle.color} onChange={(v) => updateLabelStyle({ color: v })} />
              <ColorPicker label="Background" value={labelStyle.background} onChange={(v) => updateLabelStyle({ background: v })} />
              
              <Slider label="Corner Radius" value={labelStyle.radius} min={0} max={20} onChange={(v) => updateLabelStyle({ radius: v })} />
              <div className="grid grid-cols-2 gap-3">
                 <Slider label="Pad X" value={labelStyle.paddingX} min={4} max={24} onChange={(v) => updateLabelStyle({ paddingX: v })} />
                 <Slider label="Pad Y" value={labelStyle.paddingY} min={2} max={16} onChange={(v) => updateLabelStyle({ paddingY: v })} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600">Shadow</span>
                <input type="checkbox" checked={labelStyle.shadow} onChange={(e) => updateLabelStyle({ shadow: e.target.checked })} className="toggle" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
                <Timer className="w-3 h-3" /> Position & Behavior
              </div>
              
              <div className="space-y-1">
                 <span className="text-xs font-medium text-slate-600">Anchor</span>
                 <div className="grid grid-cols-4 gap-1">
                   {POSITIONS.map(pos => (
                     <button
                       key={pos}
                       onClick={() => updateLabelStyle({ position: pos })}
                       className={cn(
                         "px-2 py-1 text-[10px] border rounded capitalize transition-colors",
                         labelStyle.position === pos ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600"
                       )}
                     >
                       {pos}
                     </button>
                   ))}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <Slider label="Offset X" value={labelStyle.offsetX} min={-50} max={50} onChange={(v) => updateLabelStyle({ offsetX: v })} />
                 <Slider label="Offset Y" value={labelStyle.offsetY} min={-50} max={50} onChange={(v) => updateLabelStyle({ offsetY: v })} />
              </div>

              <Slider label="Delay (ms)" value={labelStyle.delay} min={0} max={600} step={50} onChange={(v) => updateLabelStyle({ delay: v })} />
            </div>
          </>
        )}

      </div>
    </Card>
  );
};