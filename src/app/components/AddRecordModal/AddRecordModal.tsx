import React, { useState } from "react";

interface UnkoRecord {
  date: string;
  time: string;
  shape: "normal" | "hard" | "soft" | "watery";
  notes?: string;
}

type Props = {
  onAdd: (record: UnkoRecord) => void;
  onClose: () => void;
};

const AddRecordModal = ({ onAdd, onClose }: Props) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }));
  const [shape, setShape] = useState<"normal" | "hard" | "soft" | "watery">("normal");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    onAdd({ date, time, shape, notes });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-800">記録を追加</h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 text-sm sm:text-base">日付</label>
            <input 
              type="date" 
              className="w-full border rounded px-2 py-2 sm:py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm sm:text-base">時間</label>
            <input 
              type="time" 
              step="60"
              className="w-full border rounded px-2 py-2 sm:py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500" 
              value={time} 
              onChange={e => setTime(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm sm:text-base">形状</label>
            <select 
              className="w-full border rounded px-2 py-2 sm:py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500" 
              value={shape} 
              onChange={e => setShape(e.target.value as any)}
            >
              <option value="normal">💩 普通</option>
              <option value="hard">🪨 固い</option>
              <option value="soft">🍦 柔らかい</option>
              <option value="watery">💧 水様</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm sm:text-base">メモ</label>
            <textarea 
              className="w-full border rounded px-2 py-2 sm:py-1 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button 
              type="button" 
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-sm sm:text-base transition-colors touch-manipulation" 
              onClick={onClose}
            >
              キャンセル
            </button>
            <button 
              type="submit" 
              className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm sm:text-base transition-colors touch-manipulation"
            >
              追加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal; 