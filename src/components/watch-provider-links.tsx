import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { WATCH_PROVIDERS } from '@/constants/watch-providers';
import { openWatchLink, type WatchLink } from '@/services/watch-provider-service';

export type WatchProviderLinksProps = {
  links: WatchLink[];
  onAdd: (_link: WatchLink) => void;
  onRemove: (_index: number) => void;
  readonly?: boolean;
};

export function WatchProviderLinks({
  links,
  onAdd,
  onRemove,
  readonly,
}: WatchProviderLinksProps) {
  const theme = useTheme();
  const [adding, setAdding] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');

  const handleAdd = useCallback(() => {
    if (!selectedProvider || !urlInput.trim()) return;
    onAdd({ providerId: selectedProvider, url: urlInput.trim() });
    setSelectedProvider('');
    setUrlInput('');
    setAdding(false);
  }, [selectedProvider, urlInput, onAdd]);

  const handleOpen = useCallback(async (link: WatchLink) => {
    try {
      await openWatchLink(link);
    } catch {
      Alert.alert('Error', 'Could not open this link');
    }
  }, []);

  const handleRemove = useCallback(
    (index: number) => {
      Alert.alert('Remove Link', 'Remove this watch link?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(index),
        },
      ]);
    },
    [onRemove],
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>
        Where to Watch
      </ThemedText>

      {links.length === 0 && !readonly && (
        <ThemedText themeColor="textSecondary" style={styles.empty}>
          No watch links added yet
        </ThemedText>
      )}

      {links.map((link, index) => {
        const provider = WATCH_PROVIDERS.find((p) => p.id === link.providerId);
        return (
          <Pressable
            key={`${link.providerId}-${index}`}
            style={({ pressed }) => [
              styles.linkRow,
              { backgroundColor: theme.backgroundSecondary },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handleOpen(link)}
            onLongPress={() => !readonly && handleRemove(index)}
          >
            <ThemedText style={styles.providerIcon}>
              {provider?.icon || '🔗'}
            </ThemedText>
            <ThemedView style={styles.linkInfo}>
              <ThemedText>{provider?.name || link.providerId}</ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                numberOfLines={1}
              >
                {link.label || link.url}
              </ThemedText>
            </ThemedView>
            {!readonly && (
              <Pressable
                onPress={() => handleRemove(index)}
                hitSlop={8}
              >
                <ThemedText style={styles.removeBtn}>✕</ThemedText>
              </Pressable>
            )}
          </Pressable>
        );
      })}

      {!readonly && !adding && (
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            { borderColor: theme.border || theme.textSecondary },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => setAdding(true)}
        >
          <ThemedText themeColor="textSecondary">+ Add Watch Link</ThemedText>
        </Pressable>
      )}

      {!readonly && adding && (
        <ThemedView
          style={[
            styles.addForm,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="small" style={styles.addFormTitle}>
            Add Watch Link
          </ThemedText>
          <View style={styles.providerGrid}>
            {WATCH_PROVIDERS.map((p) => (
              <Pressable
                key={p.id}
                style={({ pressed }) => [
                  styles.providerChip,
                  {
                    backgroundColor:
                      selectedProvider === p.id
                        ? theme.backgroundSelected
                        : theme.background,
                    borderColor: theme.border || 'transparent',
                  },
                  selectedProvider === p.id && {
                    borderColor: theme.primary || theme.border || 'transparent',
                  },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => setSelectedProvider(p.id)}
              >
                <ThemedText>{p.icon}</ThemedText>
                <ThemedText type="small">{p.name}</ThemedText>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={[
              styles.urlInput,
              {
                color: theme.text,
                backgroundColor: theme.background,
                borderColor: theme.border || 'transparent',
              },
            ]}
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="Paste URL here"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.addActions}>
            <Pressable
              style={({ pressed }) => [
                styles.addActionBtn,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                setAdding(false);
                setSelectedProvider('');
                setUrlInput('');
              }}
            >
              <ThemedText themeColor="textSecondary">Cancel</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.addActionBtn,
                {
                  backgroundColor: theme.primary || theme.backgroundSelected,
                },
                pressed && { opacity: 0.7 },
                (!selectedProvider || !urlInput.trim()) && { opacity: 0.4 },
              ]}
              onPress={handleAdd}
              disabled={!selectedProvider || !urlInput.trim()}
            >
              <ThemedText style={{ color: '#FFF' }}>Add</ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  empty: {
    fontStyle: 'italic',
    paddingVertical: Spacing.two,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  providerIcon: {
    fontSize: 24,
  },
  linkInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  removeBtn: {
    fontSize: 16,
    opacity: 0.6,
    padding: Spacing.one,
  },
  addButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addForm: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  addFormTitle: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  providerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  urlInput: {
    height: 44,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    borderWidth: 1,
  },
  addActions: {
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'flex-end',
  },
  addActionBtn: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.three,
  },
});
