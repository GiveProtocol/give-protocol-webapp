import React, { useMemo } from 'react';

interface PasswordStrengthBarProps {
  password: string;
}

/** Visual password strength indicator with 4 segments and a text label. */
export const PasswordStrengthBar: React.FC<PasswordStrengthBarProps> = ({ password }) => {
  const { score, label } = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;

    const labels: Record<number, string> = { 0: 'Weak', 1: 'Weak', 2: 'Fair', 3: 'Good', 4: 'Strong' };
    return { score: s, label: labels[s] };
  }, [password]);

  if (!password) return null;

  const colors: Record<number, string> = {
    0: 'bg-red-500',
    1: 'bg-red-500',
    2: 'bg-amber-500',
    3: 'bg-amber-400',
    4: 'bg-green-500',
  };

  const activeColor = colors[score];

  return (
    <div className="space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i < score ? activeColor : 'bg-gray-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
};
