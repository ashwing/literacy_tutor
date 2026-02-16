import React from 'react';
import { GraduationCap } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export const GradeSelector: React.FC = () => {
    const { gradeLevel, setGradeLevel } = useAppStore();

    return (
        <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-900">Grade:</span>
            <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(Number(e.target.value))}
                className="bg-transparent text-indigo-700 font-bold focus:outline-none cursor-pointer"
            >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                    <option key={g} value={g}>
                        {g}
                    </option>
                ))}
            </select>
        </div>
    );
};
