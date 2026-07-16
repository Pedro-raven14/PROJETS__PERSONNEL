import React from 'react';
import {
  Utensils, Car, Home, ShoppingCart, Gamepad2, Heart, Zap,
  BookOpen, MoreHorizontal, Briefcase, Laptop, TrendingUp, Gift,
} from 'lucide-react';
import { getCategoryById } from '../../data/categories';

const ICON_MAP = {
  Utensils, Car, Home, ShoppingCart, Gamepad2, Heart, Zap,
  BookOpen, MoreHorizontal, Briefcase, Laptop, TrendingUp, Gift,
};

/**
 * Affiche l'icône colorée d'une catégorie dans un cercle.
 * size : 'sm' | 'md' | 'lg'
 */
const CategoryIcon = ({ categorieId, size = 'md' }) => {
  const cat = getCategoryById(categorieId);
  if (!cat) return null;

  const Icon = ICON_MAP[cat.icon] ?? MoreHorizontal;

  const sizeClasses = {
    sm: { wrap: 'h-8 w-8',  icon: 'h-4 w-4' },
    md: { wrap: 'h-10 w-10', icon: 'h-5 w-5' },
    lg: { wrap: 'h-12 w-12', icon: 'h-6 w-6' },
  };
  const s = sizeClasses[size] ?? sizeClasses.md;

  return (
    <div
      className={`${s.wrap} ${cat.bgColor} ${cat.textColor} flex items-center justify-center rounded-full flex-shrink-0`}
    >
      <Icon className={s.icon} />
    </div>
  );
};

export default CategoryIcon;
