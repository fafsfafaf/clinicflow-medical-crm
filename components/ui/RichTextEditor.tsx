
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bold, Italic, Underline, List, ListOrdered, Highlighter, ChevronDown, Check, X, AtSign, Paperclip, Send, CornerDownLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Agent } from '../../lib/mock/types';
import { useThemeStore } from '../../lib/store/useThemeStore';
import { useHighlighterSettings } from '../../lib/theme/useHighlighterSettings';
import { Button } from './button'; // Re-using our button component

interface RichTextEditorProps {
  initialContent?: string;
  onChange: (html: string) => void;
  onFilesSelected?: (files: File[]) => void;
  onSave?: () => void; // New prop to handle save action internally
  saveButtonLabel?: string; // Custom label for save button
  isSaving?: boolean;  // New prop to show loading state on button
  hideFooter?: boolean; // New prop to hide the bottom toolbar
  className?: string;
  placeholder?: string;
  availableAgents?: Agent[];
}

// Background Colors (Highlighter style)
const HIGHLIGHT_COLORS = [
  { label: 'None', value: 'transparent', twClass: 'bg-white border border-slate-200' },
  { label: 'Critical', value: '#fee2e2', twClass: 'bg-red-100' },
  { label: 'Warning', value: '#ffedd5', twClass: 'bg-orange-100' },
  { label: 'Highlight', value: '#fef08a', twClass: 'bg-yellow-200' }, 
  { label: 'Stable', value: '#dcfce7', twClass: 'bg-emerald-100' },
  { label: 'Info', value: '#dbeafe', twClass: 'bg-blue-100' },
  { label: 'Note', value: '#f3e8ff', twClass: 'bg-purple-100' },
  { label: 'Grey', value: '#f1f5f9', twClass: 'bg-slate-100' },
];

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  initialContent = '', 
  onChange, 
  onFilesSelected,
  onSave,
  saveButtonLabel = 'Send',
  isSaving = false,
  hideFooter = false,
  className,
  placeholder,
  availableAgents = []
}) => {
  const { fontGlobal } = useThemeStore();
  const highlighterSettings = useHighlighterSettings();
  const { style: hlStyle } = highlighterSettings;

  const contentRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const mentionPickerRef = useRef<HTMLDivElement>(null);
  const mentionButtonRef = useRef<HTMLButtonElement>(null);
  
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isMentionPickerOpen, setIsMentionPickerOpen] = useState(false);
  
  const [currentColor, setCurrentColor] = useState('transparent');
  const [popoverPos, setPopoverPos] = useState<{ top?: number; left: number; bottom?: number }>({ top: 0, left: 0 });

  // Initialize content once
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== initialContent) {
      if (!contentRef.current.innerHTML) {
         contentRef.current.innerHTML = initialContent;
      }
    }
  }, []);

  // Sync content when initialContent changes
  useEffect(() => {
    if (contentRef.current && initialContent !== contentRef.current.innerHTML) {
      contentRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  // Handle Cmd+Enter to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (onSave) {
          e.preventDefault();
          onSave();
        }
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      if (element) {
        element.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [onSave]);

  // Click outside handler for both popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Color Picker Checks
      if (isColorPickerOpen) {
        if (colorPickerRef.current && !colorPickerRef.current.contains(target) &&
            colorButtonRef.current && !colorButtonRef.current.contains(target)) {
          setIsColorPickerOpen(false);
        }
      }

      // Mention Picker Checks
      if (isMentionPickerOpen) {
        if (mentionPickerRef.current && !mentionPickerRef.current.contains(target) &&
            mentionButtonRef.current && !mentionButtonRef.current.contains(target)) {
          setIsMentionPickerOpen(false);
        }
      }
    };

    const handleScroll = () => {
      if (isColorPickerOpen) setIsColorPickerOpen(false);
      if (isMentionPickerOpen) setIsMentionPickerOpen(false);
    };

    if (isColorPickerOpen || isMentionPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isColorPickerOpen, isMentionPickerOpen]);

  const togglePopover = (type: 'color' | 'mention') => {
    if (type === 'color') {
      setIsMentionPickerOpen(false);
      if (!isColorPickerOpen && colorButtonRef.current) {
        const rect = colorButtonRef.current.getBoundingClientRect();
        // Position ABOVE button
        setPopoverPos({ 
            top: undefined, 
            left: rect.left, 
            bottom: window.innerHeight - rect.top + 12 
        });
      }
      setIsColorPickerOpen(!isColorPickerOpen);
    } else {
      setIsColorPickerOpen(false);
      if (!isMentionPickerOpen && mentionButtonRef.current) {
        const rect = mentionButtonRef.current.getBoundingClientRect();
        // Position ABOVE button for mentions too, since it's in the footer now
        setPopoverPos({ 
            top: undefined, 
            left: rect.left,
            bottom: window.innerHeight - rect.top + 12
        });
      }
      setIsMentionPickerOpen(!isMentionPickerOpen);
    }
  };

  const handleInput = () => {
    if (contentRef.current) {
      const html = contentRef.current.innerHTML;
      onChange(html);
      checkFormats();
    }
  };

  const execCommand = (command: string, value: string | undefined = undefined) => {
    contentRef.current?.focus();
    document.execCommand(command, false, value);
    checkFormats();
    handleInput();
  };

  const insertMention = (agent: Agent) => {
    const mentionHtml = `&nbsp;<span contenteditable="false" style="background-color: #e0f2fe; color: #0284c7; padding: 2px 6px; border-radius: 9999px; font-weight: 600; font-size: 0.9em; display: inline-flex; align-items: center; gap: 4px; vertical-align: middle;">@${agent.name}</span>&nbsp;`;
    execCommand('insertHTML', mentionHtml);
    setIsMentionPickerOpen(false);
  };

  const applyHighlight = (color: string) => {
    // Ensure focus is back on the editor
    contentRef.current?.focus();
    
    // Enable StyleWithCSS to force background-color spans which are easier to clear
    document.execCommand('styleWithCSS', false, 'true');

    if (color === 'transparent') {
      // Aggressive reset: clear both hiliteColor and backColor
      document.execCommand('hiliteColor', false, 'transparent');
      document.execCommand('backColor', false, 'transparent');
    } else {
      document.execCommand('hiliteColor', false, color);
    }
    
    // Restore default style mode (optional, but safe to leave on true for colors)
    // document.execCommand('styleWithCSS', false, 'false');
    
    setCurrentColor(color);
    setIsColorPickerOpen(false);
    checkFormats();
    handleInput();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFilesSelected) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      e.target.value = '';
    }
  };

  const checkFormats = () => {
    const formats: string[] = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.push('ul');
    if (document.queryCommandState('insertOrderedList')) formats.push('ol');
    setActiveFormats(formats);
  };

  return (
    <div className={cn("flex flex-col border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all", className)}>
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        multiple 
      />

      {/* TOP Toolbar - Formatting Only */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-100/50 bg-white overflow-x-auto relative z-20">
        <ToolbarButton 
          isActive={activeFormats.includes('bold')} 
          onClick={() => execCommand('bold')} 
          icon={<Bold className="w-4 h-4" />} 
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton 
          isActive={activeFormats.includes('italic')} 
          onClick={() => execCommand('italic')} 
          icon={<Italic className="w-4 h-4" />} 
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton 
          isActive={activeFormats.includes('underline')} 
          onClick={() => execCommand('underline')} 
          icon={<Underline className="w-4 h-4" />} 
          title="Underline (Ctrl+U)"
        />
        
        <div className="w-px h-4 bg-slate-200 mx-1" />

        <ToolbarButton 
          isActive={activeFormats.includes('ul')} 
          onClick={() => execCommand('insertUnorderedList')} 
          icon={<List className="w-4 h-4" />} 
          title="Bullet List"
        />
        <ToolbarButton 
          isActive={activeFormats.includes('ol')} 
          onClick={() => execCommand('insertOrderedList')} 
          icon={<ListOrdered className="w-4 h-4" />} 
          title="Numbered List"
        />

        <div className="w-px h-4 bg-slate-200 mx-1" />
        
        {/* Highlighter Picker (Top) */}
        <div>
           <button 
             ref={colorButtonRef}
             type="button"
             onClick={() => togglePopover('color')}
             className={cn(
               "flex items-center gap-1 px-2 py-1.5 rounded-md transition-colors text-xs font-medium border border-transparent",
               isColorPickerOpen ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100 text-slate-500"
             )}
             title="Highlight Color"
           >
             <Highlighter className="w-3.5 h-3.5" style={{ 
               color: currentColor !== 'transparent' ? '#000' : undefined,
               fill: currentColor !== 'transparent' ? currentColor : undefined 
             }} />
             <ChevronDown className="w-3 h-3 opacity-50" />
           </button>

           {isColorPickerOpen && createPortal(
             <div 
                ref={colorPickerRef}
                style={{ 
                  top: popoverPos.top, 
                  bottom: popoverPos.bottom,
                  left: popoverPos.left,
                  fontFamily: fontGlobal,
                  width: `${hlStyle.width}px`,
                  borderRadius: `${hlStyle.borderRadius}px`,
                  border: `${hlStyle.borderWidth}px solid ${hlStyle.borderColor}`,
                  backgroundColor: hlStyle.backgroundColor,
                  boxShadow: hlStyle.shadow ? '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' : 'none',
                }}
                className="fixed z-[9999] origin-bottom animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 overflow-hidden"
             >
                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                   Highlight Text
                </div>
                <div style={{ padding: `${hlStyle.padding}px` }}>
                  <div 
                    className="grid mb-3"
                    style={{ 
                        gridTemplateColumns: `repeat(${hlStyle.gridColumns}, minmax(0, 1fr))`,
                        gap: `${hlStyle.gap}px`
                    }}
                  >
                    {HIGHLIGHT_COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => applyHighlight(c.value)}
                        className="group relative rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                        style={{ width: `${hlStyle.buttonSize}px`, height: `${hlStyle.buttonSize}px` }}
                        title={c.label}
                      >
                        <span 
                          className={cn("rounded-full shadow-sm border border-black/5", c.twClass)} 
                          style={{ width: `${hlStyle.buttonSize * 0.8}px`, height: `${hlStyle.buttonSize * 0.8}px` }}
                        />
                        {currentColor === c.value && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="text-slate-800 drop-shadow-sm" strokeWidth={3} style={{ width: `${hlStyle.buttonSize * 0.4}px`, height: `${hlStyle.buttonSize * 0.4}px` }} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 pt-3">
                    <button 
                      onClick={() => applyHighlight('transparent')}
                      className="flex items-center justify-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Reset to Default
                    </button>
                  </div>
                </div>
             </div>,
             document.body
           )}
        </div>
      </div>

      {/* Editor Area */}
      <div 
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        onKeyUp={checkFormats}
        onMouseUp={checkFormats}
        className={cn(
            "flex-1 p-4 outline-none text-sm text-slate-700 leading-relaxed overflow-y-auto min-h-[100px]", 
            "prose prose-sm max-w-none",
            "prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mb-2 prose-headings:mt-4",
            "prose-p:my-2",
            "prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2",
            "prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2",
            "prose-strong:font-bold prose-strong:text-slate-900",
            "prose-span:rounded-sm prose-span:px-0.5 prose-span:decoration-clone"
        )}
        data-placeholder={placeholder}
      />
      
      {/* BOTTOM Footer - Attachments & Send Button */}
      {!hideFooter && (
        <div className="flex items-center justify-between p-2 bg-white border-t border-slate-50">
           <div className="flex items-center gap-1">
              {/* Attach File Button (Moved to Bottom) */}
              <ToolbarButton 
                isActive={false} 
                onClick={handleFileClick} 
                icon={<Paperclip className="w-4 h-4" />} 
                title="Attach File"
              />
              
              {/* Mention Picker (Moved to Bottom) */}
              <div>
                 <button 
                   ref={mentionButtonRef}
                   type="button"
                   onClick={() => togglePopover('mention')}
                   className={cn(
                     "flex items-center gap-1 p-1.5 rounded-md transition-colors text-xs font-medium border border-transparent",
                     isMentionPickerOpen ? "bg-slate-100 text-slate-900" : "hover:bg-slate-100 text-slate-500"
                   )}
                   title="Mention Teammate (@)"
                 >
                   <AtSign className="w-4 h-4" />
                 </button>

                 {isMentionPickerOpen && createPortal(
                   <div 
                      ref={mentionPickerRef}
                      style={{ 
                        top: popoverPos.top, 
                        left: popoverPos.left,
                        bottom: popoverPos.bottom,
                        fontFamily: fontGlobal
                      }}
                      className="fixed z-[9999] w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100 origin-bottom-left"
                   >
                      <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 bg-slate-50">
                        Mention Teammate
                      </div>
                      <div className="max-h-52 overflow-y-auto">
                        {availableAgents.map(agent => (
                          <button
                            key={agent.id}
                            onClick={() => insertMention(agent)}
                            className="w-full text-left px-3 py-2.5 hover:bg-slate-50 flex items-center gap-3 transition-colors group"
                          >
                            <div className="relative shrink-0">
                               <img src={agent.avatar} alt={agent.name} className="w-7 h-7 rounded-full bg-slate-200 border border-slate-100" />
                               <div className={cn(
                                 "absolute bottom-0 right-0 w-2 h-2 rounded-full border border-white",
                                 agent.status === 'online' ? "bg-emerald-500" : "bg-slate-300"
                               )} />
                            </div>
                            <div className="flex flex-col min-w-0">
                               <span className="text-sm font-semibold text-slate-700 truncate">{agent.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                   </div>,
                   document.body
                 )}
              </div>
           </div>

           {/* SEND Button Area */}
           {onSave && (
             <div className="flex items-center gap-2">
               <Button 
                 onClick={onSave}
                 isLoading={isSaving}
                 className="bg-blue-500 hover:bg-blue-600 text-white border-none shadow-sm h-9 px-4 rounded-lg flex items-center gap-2 group"
               >
                 {!isSaving && <Send className="w-3.5 h-3.5 fill-white/20" />}
                 <span>{saveButtonLabel}</span>
                 {!isSaving && (
                   <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-400/30 text-blue-50 text-[10px] ml-1">
                     <CornerDownLeft className="w-3 h-3" />
                   </div>
                 )}
               </Button>
             </div>
           )}
        </div>
      )}
      
      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block; /* For Firefox */
        }
      `}</style>
    </div>
  );
};

const ToolbarButton = ({ icon, onClick, isActive, title }: { icon: React.ReactNode, onClick: () => void, isActive: boolean, title?: string }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "p-1.5 rounded-md transition-colors flex items-center justify-center",
      isActive 
        ? "bg-slate-200 text-slate-900 shadow-inner" 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    )}
  >
    {icon}
  </button>
);
