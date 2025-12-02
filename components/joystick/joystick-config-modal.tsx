import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSelector } from '@reduxjs/toolkit';
import { jwtDecode } from "jwt-decode";
import { Check, Save, Search, Settings as SettingsIcon, X } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';

// --- IMPORTS HOOKS ---
import {
  useAllActions,
  useDances,
  useExpressions,
  useExtendedActions,
  useJoystick // Hook CRUD Joystick
} from '@/features/actions/hooks/useApi';

import { Joystick } from '@/features/actions/types/joystick';
import { RootState } from '@/store/store';

// --- REDUX SELECTORS ---
const selectSelectedRobotSerial = (state: RootState) => state.robot.selectedRobotSerial;
const selectRobots = (state: RootState) => state.robot.robots;

const selectCurrentRobot = createSelector(
  [selectSelectedRobotSerial, selectRobots],
  (selectedRobotSerial, robots) => {
    const serial = Array.isArray(selectedRobotSerial) ? selectedRobotSerial[0] : selectedRobotSerial;
    return robots.filter(r => r.serialNumber === serial);
  }
);

// --- TYPES & CONSTANTS ---
type ButtonName = 'A' | 'B' | 'X' | 'Y';
type ActionType = 'action' | 'dance' | 'expression' | 'extended_action';

interface JoystickConfigurationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  existingJoysticks?: Joystick[];
}

const BUTTON_COLORS = {
  A: '#eab308',
  B: '#ef4444',
  X: '#3b82f6',
  Y: '#22c55e',
};

export default function JoystickConfigurationModal({
  isVisible,
  onClose,
  onSuccess,
  existingJoysticks = [], // Dữ liệu joystick được truyền từ ngoài vào (để check update)
}: JoystickConfigurationModalProps) {
  
  // State UI
  const [selectedButton, setSelectedButton] = useState<ButtonName>('A');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ActionType>('action');
  const [isSaving, setIsSaving] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);
  
  // State lưu config tạm thời
  const [buttonConfigs, setButtonConfigs] = useState<Record<ButtonName, any>>({
    A: null, B: null, X: null, Y: null,
  });

  // --- LOGIC DATA ---
  const currentRobot = useSelector(selectCurrentRobot);
  const shouldRun = currentRobot.length === 1;
  const robotModelId = shouldRun ? currentRobot[0].robotModelId : undefined;
  const robotId = shouldRun ? currentRobot[0].id : '';

  // 1. Get Account ID
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          const decoded: any = jwtDecode(token);
          setAccountId(decoded.sub || decoded.id || decoded.userId);
        }
      } catch(e) { console.error('Error decoding token:', e); }
    })();
  }, [isVisible]);

  // 2. Fetch API Data (Action, Dance...)
  const { allPagesData: actionPages, isLoading: loadingActions } = useAllActions({ size: 100, robotModelId, shouldRun });
  const { allPagesData: dancePages, isLoading: loadingDances } = useDances({ size: 100, robotModelId, shouldRun });
  const { allPagesData: exprPages, isLoading: loadingExpr } = useExpressions({ size: 100, robotModelId, shouldRun });
  const { allPagesData: extPages, isLoading: loadingExt } = useExtendedActions({ size: 100, robotModelId, shouldRun });

  // 3. API Joystick Hooks
  const { useGetJoysticks, useCreateJoystick, useUpdateJoystick } = useJoystick();
  const { data: existingConfigs, refetch: refetchConfigs } = useGetJoysticks({
    accountId: accountId || undefined,
    robotId: robotId || undefined
  });
  const createJoystickMutation = useCreateJoystick();
  const updateJoystickMutation = useUpdateJoystick();

  // Helper flatten data
  const flattenData = (pages: any) => {
    if (!pages) return [];
    return Object.values(pages).flatMap((page: any) => 
      page.items || page.data || page.results || []
    );
  };

  const actionsList = useMemo(() => flattenData(actionPages), [actionPages]);
  const dancesList = useMemo(() => flattenData(dancePages), [dancePages]);
  const expressionsList = useMemo(() => flattenData(exprPages), [exprPages]);
  const extendedActionsList = useMemo(() => flattenData(extPages), [extPages]);

  // --- SYNC DATA CŨ KHI MỞ MODAL ---
  useEffect(() => {
    if (isVisible) {
      const configs: any = { A: null, B: null, X: null, Y: null };
      
      // Load configs từ API fetch (existingConfigs) + fallback to props
      const joysticksToLoad = existingConfigs?.joysticks || existingJoysticks || [];
      
      if (joysticksToLoad.length > 0) {
        joysticksToLoad.forEach((joy: Joystick) => {
          const btn = joy.buttonCode as ButtonName;
          if (configs.hasOwnProperty(btn)) {
             let type: ActionType = 'action';
             if (joy.danceId) type = 'dance';
             else if (joy.expressionId) type = 'expression';
             else if (joy.extendedActionId) type = 'extended_action';

             const name = joy.actionName || joy.danceName || joy.expressionName || joy.extendedActionName;
             const id = joy.actionId || joy.danceId || joy.expressionId || joy.extendedActionId;
             const code = joy.actionCode || joy.danceCode || joy.expressionCode || joy.extendedActionCode;

             // Lưu lại ID của joystick cũ để phục vụ Update
             configs[btn] = { 
                joystickId: joy.id, // 👈 Quan trọng: ID bản ghi Joystick để update
                buttonCode: btn, 
                actionType: type, 
                actionId: id, 
                actionCode: code, 
                actionName: name 
             };
             console.log(`✅ Loaded config for button ${btn}: ${name}`);
          }
        });
      }
      setButtonConfigs(configs);
    }
  }, [isVisible, existingConfigs, existingJoysticks]);

  // --- HANDLERS ---
  const handleAssignAction = (item: any, type: ActionType) => {
    // Giữ lại joystickId cũ nếu đang update
    const currentConfig = buttonConfigs[selectedButton];
    
    const config = {
      joystickId: currentConfig?.joystickId, // Giữ ID cũ
      buttonCode: selectedButton,
      actionType: type,
      actionId: item.id,
      actionCode: item.code,
      actionName: item.name,
      imageUrl: item.imageUrl
    };
    setButtonConfigs(prev => ({ ...prev, [selectedButton]: config }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (!accountId) throw new Error("Chưa lấy được Account ID");

      const configs = Object.values(buttonConfigs).filter(Boolean) as any[];
      if (configs.length === 0) {
        Alert.alert("Lỗi", "Chưa có nút nào được cấu hình");
        setIsSaving(false); return;
      }

      for (const config of configs) {
        // Payload chuẩn bị gửi
        const payload = {
            accountId,
            robotId, 
            buttonCode: config.buttonCode,
            type: config.actionType,
            status: 1,
            
            actionId: config.actionType === 'action' ? config.actionId : null,
            actionCode: config.actionType === 'action' ? config.actionCode : null,
            actionName: config.actionType === 'action' ? config.actionName : null,
            
            danceId: config.actionType === 'dance' ? config.actionId : null,
            danceCode: config.actionType === 'dance' ? config.actionCode : null,
            danceName: config.actionType === 'dance' ? config.actionName : null,

            expressionId: config.actionType === 'expression' ? config.actionId : null,
            expressionCode: config.actionType === 'expression' ? config.actionCode : null,
            expressionName: config.actionType === 'expression' ? config.actionName : null,

            extendedActionId: config.actionType === 'extended_action' ? config.actionId : null,
            extendedActionCode: config.actionType === 'extended_action' ? config.actionCode : null,
            extendedActionName: config.actionType === 'extended_action' ? config.actionName : null,

            skillId: null, skillCode: null, skillName: null,
        };

        // 🧠 Logic thông minh: Nếu có joystickId (đã tồn tại) -> UPDATE, ngược lại -> CREATE
        if (config.joystickId) {
            console.log(`🔄 Updating joystick ${config.joystickId}...`);
            await updateJoystickMutation.mutateAsync({ id: config.joystickId, joystickData: payload });
        } else {
            console.log(`✨ Creating new joystick for ${config.buttonCode}...`);
            await createJoystickMutation.mutateAsync(payload);
        }
      }

      Alert.alert("Thành công", "Đã lưu cấu hình Joystick!");
      refetchConfigs?.(); // Refetch existing configs
      onSuccess?.();
      onClose();
    } catch (e: any) {
      Alert.alert("Lỗi", e.message || "Có lỗi xảy ra khi lưu.");
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // --- RENDER HELPERS ---
  const getDataForList = () => {
      const filterFunc = (item: any) => item.name?.toLowerCase().includes(searchTerm.toLowerCase());
      switch(activeTab) {
          case 'action': return actionsList.filter(filterFunc);
          case 'dance': return dancesList.filter(filterFunc);
          case 'expression': return expressionsList.filter(filterFunc);
          case 'extended_action': return extendedActionsList.filter(filterFunc);
          default: return [];
      }
  };

  const isLoadingData = () => {
      switch(activeTab) {
          case 'action': return loadingActions;
          case 'dance': return loadingDances;
          case 'expression': return loadingExpr;
          case 'extended_action': return loadingExt;
          default: return false;
      }
  };

  const renderGridItem = ({ item }: { item: any }) => {
    const currentConfig = buttonConfigs[selectedButton];
    const isSelected = currentConfig?.actionCode === item.code || currentConfig?.actionId === item.id;
    return (
        <TouchableOpacity 
            style={[styles.gridItem, isSelected && styles.selectedGridItem]} 
            onPress={() => handleAssignAction(item, activeTab)}
        >
            <View style={styles.gridIconContainer}>
               {activeTab === 'expression' && item.imageUrl ? (
                   <Image source={{ uri: item.imageUrl }} style={styles.gridImage} resizeMode="cover"/>
               ) : (
                   <Text style={styles.gridIconText}>
                       {item.icon || (activeTab === 'extended_action' ? '⚡' : '🤖')}
                   </Text>
               )}
            </View>
            <Text style={styles.gridLabel} numberOfLines={2}>{item.name}</Text>
            {isSelected && <View style={styles.checkBadge}><Check size={12} color="#fff" /></View>}
        </TouchableOpacity>
    );
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
                <SettingsIcon color="#3b82f6" size={24} />
                <Text style={styles.headerTitle}>Cấu hình Joystick</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}><X color="#64748b" size={24} /></TouchableOpacity>
          </View>

          <View style={styles.body}>
            {/* Left Column */}
            <View style={styles.leftColumn}>
                <Text style={styles.sectionTitle}>Chọn nút</Text>
                <View style={styles.controllerLayout}>
                    {(Object.keys(BUTTON_COLORS) as ButtonName[]).map(btn => (
                        <TouchableOpacity
                            key={btn}
                            style={[styles.joyBtn, { backgroundColor: BUTTON_COLORS[btn] }, selectedButton === btn && styles.selectedJoyBtn]}
                            onPress={() => setSelectedButton(btn)}
                        >
                            <Text style={styles.joyBtnText}>{btn}</Text>
                            {buttonConfigs[btn] && <View style={styles.assignedBadge}><Check size={10} color="#fff" /></View>}
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Đang gán nút {selectedButton}:</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{buttonConfigs[selectedButton]?.actionName || 'Trống'}</Text>
                    <Text style={styles.infoType}>{buttonConfigs[selectedButton]?.actionType?.toUpperCase().replace('_', ' ')}</Text>
                </View>

                <TouchableOpacity style={[styles.saveButton, isSaving && { opacity: 0.7 }]} onPress={handleSave} disabled={isSaving}>
                    {isSaving ? <ActivityIndicator color="#fff" /> : <Save color="#fff" size={20} />}
                    <Text style={styles.saveText}>Lưu</Text>
                </TouchableOpacity>
            </View>

            {/* Right Column */}
            <View style={styles.rightColumn}>
                <View style={styles.searchBar}>
                    <Search color="#94a3b8" size={20} />
                    <TextInput 
                        placeholder="Tìm kiếm..." style={styles.searchInput}
                        value={searchTerm} onChangeText={setSearchTerm} placeholderTextColor="#94a3b8"
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
                    {[
                        { key: 'action', label: 'Hành động', count: actionsList.length },
                        { key: 'dance', label: 'Điệu nhảy', count: dancesList.length },
                        { key: 'expression', label: 'Biểu cảm', count: expressionsList.length },
                        { key: 'extended_action', label: 'Mở rộng', count: extendedActionsList.length },
                    ].map(t => (
                        <TouchableOpacity 
                            key={t.key} onPress={() => setActiveTab(t.key as ActionType)}
                            style={[styles.tabButton, activeTab === t.key && styles.activeTab]}
                        >
                            <Text style={[styles.tabText, activeTab === t.key && styles.activeTabText]}>{t.label} ({t.count})</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {isLoadingData() ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList 
                        data={getDataForList()}
                        keyExtractor={(item) => item.id || item.code} 
                        renderItem={renderGridItem}
                        numColumns={3}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        style={styles.listArea}
                        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy dữ liệu</Text>}
                    />
                )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContainer: { 
    // --- SỬA SIZE Ở ĐÂY ---
    width: '94%',         // Mở rộng chiều ngang
    height: '92%',        // Mở rộng chiều cao (quan trọng cho landscape)
    backgroundColor: '#fff', 
    borderRadius: 16, 
    overflow: 'hidden', 
    flexDirection: 'column',
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10, 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
    height: 56, // Fix chiều cao header
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  closeBtn: { padding: 4 },
  
  body: { flex: 1, flexDirection: 'row' },
  
  // --- CỘT TRÁI (Thu nhỏ lại chút) ---
  leftColumn: { 
    width: 200, // Giảm từ 220 xuống 200 hoặc 180 để đỡ chiếm chỗ
    padding: 12, 
    borderRightWidth: 1, 
    borderRightColor: '#e2e8f0', 
    alignItems: 'center', 
    backgroundColor: '#f8fafc',
    justifyContent: 'flex-start' 
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12, color: '#475569' },
  
  controllerLayout: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    width: 130, // Thu nhỏ container nút
    height: 130, 
    justifyContent: 'center', 
    alignContent: 'center', 
    marginBottom: 12 
  },
  joyBtn: { 
    width: 48, // Nút to lên xíu cho dễ bấm
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    margin: 6, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 3, 
    elevation: 4 
  },
  selectedJoyBtn: { borderWidth: 3, borderColor: '#1d4ed8', transform: [{ scale: 1.1 }] },
  joyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  assignedBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#22c55e', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
  
  infoBox: { 
    width: '100%', 
    backgroundColor: '#eff6ff', 
    padding: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#bfdbfe', 
    marginBottom: 12, 
    alignItems: 'center',
    marginTop: 'auto' // Đẩy xuống đáy
  },
  infoLabel: { fontSize: 11, color: '#64748b', marginBottom: 2 },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#1e40af', textAlign: 'center' },
  infoType: { fontSize: 10, color: '#64748b', marginTop: 2, fontWeight: '600' },
  
  saveButton: { 
    flexDirection: 'row', 
    backgroundColor: '#2563eb', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    alignItems: 'center', 
    gap: 8, 
    width: '100%', 
    justifyContent: 'center',
    marginBottom: 0
  },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  // --- CỘT PHẢI ---
  rightColumn: { flex: 1, padding: 12, backgroundColor: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 10, height: 44, marginBottom: 10 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0f172a', paddingVertical: 0 },
  
  tabContainer: { maxHeight: 40, marginBottom: 10 },
  tabButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, backgroundColor: '#f1f5f9', height: 34, justifyContent: 'center' },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#fff' },
  
  listArea: { flex: 1 },
  // Grid Item
  gridItem: { 
    flex: 1, 
    margin: 6, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 8, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    // Aspect ratio 1 để item vuông vức, dễ nhìn hơn trên landscape
    aspectRatio: 1, 
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedGridItem: { borderColor: '#3b82f6', backgroundColor: '#eff6ff', borderWidth: 2 },
  gridIconContainer: { marginBottom: 6, width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  gridImage: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#e2e8f0' },
  gridIconText: { fontSize: 26 },
  gridLabel: { fontSize: 11, textAlign: 'center', color: '#334155', fontWeight: '500' },
  checkBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#22c55e', borderRadius: 10, padding: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 14 },
});