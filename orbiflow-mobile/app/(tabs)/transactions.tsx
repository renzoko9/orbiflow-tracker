import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@presentation/theme';
import { Card } from '@presentation/components/ui';

export default function TransactionsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transacciones</Text>
      </View>

      <View style={styles.content}>
        <Card>
          <Text style={styles.cardTitle}>Próximamente</Text>
          <Text style={styles.cardText}>
            Aquí podrás ver y gestionar todas tus transacciones.
          </Text>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
});
