import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccounts } from '@presentation/hooks/useAccounts';
import { Card } from '@presentation/components/ui';
import { colors, spacing, typography } from '@presentation/theme';
import { Account } from '@domain/entities/Account';

export default function AccountsScreen() {
  const { accounts, loading, error } = useAccounts();
  const router = useRouter();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  const renderAccount = ({ item }: { item: Account }) => (
    <TouchableOpacity>
      <Card style={styles.accountCard}>
        <View style={styles.accountHeader}>
          <Text style={styles.accountName}>{item.name}</Text>
          <Text style={styles.accountBalance}>{item.formattedBalance}</Text>
        </View>
        {item.description && (
          <Text style={styles.accountDescription}>{item.description}</Text>
        )}
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Cuentas</Text>
      </View>

      {accounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tienes cuentas aún</Text>
          <Text style={styles.emptySubtext}>Crea tu primera cuenta para comenzar</Text>
        </View>
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  listContent: {
    padding: spacing.lg,
  },
  accountCard: {
    marginBottom: spacing.md,
  },
  accountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  accountBalance: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  accountDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.danger,
  },
});
