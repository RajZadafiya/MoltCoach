import { useState } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import { AddWeightPayload, ApiErrorBody } from '../interface';
import { extractErrorMessage } from '../api';
import { toCalendarDay } from '../utils/date';

export interface AddWeightFormValues {
  date: Date;
  weight: string;
  note: string;
}

interface UseAddWeightFormProps {
  onSave: (payload: AddWeightPayload) => Promise<void>;
  onSuccess?: () => void;
}

export function useAddWeightForm({ onSave, onSuccess }: UseAddWeightFormProps) {
  const [generalError, setGeneralError] = useState<string | null>(null);

  const formik = useFormik<AddWeightFormValues>({
    initialValues: {
      date: new Date(),
      weight: '',
      note: '',
    },
    validate: values => {
      const errors: Partial<Record<keyof AddWeightFormValues, string>> = {};

      if (values.date.getTime() > Date.now()) {
        errors.date = 'You cannot log a measurement in the future.';
      }

      const trimmed = values.weight.trim();
      if (!trimmed) {
        errors.weight = 'Weight is required.';
      } else {
        const parsed = parseFloat(trimmed);
        if (isNaN(parsed)) {
          errors.weight = 'Weight must be a valid number.';
        } else if (parsed < 20 || parsed > 400) {
          errors.weight = 'Weight must be between 20 and 400 kg.';
        }
      }

      return errors;
    },
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      setGeneralError(null);
      const weightKg = parseFloat(values.weight.trim());
      const payload: AddWeightPayload = {
        dateISO: values.date.toISOString(),
        weightKg,
        note: values.note.trim() || undefined,
      };

      try {
        await onSave(payload);
        onSuccess?.();
      } catch (err: unknown) {
        let apiError: ApiErrorBody['error'] | undefined;
        if (axios.isAxiosError<ApiErrorBody>(err)) {
          apiError = err.response?.data?.error;
        } else if (
          typeof err === 'object' &&
          err !== null &&
          'error' in err &&
          typeof (err as { error: unknown }).error === 'object'
        ) {
          apiError = (err as ApiErrorBody).error;
        }

        if (apiError) {
          if (apiError.field === 'weightKg') {
            setFieldError('weight', apiError.message);
          } else if (
            apiError.field === 'dateISO' ||
            apiError.code === 'DUPLICATE_DATE'
          ) {
            setFieldError('date', apiError.message);
          } else {
            setGeneralError(apiError.message);
          }
        } else {
          setGeneralError(extractErrorMessage(err, 'Failed to save entry.'));
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const changeDateByDays = (deltaDays: number) => {
    const next = new Date(formik.values.date);
    next.setDate(next.getDate() + deltaDays);
    if (next.getTime() > Date.now()) {
      formik.setFieldError(
        'date',
        'You cannot log a measurement in the future.',
      );
      return;
    }
    formik.setFieldError('date', undefined);
    formik.setFieldValue('date', next);
  };

  const handleSelectDate = (date: Date) => {
    if (date.getTime() > Date.now()) {
      formik.setFieldError(
        'date',
        'You cannot log a measurement in the future.',
      );
      return;
    }
    formik.setFieldError('date', undefined);
    formik.setFieldValue('date', date);
  };

  const handleSetToday = () => {
    formik.setFieldError('date', undefined);
    formik.setFieldValue('date', new Date());
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    formik.setFieldError('date', undefined);
    formik.setFieldValue('date', d);
  };

  const isToday =
    toCalendarDay(formik.values.date) === toCalendarDay(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const isYesterday =
    toCalendarDay(formik.values.date) === toCalendarDay(yesterdayDate);

  const resetForm = () => {
    formik.resetForm();
    setGeneralError(null);
  };

  return {
    ...formik,
    generalError,
    setGeneralError,
    changeDateByDays,
    handleSelectDate,
    handleSetToday,
    handleSetYesterday,
    isToday,
    isYesterday,
    dateError: formik.errors.date as string | undefined,
    weightError: formik.errors.weight as string | undefined,
    resetForm,
  };
}
