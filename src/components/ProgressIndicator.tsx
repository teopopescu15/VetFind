import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onStepClick?: (step: number) => void;
}

/**
 * ProgressIndicator - Visual progress bar for multi-step forms
 *
 * Features:
 * - Step numbers with labels
 * - Active/completed/inactive states
 * - Animated transitions
 * - Optional click navigation
 * - Purple theme (#7c3aed)
 */
export const ProgressIndicator = ({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick
}: ProgressIndicatorProps) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  const getStepStatus = (step: number): 'completed' | 'active' | 'inactive' => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'active';
    return 'inactive';
  };

  const handleStepPress = (step: number) => {
    // Only allow clicking on completed steps or current step
    if (step <= currentStep && onStepClick) {
      onStepClick(step);
    }
  };

  const renderStepIcon = (step: number, status: 'completed' | 'active' | 'inactive') => {
    if (status === 'completed') {
      return (
        <View style={[styles.stepCircle, styles.stepCompleted]}>
          <Ionicons name="checkmark" size={20} color="#fff" />
        </View>
      );
    }

    if (status === 'active') {
      return (
        <LinearGradient
          colors={['#7c3aed', '#a855f7']}
          style={styles.stepCircle}
        >
          <Text style={styles.stepNumberActive}>{step}</Text>
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.stepCircle, styles.stepInactive]}>
        <Text style={styles.stepNumberInactive}>{step}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar Background */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progressPercentage}%` }
            ]}
          >
            <LinearGradient
              colors={['#7c3aed', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </View>
        </View>

        {/* Step Indicators */}
        <View style={styles.stepsContainer}>
          {Array.from({ length: totalSteps }, (_, index) => {
            const step = index + 1;
            const status = getStepStatus(step);
            const isClickable = step <= currentStep && onStepClick;

            return (
              <Pressable
                key={step}
                style={styles.stepWrapper}
                onPress={() => handleStepPress(step)}
                disabled={!isClickable}
                accessibilityRole="button"
                accessibilityLabel={`Step ${step}: ${stepLabels[index]}`}
                accessibilityState={{
                  selected: status === 'active',
                  disabled: !isClickable
                }}
              >
                {renderStepIcon(step, status)}

                <Text
                  style={[
                    styles.stepLabel,
                    status === 'active' && styles.stepLabelActive,
                    status === 'completed' && styles.stepLabelCompleted
                  ]}
                  numberOfLines={2}
                >
                  {stepLabels[index]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Current Step Indicator */}
      <View style={styles.currentStepContainer}>
        <Text style={styles.currentStepText}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.currentStepLabel}>
          {stepLabels[currentStep - 1]}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff'
  },
  progressBarContainer: {
    position: 'relative',
    marginBottom: 24
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden'
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    paddingHorizontal: 0
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  stepCompleted: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed'
  },
  stepInactive: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb'
  },
  stepNumberActive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff'
  },
  stepNumberInactive: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9ca3af'
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 14
  },
  stepLabelActive: {
    color: '#7c3aed',
    fontWeight: '700'
  },
  stepLabelCompleted: {
    color: '#4b5563',
    fontWeight: '600'
  },
  currentStepContainer: {
    alignItems: 'center',
    paddingTop: 8
  },
  currentStepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4
  },
  currentStepLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  }
});
