import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import hioApi from '../../services/hioApi';
import useHioResource from './useHioResource';

export function useHioFacility() {
  const [hospitalId, setHospital] = useState('');
  const [opdId, setOpd] = useState('');
  return { hospitalId, opdId, params: { hospitalId: hospitalId || undefined, opdId: opdId || undefined },
    selectHospital: id => { setHospital(id); setOpd(''); }, selectOpd: setOpd };
}
export default function HIOFacilityFilter({ facility, onChange }) {
  const resource = useHioResource(useCallback(signal => hioApi.facilities({ signal }), []));
  const [choosing, setChoosing] = useState(null);
  const hospitals = resource.data?.hospitals || [];
  const opds = (resource.data?.opds || []).filter(item => item.hospitalId === facility.hospitalId);
  const hospital = hospitals.find(item => item._id === facility.hospitalId)?.name || 'All Hospitals';
  const opd = opds.find(item => item._id === facility.opdId)?.name || 'All OPDs';
  const choose = id => {
    if (choosing === 'hospital') facility.selectHospital(id); else facility.selectOpd(id);
    setChoosing(null); onChange?.();
  };
  return <View style={s.card}>
    <Text style={s.title}>Hospital / OPD</Text>
    {resource.loading ? <Text>Loading facilities...</Text> : null}
    {resource.error ? <><Text accessibilityRole="alert">{resource.error}</Text><TouchableOpacity accessibilityRole="button" onPress={resource.refresh}><Text style={s.text}>Retry facilities</Text></TouchableOpacity></> : null}
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Hospital: ${hospital}`} disabled={resource.loading || !!resource.error} style={s.button} onPress={() => setChoosing('hospital')}><Text style={s.text}>{hospital} ▾</Text></TouchableOpacity>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={`OPD: ${opd}`} accessibilityState={{ disabled: !facility.hospitalId }} disabled={!facility.hospitalId || resource.loading || !!resource.error} style={[s.button, !facility.hospitalId && { opacity: 0.5 }]} onPress={() => setChoosing('opd')}><Text style={s.text}>{opd} ▾</Text></TouchableOpacity>
    <Modal visible={choosing !== null} transparent animationType="fade" onRequestClose={() => setChoosing(null)}>
      <View style={s.overlay}><View style={s.dialog} accessibilityViewIsModal>
        <Text accessibilityRole="header" style={s.title}>{choosing === 'hospital' ? 'Select Hospital' : 'Select OPD'}</Text>
        <ScrollView><TouchableOpacity accessibilityRole="button" style={s.button} onPress={() => choose('')}><Text style={s.text}>{choosing === 'hospital' ? 'All Hospitals' : 'All OPDs'}</Text></TouchableOpacity>
          {(choosing === 'hospital' ? hospitals : opds).map(item => <TouchableOpacity accessibilityRole="button" key={item._id} style={s.button} onPress={() => choose(item._id)}><Text style={s.text}>{item.name}</Text></TouchableOpacity>)}
          {choosing === 'opd' && !opds.length ? <Text>No OPDs recorded for this hospital.</Text> : null}
        </ScrollView>
        <TouchableOpacity accessibilityRole="button" style={s.button} onPress={() => setChoosing(null)}><Text style={s.text}>Cancel</Text></TouchableOpacity>
      </View></View>
    </Modal>
  </View>;
}
const s = StyleSheet.create({ card: { padding: 14, borderWidth: 1, borderColor: '#E3EAEF', borderRadius: 16, backgroundColor: '#fff', marginBottom: 14 },
  title: { color: '#005A71', fontWeight: '700', fontSize: 15, marginBottom: 8 }, text: { color: '#005A71', fontSize: 14 },
  button: { padding: 13, backgroundColor: '#EEF4F8', borderRadius: 9, marginVertical: 4 },
  overlay: { flex: 1, backgroundColor: '#0008', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 440, maxHeight: '80%' } });
