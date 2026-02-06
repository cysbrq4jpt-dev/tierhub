import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  ChangeMarker,
  CHANGE_MARKER_ICONS,
  CHANGE_MARKER_COLORS,
  PatchNote,
} from '@/types/version.types';

interface ChangeMarkerBadgeProps {
  changeType: ChangeMarker;
  size?: 'small' | 'medium';
  onPress?: () => void;
}

/**
 * バフ/ナーフ・オートマーカー
 * パッチで性能変化があったキャラに「↑/↓」バッジを表示。
 */
export const ChangeMarkerBadge: React.FC<ChangeMarkerBadgeProps> = ({
  changeType,
  size = 'small',
  onPress,
}) => {
  if (changeType === 'none') return null;

  const icon = CHANGE_MARKER_ICONS[changeType];
  const color = CHANGE_MARKER_COLORS[changeType];
  const isSmall = size === 'small';

  const badge = (
    <View
      className={`rounded-full items-center justify-center ${
        isSmall ? 'w-4 h-4' : 'w-6 h-6'
      }`}
      style={{ backgroundColor: `${color}30`, borderWidth: 1, borderColor: color }}
    >
      <Text
        style={{
          color,
          fontSize: isSmall ? 8 : 11,
          fontWeight: 'bold',
        }}
      >
        {icon}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} className="absolute -top-1 -right-1 z-10">
        {badge}
      </TouchableOpacity>
    );
  }

  return <View className="absolute -top-1 -right-1 z-10">{badge}</View>;
};

// パッチノート要約ポップオーバー
interface PatchNotePopoverProps {
  note: PatchNote;
  visible: boolean;
}

export const PatchNotePopover: React.FC<PatchNotePopoverProps> = ({
  note,
  visible,
}) => {
  if (!visible) return null;

  const color = CHANGE_MARKER_COLORS[note.changeType] || '#757575';

  return (
    <View
      className="absolute bottom-full left-0 right-0 mb-1 bg-[#2A2A2A] rounded-lg p-2 z-20"
      style={{ borderWidth: 1, borderColor: `${color}50` }}
    >
      <Text className="text-white text-xs font-bold mb-1">
        {note.characterName}
      </Text>
      <Text className="text-gray-300 text-xs">{note.summary}</Text>
      {note.details.length > 0 && (
        <View className="mt-1">
          {note.details.slice(0, 3).map((detail, i) => (
            <Text key={i} className="text-gray-400 text-xs">
              • {detail}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};
