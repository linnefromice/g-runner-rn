import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameSessionStore } from '@/stores/gameSessionStore';
import { getFormSkillLevel } from '@/game/formSkills';
import { FORM_DEFINITIONS } from '@/game/forms';

export function SkillChoiceOverlay() {
  const pending = useGameSessionStore((s) => s.pendingSkillChoice);
  const selectSkill = useGameSessionStore((s) => s.selectFormSkill);

  if (!pending) return null;

  const skillLevel = getFormSkillLevel(pending.formId, pending.level);
  if (!skillLevel) return null;

  const formDef = FORM_DEFINITIONS[pending.formId];
  const accentColor = formDef?.spriteConfig.bodyColor ?? '#00D4FF';

  const handleChoice = (choice: 'A' | 'B') => {
    selectSkill(pending.formId, pending.level, choice);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={[styles.title, { color: accentColor }]}>
          LEVEL UP! Lv{pending.level}
        </Text>
        <View style={styles.choices}>
          <TouchableOpacity
            style={[styles.card, { borderColor: accentColor }]}
            onPress={() => handleChoice('A')}
            activeOpacity={0.7}
          >
            <Text style={styles.choiceLabel}>A</Text>
            <Text style={styles.choiceText}>{skillLevel.choiceA.label}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.card, { borderColor: accentColor }]}
            onPress={() => handleChoice('B')}
            activeOpacity={0.7}
          >
            <Text style={styles.choiceLabel}>B</Text>
            <Text style={styles.choiceText}>{skillLevel.choiceB.label}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: '#0a0a14',
    borderRadius: 8,
    padding: 20,
    width: '85%',
    borderWidth: 1,
    borderColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  choices: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
  },
  choiceLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
