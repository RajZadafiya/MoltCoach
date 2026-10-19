import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AddWeightPayload } from '../../interface';
import { formatDate } from '../../utils/date';
import { CustomDatePicker, SafeTouchable } from 'components';
import { useAddWeightForm } from '../../hooks';
import { isAndroid } from 'globals';

interface AddWeightModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: AddWeightPayload) => Promise<void>;
  isSaving: boolean;
}

export const AddWeightModal: React.FC<AddWeightModalProps> = ({
  visible,
  onClose,
  onSave,
  isSaving,
}) => {
  const {
    values,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    generalError,
    changeDateByDays,
    handleSelectDate,
    handleSetToday,
    handleSetYesterday,
    isToday,
    isYesterday,
    submitCount,
    resetForm,
    dateError,
    weightError: rawWeightError,
  } = useAddWeightForm({
    onSave,
    onSuccess: onClose,
  });

  const isBusy = isSaving || isSubmitting;
  const weightError = touched.weight || submitCount > 0 ? rawWeightError : null;

  React.useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        if (!isBusy) onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={isAndroid ? undefined : 'padding'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add weight</Text>
            <SafeTouchable
              onPress={onClose}
              disabled={isBusy}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </SafeTouchable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            keyboardShouldPersistTaps="handled"
          >
            {!!generalError && (
              <View style={styles.generalErrorBox}>
                <Text style={styles.errorText}>! {generalError}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Date</Text>
              <View style={styles.dateSelectorRow}>
                <SafeTouchable
                  style={styles.dateStepperBtn}
                  onPress={() => changeDateByDays(-1)}
                  disabled={isBusy}
                >
                  <Text style={styles.dateStepperText}>‹</Text>
                </SafeTouchable>

                <CustomDatePicker
                  value={values.date}
                  maximumDate={new Date()}
                  onChange={handleSelectDate}
                  style={styles.datePickerContainer}
                  renderUI={
                    <View style={styles.dateDisplay}>
                      <Text style={styles.dateDisplayText}>
                        {formatDate(values.date.toISOString())}
                      </Text>
                      {isToday && <Text style={styles.todayBadge}>Today</Text>}
                      {isYesterday && (
                        <Text style={styles.todayBadge}>Yesterday</Text>
                      )}
                    </View>
                  }
                />

                <SafeTouchable
                  style={[
                    styles.dateStepperBtn,
                    isToday && styles.dateStepperDisabled,
                  ]}
                  onPress={() => changeDateByDays(1)}
                  disabled={isToday || isBusy}
                >
                  <Text style={styles.dateStepperText}>›</Text>
                </SafeTouchable>
              </View>

              <View style={styles.quickDateRow}>
                <SafeTouchable
                  style={[
                    styles.quickDateBtn,
                    isToday && styles.quickDateActive,
                  ]}
                  onPress={handleSetToday}
                >
                  <Text
                    style={[
                      styles.quickDateText,
                      isToday && styles.quickDateTextActive,
                    ]}
                  >
                    Today
                  </Text>
                </SafeTouchable>
                <SafeTouchable
                  style={[
                    styles.quickDateBtn,
                    isYesterday && styles.quickDateActive,
                  ]}
                  onPress={handleSetYesterday}
                >
                  <Text
                    style={[
                      styles.quickDateText,
                      isYesterday && styles.quickDateTextActive,
                    ]}
                  >
                    Yesterday
                  </Text>
                </SafeTouchable>
              </View>

              {!!dateError && (
                <Text style={styles.errorText}>! {dateError}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Weight (kg)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  weightError ? styles.textInputError : null,
                ]}
                placeholder="85.4"
                placeholderTextColor="#9CA3AF"
                value={values.weight}
                onChangeText={handleChange('weight')}
                keyboardType="decimal-pad" // Requirement A2
                editable={!isBusy}
              />
              {!!weightError && (
                <Text style={styles.errorText}>! {weightError}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.fieldLabel}>Note (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.noteInput]}
                placeholder="e.g. Morning, fasted"
                placeholderTextColor="#9CA3AF"
                value={values.note}
                onChangeText={handleChange('note')}
                editable={!isBusy}
                multiline
              />
            </View>

            <SafeTouchable
              style={[styles.saveButton, isBusy && styles.saveButtonDisabled]}
              onPress={() => handleSubmit()}
              disabled={isBusy}
              activeOpacity={0.8}
            >
              {isBusy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </SafeTouchable>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: isAndroid ? 24 : 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 6,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  generalErrorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 6,
  },
  dateStepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  dateStepperDisabled: {
    opacity: 0.3,
  },
  dateStepperText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  datePickerContainer: {
    flex: 1,
  },
  dateDisplay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDisplayText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  todayBadge: {
    marginLeft: 8,
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#DBEAFE',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  quickDateRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  quickDateBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  quickDateActive: {
    backgroundColor: '#E0E7FF',
  },
  quickDateText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  quickDateTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  textInput: {
    height: 48,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  noteInput: {
    height: 60,
    paddingTop: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 16,
  },
  saveButton: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
