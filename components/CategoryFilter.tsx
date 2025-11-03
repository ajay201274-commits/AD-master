import React from 'react';
import { AdCategory } from '../types';
import { CATEGORIES } from '../constants';

interface CategoryFilterProps {
  selectedCategory: AdCategory | 'ALL';
  onSelectCategory: (category: AdCategory | 'ALL') => void;
}

const allCategories = [{ value: 'ALL' as const, label: 'All' }, ...CATEGORIES];

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="mb-8 flex items-center justify-center flex-wrap gap-2">
      {allCategories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border transform hover:-translate-y-1 active:translate-y-0 ${
            selectedCategory === category.value
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50 border-transparent'
              : 'bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;