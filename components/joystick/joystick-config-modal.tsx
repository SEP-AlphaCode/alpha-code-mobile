import { createSelector } from '@reduxjs/toolkit';
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

// --- IMPORTS HOOKS (Từ file hook đã gộp) ---
import {
    useAllActions,
    useDances,
    useExpressions,
    useExtendedActions,
    useJoystick // Hook CRUD Joystick
} from '@/features/actions/hooks/useApi';

import { Joystick } from '@/features/actions/types/joystick';
import { RootState } from '@/store/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode"; // Cần cài: npm install jwt-decode

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
  existingJoysticks = [],
}: JoystickConfigurationModalProps) {
  // State UI
  const [selectedButton, setSelectedButton] = useState<ButtonName>('A');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<ActionType>('action');
  const [isSaving, setIsSaving] = useState(false);
  
  // State lưu config tạm thời của người dùng
  const [buttonConfigs, setButtonConfigs] = useState<Record<ButtonName, any>>({
    A: null, B: null, X: null, Y: null,
  });

  // --- LOGIC DATA ---
  const currentRobot = useSelector(selectCurrentRobot);
  const shouldRun = currentRobot.length === 1;
  const robotModelId = shouldRun ? currentRobot[0].robotModelId : undefined;
  const robotId = shouldRun ? currentRobot[0].id : '';

  // API Hooks
  const { allPagesData: actionPages, isLoading: loadingActions } = useAllActions({ size: 100, robotModelId, shouldRun });
  const { allPagesData: dancePages, isLoading: loadingDances } = useDances({ size: 100, robotModelId, shouldRun });
  const { allPagesData: exprPages, isLoading: loadingExpr } = useExpressions({ size: 100, robotModelId, shouldRun });
  const { allPagesData: extPages, isLoading: loadingExt } = useExtendedActions({ size: 100, robotModelId, shouldRun });

  const { useCreateJoystick } = useJoystick();
  const createJoystickMutation = useCreateJoystick();

  // Helper flatten data pages -> single array
  const flattenData = (pages: any) => {
    if (!pages) return [];
    return Object.values(pages).flatMap((page: any) => page.items || []);
  };

  const actionsList = useMemo(() => flattenData(actionPages), [actionPages]);
  const dancesList = useMemo(() => flattenData(dancePages), [dancePages]);
  const expressionsList = useMemo(() => flattenData(exprPages), [exprPages]);
  const extendedActionsList = useMemo(() => flattenData(extPages), [extPages]);

  // --- SYNC DATA CŨ KHI MỞ MODAL ---
  useEffect(() => {
    if (isVisible) {
      // Reset về mặc định hoặc load config cũ
      const configs: any = { A: null, B: null, X: null, Y: null };
      
      if (existingJoysticks.length > 0) {
        existingJoysticks.forEach((joy) => {
          const btn = joy.buttonCode as ButtonName;
          if (configs.hasOwnProperty(btn)) {
             let type: ActionType = 'action';
             // Logic detect type dựa trên dữ liệu trả về
             if (joy.danceId) type = 'dance';
             else if (joy.expressionId) type = 'expression';
             else if (joy.extendedActionId) type = 'extended_action';

             const name = joy.actionName || joy.danceName || joy.expressionName || joy.extendedActionName;
             const id = joy.actionId || joy.danceId || joy.expressionId || joy.extendedActionId;
             const code = joy.actionCode || joy.danceCode || joy.expressionCode || joy.extendedActionCode;

             configs[btn] = { buttonCode: btn, actionType: type, actionId: id, actionCode: code, actionName: name };
          }
        });
      }
      setButtonConfigs(configs);
    }
  }, [isVisible, existingJoysticks]);

  // --- HANDLERS ---
  const handleAssignAction = (item: any, type: ActionType) => {
    const config = {
      buttonCode: selectedButton,
      actionType: type,
      actionId: item.id,
      actionCode: item.code,
      actionName: item.name,
      imageUrl: item.imageUrl // Cho expression preview
    };
    setButtonConfigs(prev => ({ ...prev, [selectedButton]: config }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      // 1. Lấy Account ID từ Token
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error("Chưa đăng nhập");
      const decoded: any = jwtDecode(token);
      const accountId = decoded.sub || decoded.id || decoded.userId;

      // 2. Lọc các nút đã cấu hình
      const configs = Object.values(buttonConfigs).filter(Boolean) as any[];
      if (configs.length === 0) {
        Alert.alert("Lỗi", "Chưa có nút nào được cấu hình");
        setIsSaving(false); return;
      }

      // 3. Loop và gọi API tạo từng nút
      // Lưu ý: Backend API của bạn là createJoystick (POST), 
      // nếu logic backend tự đè cái cũ thì ổn, nếu không cần gọi delete hoặc update.
      // Ở đây giả định create sẽ override hoặc user chấp nhận tạo mới.
      for (const config of configs) {
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

            skillId: null,
            skillCode: null,
            skillName: null,
        };
        await createJoystickMutation.mutateAsync(payload);
      }

      Alert.alert("Thành công", "Đã lưu cấu hình Joystick!");
      onSuccess?.();
      onClose();
    } catch (e) {
      Alert.alert("Lỗi", "Có lỗi xảy ra khi lưu.");
      console.error(e);
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
    const isSelected = buttonConfigs[selectedButton]?.actionCode === item.code;
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
            {/* Left: Button Selector */}
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

            {/* Right: Data List */}
            <View style={styles.rightColumn}>
                <View style={styles.searchBar}>
                    <Search color="#94a3b8" size={20} />
                    <TextInput 
                        placeholder="Tìm kiếm..." style={styles.searchInput}
                        value={searchTerm} onChangeText={setSearchTerm} placeholderTextColor="#94a3b8"
                    />
                </View>

                {/* Tabs */}
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { width: '85%', height: '85%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', flexDirection: 'column' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  closeBtn: { padding: 8 },
  body: { flex: 1, flexDirection: 'row' },
  leftColumn: { width: '30%', padding: 16, borderRightWidth: 1, borderRightColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#f8fafc' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 20, color: '#475569' },
  controllerLayout: { flexDirection: 'row', flexWrap: 'wrap', width: 140, height: 140, justifyContent: 'center', alignContent: 'center', marginBottom: 20 },
  joyBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', margin: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  selectedJoyBtn: { borderWidth: 4, borderColor: '#1d4ed8', transform: [{ scale: 1.1 }] },
  joyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  assignedBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#22c55e', borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#fff' },
  infoBox: { width: '100%', backgroundColor: '#eff6ff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#bfdbfe', marginBottom: 20, alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: '#1e40af', textAlign: 'center' },
  infoType: { fontSize: 10, color: '#64748b', marginTop: 2, fontWeight: '600' },
  saveButton: { flexDirection: 'row', backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  rightColumn: { flex: 1, padding: 16, backgroundColor: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, paddingHorizontal: 12, height: 44, marginBottom: 12 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0f172a' },
  tabContainer: { maxHeight: 50, marginBottom: 12 },
  tabButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8, backgroundColor: '#f1f5f9', height: 36 },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  activeTabText: { color: '#fff' },
  listArea: { flex: 1 },
  gridItem: { flex: 1, margin: 6, backgroundColor: '#fff', borderRadius: 8, padding: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', aspectRatio: 1.2, elevation: 1 },
  selectedGridItem: { borderColor: '#3b82f6', backgroundColor: '#eff6ff', borderWidth: 2 },
  gridIconContainer: { marginBottom: 8, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  gridImage: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0' },
  gridIconText: { fontSize: 28 },
  gridLabel: { fontSize: 12, textAlign: 'center', color: '#334155', fontWeight: '500' },
  checkBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#22c55e', borderRadius: 10, padding: 2 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94a3b8', fontSize: 16 },
});