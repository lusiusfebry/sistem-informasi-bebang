import { Check, Hash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

const presets = [
    '#f43f5e', // rose-500
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
];

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
    return (
        <div className="space-y-4 p-4 rounded-2xl bg-muted/30 border border-muted-foreground/10">
            <div className="flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Warna Kustom</Label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={value.replace('#', '')}
                            onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                                if (val.length <= 6) onChange(`#${val}`);
                            }}
                            className="pl-9 h-10 font-bold uppercase tracking-wider"
                            placeholder="FFFFFF"
                        />
                    </div>
                </div>
                <div className="space-y-1.5 pt-1">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-0">Preview</Label>
                    <div
                        className="w-10 h-10 rounded-xl shadow-lg shadow-black/5 border-2 border-white dark:border-slate-800 transition-transform hover:scale-105"
                        style={{ backgroundColor: value }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pilihan Cepat</Label>
                <div className="grid grid-cols-6 gap-2">
                    {presets.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => onChange(color)}
                            className="w-full aspect-square rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                            style={{ backgroundColor: color }}
                        >
                            {value.toLowerCase() === color.toLowerCase() && (
                                <Check className="w-4 h-4 text-white drop-shadow-md" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;
