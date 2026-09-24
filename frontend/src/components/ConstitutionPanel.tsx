import { useState, useEffect } from 'react';
import { TransactionStatus } from '../types';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  currentText: string;
  onUpdate: (text: string) => Promise<void>;
  status: TransactionStatus;
}

export function ConstitutionPanel({ currentText, onUpdate, status }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(currentText);

  useEffect(() => {
    setText(currentText);
  }, [currentText]);

  const handleSave = async () => {
    await onUpdate(text);
    setIsEditing(false);
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">📜</span>
          <h2 className="text-xl font-bold text-gray-900">Organization Constitution</h2>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-court-gold hover:text-yellow-600 font-medium px-4 py-2 border border-court-gold rounded-lg hover:bg-yellow-50 transition-colors"
          >
            Edit Constitution
          </button>
        )}
      </div>

      <div className="p-6">
        {status !== 'idle' && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center justify-center">
            <LoadingSpinner status={status} />
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-court-primary focus:border-court-primary outline-none text-gray-800 font-mono text-sm resize-none"
              placeholder="Enter constitution rules..."
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setText(currentText);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={status !== 'idle'}
                className="px-6 py-2 bg-court-primary hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 font-mono text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {currentText || <span className="text-slate-400 italic">No constitution defined yet.</span>}
          </div>
        )}
      </div>
    </div>
  );
}
