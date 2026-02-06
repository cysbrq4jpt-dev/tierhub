import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { PatchVersion, PatchNote, CHANGE_MARKER_COLORS } from '@/types/version.types';

interface PatchNoteSidebarProps {
  patchVersion: PatchVersion | null;
  highlightedCharacterId?: string | null;
  onCharacterPress?: (characterId: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const CHANGE_TYPE_LABELS: Record<string, string> = {
  buff: 'バフ',
  nerf: 'ナーフ',
  rework: 'リワーク',
  new: '新キャラ',
  bugfix: 'バグ修正',
};

const CHANGE_TYPE_ICONS: Record<string, string> = {
  buff: '↑',
  nerf: '↓',
  rework: '⟳',
  new: '★',
  bugfix: '🔧',
};

/**
 * パッチノート・サイドバー
 * 作成画面の右側に当該バージョンの修正内容をリアルタイム表示。
 * モバイルではボトムシートとして表示。
 */
export const PatchNoteSidebar: React.FC<PatchNoteSidebarProps> = ({
  patchVersion,
  highlightedCharacterId,
  onCharacterPress,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNote = (characterId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(characterId)) {
        next.delete(characterId);
      } else {
        next.add(characterId);
      }
      return next;
    });
  };

  if (!patchVersion) {
    return (
      <View className="w-64 bg-[#1A1A1A] border-l border-gray-800 p-4">
        <Text className="text-gray-500 text-sm text-center">
          パッチバージョンを選択してください
        </Text>
      </View>
    );
  }

  if (collapsed) {
    return (
      <TouchableOpacity
        onPress={onToggleCollapse}
        className="w-8 bg-[#1A1A1A] border-l border-gray-800 items-center justify-center"
      >
        <Text className="text-gray-400 text-lg">◀</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View className="w-64 bg-[#1A1A1A] border-l border-gray-800">
      {/* ヘッダー */}
      <View className="flex-row items-center justify-between p-3 border-b border-gray-800">
        <View className="flex-1">
          <Text className="text-white font-bold text-sm">パッチノート</Text>
          <Text className="text-gray-400 text-xs mt-0.5">
            Ver. {patchVersion.version}
          </Text>
        </View>
        {onToggleCollapse && (
          <TouchableOpacity onPress={onToggleCollapse} className="p-1">
            <Text className="text-gray-400 text-sm">▶</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* パッチノート一覧 */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {patchVersion.notes.length === 0 ? (
          <View className="p-4">
            <Text className="text-gray-500 text-xs text-center">
              このパッチの変更情報はありません
            </Text>
          </View>
        ) : (
          patchVersion.notes.map((note) => (
            <PatchNoteItem
              key={note.characterId}
              note={note}
              isHighlighted={highlightedCharacterId === note.characterId}
              isExpanded={expandedNotes.has(note.characterId)}
              onPress={() => onCharacterPress?.(note.characterId)}
              onToggleExpand={() => toggleNote(note.characterId)}
            />
          ))
        )}
      </ScrollView>

      {/* フッター */}
      <View className="p-2 border-t border-gray-800">
        <Text className="text-gray-600 text-xs text-center">
          {patchVersion.notes.length} 件の変更
        </Text>
      </View>
    </View>
  );
};

// 個別パッチノートアイテム
interface PatchNoteItemProps {
  note: PatchNote;
  isHighlighted: boolean;
  isExpanded: boolean;
  onPress: () => void;
  onToggleExpand: () => void;
}

const PatchNoteItem: React.FC<PatchNoteItemProps> = ({
  note,
  isHighlighted,
  isExpanded,
  onPress,
  onToggleExpand,
}) => {
  const markerColor = CHANGE_MARKER_COLORS[note.changeType] || '#757575';
  const icon = CHANGE_TYPE_ICONS[note.changeType] || '';
  const label = CHANGE_TYPE_LABELS[note.changeType] || note.changeType;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3 py-2 border-b border-gray-800/50 ${
        isHighlighted ? 'bg-[#2A2A3A]' : ''
      }`}
    >
      {/* キャラ名 + 変更タイプ */}
      <View className="flex-row items-center">
        <Text style={{ color: markerColor, fontSize: 14, marginRight: 4 }}>
          {icon}
        </Text>
        <Text
          className="text-white text-sm font-medium flex-1"
          numberOfLines={1}
        >
          {note.characterName}
        </Text>
        <View
          className="px-1.5 py-0.5 rounded"
          style={{ backgroundColor: `${markerColor}30` }}
        >
          <Text style={{ color: markerColor, fontSize: 10 }}>{label}</Text>
        </View>
      </View>

      {/* サマリー */}
      <Text className="text-gray-400 text-xs mt-1" numberOfLines={isExpanded ? undefined : 2}>
        {note.summary}
      </Text>

      {/* 詳細（展開時） */}
      {isExpanded && note.details.length > 0 && (
        <View className="mt-2 ml-2">
          {note.details.map((detail, index) => (
            <View key={index} className="flex-row mb-1">
              <Text className="text-gray-500 text-xs mr-1">•</Text>
              <Text className="text-gray-300 text-xs flex-1">{detail}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 展開/折りたたみ */}
      {note.details.length > 0 && (
        <TouchableOpacity onPress={onToggleExpand} className="mt-1">
          <Text className="text-blue-400 text-xs">
            {isExpanded ? '折りたたむ' : `詳細を見る (${note.details.length}件)`}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};
