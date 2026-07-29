import { type ReactNode } from 'react';
import { Modal as RNModal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function Modal({ visible, onClose, title, children }: ModalProps) {
  const theme = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.sheet || theme.background },
          ]}
          onPress={() => {}}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: theme.textTertiary },
            ]}
          />
          {title && (
            <ThemedView style={styles.header}>
              <ThemedView style={{ width: 40 }} />
              <ThemedText type="subtitle" style={styles.title}>
                {title}
              </ThemedText>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <ThemedText type="link">Done</ThemedText>
              </Pressable>
            </ThemedView>
          )}
          <ThemedView style={styles.content}>{children}</ThemedView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Spacing.five,
    borderTopRightRadius: Spacing.five,
    borderCurve: 'continuous',
    maxHeight: '85%',
    paddingBottom: Spacing.six,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  title: {
    textAlign: 'center',
  },
  closeButton: {
    width: 40,
    alignItems: 'flex-end',
  },
  content: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
});
