import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, Radii, Shadows } from '../constants/theme';

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({ children, style, onPress }: CardProps) {
  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────

interface ButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
}

export function Button({ label, onPress, disabled, variant = 'primary', style }: ButtonProps) {
  const btnStyle = [
    styles.btn,
    variant === 'primary' && styles.btnPrimary,
    variant === 'secondary' && styles.btnSecondary,
    variant === 'ghost' && styles.btnGhost,
    disabled && styles.btnDisabled,
    style,
  ];
  const textStyle = [
    styles.btnText,
    variant === 'primary' && styles.btnTextPrimary,
    variant === 'secondary' && styles.btnTextSecondary,
    variant === 'ghost' && styles.btnTextGhost,
  ];
  return (
    <TouchableOpacity style={btnStyle} onPress={onPress} disabled={disabled} activeOpacity={0.8}>
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── ChipGroup ─────────────────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  emoji: string;
  title: string;
  message: string;
}

export function EmptyState({ emoji, title, message }: EmptyStateProps) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
}

// ─── LoadingState ─────────────────────────────────────────────────────────────

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Getting your personalised suggestions…' }: LoadingStateProps) {
  return (
    <View style={loadingStyles.root} accessibilityLiveRegion="polite" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={loadingStyles.text}>{message}</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  text: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});

// ─── ErrorState ───────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={errorStyles.root}>
      <Text style={errorStyles.emoji}>⚠️</Text>
      <Text style={errorStyles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={errorStyles.retryBtn} onPress={onRetry} accessibilityLabel="Try again">
          <Text style={errorStyles.retryText}>Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const errorStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  emoji: { fontSize: 36, marginBottom: Spacing.md },
  message: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  retryBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radii.full,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
  },
  retryText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
    fontSize: Typography.fontSizeMD,
  },
});

// ─── InlineError ──────────────────────────────────────────────────────────────
// Compact banner shown directly below an input field for guardrail rejections.

interface InlineErrorProps {
  message: string;
}

export function InlineError({ message }: InlineErrorProps) {
  return (
    <View style={inlineErrorStyles.root} accessibilityRole="alert">
      <Text style={inlineErrorStyles.icon}>🚫</Text>
      <Text style={inlineErrorStyles.text}>{message}</Text>
    </View>
  );
}

const inlineErrorStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: Radii.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  icon: { fontSize: 15, lineHeight: 20 },
  text: {
    flex: 1,
    fontSize: Typography.fontSizeSM,
    color: '#B91C1C',
    lineHeight: 19,
    fontWeight: Typography.fontWeightMedium,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
  },
  btnSecondary: {
    backgroundColor: Colors.secondaryLight,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  btnGhost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightSemiBold,
  },
  btnTextPrimary: {
    color: Colors.white,
  },
  btnTextSecondary: {
    color: Colors.secondary,
  },
  btnTextGhost: {
    color: Colors.textMuted,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    margin: 4,
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    fontWeight: Typography.fontWeightMedium,
  },
  chipTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeightSemiBold,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSizeSM,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSizeLG,
    fontWeight: Typography.fontWeightBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    fontSize: Typography.fontSizeMD,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
