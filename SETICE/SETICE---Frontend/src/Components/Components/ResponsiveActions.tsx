import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface ActionButton {
  label: string;
  onClick: () => void;
  icon?: React.ElementType;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  disabled?: boolean;
}

interface ResponsiveActionsProps {
  actions: ActionButton[];
  maxVisibleActions?: number;
  className?: string;
}

const ResponsiveActions: React.FC<ResponsiveActionsProps> = ({
  actions,
  maxVisibleActions = 2,
  className = '',
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const visibleActions = actions.slice(0, maxVisibleActions);
  const hiddenActions = actions.slice(maxVisibleActions);

  const getVariantClasses = (variant: string = 'primary') => {
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    return variants[variant as keyof typeof variants] || variants.primary;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Always visible actions */}
      <div className="hidden sm:flex items-center gap-2">
        {visibleActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md
                transition-colors duration-200
                ${getVariantClasses(action.variant)}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {action.label}
            </button>
          );
        })}
      </div>

      {/* Mobile: Show only icons for visible actions */}
      <div className="flex sm:hidden items-center gap-1">
        {visibleActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                p-2 rounded-md transition-colors duration-200
                ${getVariantClasses(action.variant)}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={action.label}
            >
              {Icon && <Icon className="w-4 h-4" />}
            </button>
          );
        })}
      </div>

      {/* Dropdown for hidden actions */}
      {hiddenActions.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                {hiddenActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        action.onClick();
                        setShowDropdown(false);
                      }}
                      disabled={action.disabled}
                      className={`
                        w-full flex items-center gap-2 px-4 py-2 text-sm text-left
                        hover:bg-gray-50 transition-colors
                        ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                        ${index === 0 ? 'rounded-t-md' : ''}
                        ${index === hiddenActions.length - 1 ? 'rounded-b-md' : ''}
                      `}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponsiveActions;