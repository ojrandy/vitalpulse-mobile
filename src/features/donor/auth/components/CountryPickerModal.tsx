import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../../../../components/AppText';
import { colors, radii, spacing } from '../../../../theme';
import type { Country } from '../utils/countries';

interface CountryPickerModalProps {
  visible: boolean;
  countries: Country[];
  selectedCode: string;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

export function CountryPickerModal({
  visible,
  countries,
  selectedCode,
  onSelect,
  onClose,
}: CountryPickerModalProps) {
  const { t } = useTranslation('auth');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(q) ||
        country.callingCode.includes(q) ||
        country.code.toLowerCase().includes(q),
    );
  }, [countries, query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} accessibilityRole="button" onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.headerRow}>
            <AppText variant="titleM">{t('phoneEntry.countryPickerTitle')}</AppText>
            <Pressable accessibilityRole="button" onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={colors.text.mutedForeground} />
            </Pressable>
          </View>

          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color={colors.text.mutedForeground} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('phoneEntry.countrySearchPlaceholder')}
              placeholderTextColor={colors.text.mutedForeground}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            keyboardShouldPersistTaps="handled"
            style={styles.list}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                style={styles.row}
                onPress={() => {
                  onSelect(item);
                  handleClose();
                }}
              >
                <AppText style={styles.flag}>{item.flag}</AppText>
                <AppText variant="bodyM" style={styles.name}>
                  {item.name}
                </AppText>
                <AppText variant="bodyM" color={colors.text.mutedForeground}>
                  +{item.callingCode}
                </AppText>
                {item.code === selectedCode ? (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.brand.primary}
                    style={styles.check}
                  />
                ) : null}
              </Pressable>
            )}
            ListEmptyComponent={
              <AppText variant="bodyS" color={colors.text.mutedForeground} style={styles.empty}>
                {t('phoneEntry.countryNoResults')}
              </AppText>
            }
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(38, 27, 26, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface.background,
    borderTopLeftRadius: radii['2xl'],
    borderTopRightRadius: radii['2xl'],
    maxHeight: '82%',
    minHeight: '50%',
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radii.full,
    backgroundColor: colors.surface.border,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface.surfaceSunken,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 17,
    color: colors.text.foreground,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  flag: {
    fontSize: 24,
  },
  name: {
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: colors.surface.border,
  },
  check: {
    marginLeft: spacing.xs,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
