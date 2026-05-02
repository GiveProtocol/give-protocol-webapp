import React, { useState, useEffect, useCallback } from 'react';
import { Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { validatePhoneNumber } from '@/utils/validation';
import { Logger } from '@/utils/logger';

/** Optional phone number settings for urgent impact alerts. */
export const PhoneSettings: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [savedPhone, setSavedPhone] = useState('');
  const [editing, setEditing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadPhone = async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const existing = (data.user?.user_metadata?.phone as string) ?? '';
      setSavedPhone(existing);
      setPhone(existing);
    };

    loadPhone();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleEdit = useCallback(() => {
    setEditing(true);
    setSaveError(null);
    setSaveSuccess(false);
    setValidationError(null);
  }, []);

  const handleCancel = useCallback(() => {
    setPhone(savedPhone);
    setEditing(false);
    setValidationError(null);
    setSaveError(null);
  }, [savedPhone]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    setValidationError(null);
  }, []);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setValidationError(null);
      setSaveError(null);
      setSaveSuccess(false);

      const trimmed = phone.trim();

      if (trimmed !== '' && !validatePhoneNumber(trimmed)) {
        setValidationError('Please enter a valid international phone number (e.g. +1 555 000 1234)');
        return;
      }

      setSaving(true);
      try {
        const { error } = await supabase.auth.updateUser({
          data: { phone: trimmed || null },
        });
        if (error) {
          throw new Error(error.message);
        }
        setSavedPhone(trimmed);
        setEditing(false);
        setSaveSuccess(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to save phone number';
        setSaveError(msg);
        Logger.error('Phone save failed', { error: msg });
      } finally {
        setSaving(false);
      }
    },
    [phone],
  );

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700">
          <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Phone (Optional — for Urgent Impact Alerts)
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Receive critical notifications when your chosen causes need immediate support
          </p>
        </div>
      </div>

      {saveSuccess && !editing && (
        <div className="flex items-center gap-2 p-3 mb-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-sm text-emerald-600 dark:text-emerald-400">Phone number saved</span>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="space-y-3">
          <Input
            label="Phone number"
            id="settings-phone"
            type="tel"
            value={phone}
            onChange={handleChange}
            placeholder="+1 555 000 1234"
            error={validationError ?? undefined}
            aria-label="Phone number for urgent impact alerts"
          />

          {saveError !== null && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
              <span className="text-sm text-red-600 dark:text-red-400">{saveError}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {savedPhone !== '' ? savedPhone : <span className="text-gray-400 dark:text-gray-500">Not set</span>}
          </span>
          <Button variant="secondary" size="sm" onClick={handleEdit}>
            {savedPhone !== '' ? 'Change' : 'Add'}
          </Button>
        </div>
      )}
    </div>
  );
};
