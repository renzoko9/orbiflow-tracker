import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, typography } from '@presentation/theme';
import { Card } from '@presentation/components/ui';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Bienvenido a OrbiFlow Tracker</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Balance Total</Text>
          <Text style={styles.balance}>S/ 0.00</Text>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Próximamente</Text>
          <Text style={styles.cardText}>
            Aquí verás un resumen de tus finanzas, gráficas y estadísticas.
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  balance: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  cardText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
});
