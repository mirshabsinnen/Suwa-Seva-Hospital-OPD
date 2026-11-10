import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { EmptyState, number, palette } from './HIOUI';

const colors = [palette.teal, palette.blue, palette.sky, '#6b80c7', '#18a687', '#c58332'];
const shortDate = date => `${Number(date.slice(8))}/${Number(date.slice(5, 7))}`;
export function LineChart({ data = [] }) {
  const [width, setWidth] = useState(280);
  if (!data.some(item => item.count > 0)) return <EmptyState title="No appointments in this period" description="The trend will appear when appointments are recorded." icon="analytics-outline" />;
  const left = 30, right = width - 14, top = 15, bottom = 150;
  const max = Math.max(1, ...data.map(d => d.count));
  const x = i => left + i * (right - left) / Math.max(data.length - 1, 1);
  const y = value => bottom - value / max * (bottom - top);
  const ticks = [...new Set([0, Math.ceil(max / 2), max])];
  const labelEvery = Math.max(1, Math.ceil((data.length - 1) / 4));
  return <View onLayout={e => setWidth(Math.max(120, e.nativeEvent.layout.width))} accessible accessibilityLabel={`Appointment trend. ${data.map(d => `${d.date}: ${d.count}`).join('. ')}`}>
    <Svg width="100%" height={185} viewBox={`0 0 ${width} 185`}>
      {ticks.map(t => <React.Fragment key={t}><Line x1={left} x2={right} y1={y(t)} y2={y(t)} stroke="#e3eaf2" strokeDasharray="3 3" />
        <SvgText x={left - 7} y={y(t) + 4} textAnchor="end" fontSize={10} fill={palette.muted}>{t}</SvgText></React.Fragment>)}
      <Polyline points={data.map((d, i) => `${x(i)},${y(d.count)}`).join(' ')} fill="none" stroke={palette.teal} strokeWidth={2.5} />
      {data.map((d, i) => <React.Fragment key={d.date}><Circle cx={x(i)} cy={y(d.count)} r={data.length > 10 ? 2 : 3.5} fill={palette.blue} />
        {i % labelEvery === 0 || i === data.length - 1 ? <SvgText x={x(i)} y={174} textAnchor="middle" fontSize={10} fill={palette.muted}>{shortDate(d.date)}</SvgText> : null}</React.Fragment>)}
    </Svg>
  </View>;
}
export function BarChart({ data = [] }) {
  const [width, setWidth] = useState(280);
  if (!data.some(item => item.value > 0)) return <EmptyState title="No status records yet" icon="bar-chart-outline" />;
  const max = Math.max(1, ...data.map(d => d.value));
  const band = (width - 30) / Math.max(data.length, 1);
  const bottom = 145;
  return <View onLayout={e => setWidth(Math.max(120, e.nativeEvent.layout.width))} accessible accessibilityLabel={data.map(d => `${d.label}: ${d.value}`).join('. ')}>
    <Svg width="100%" height={190} viewBox={`0 0 ${width} 190`}>
      <Line x1={25} x2={width} y1={bottom} y2={bottom} stroke={palette.border} />
      {[0, max].map(t => <SvgText key={t} x={20} y={bottom - t / max * 110 + 4} textAnchor="end" fontSize={10} fill={palette.muted}>{t}</SvgText>)}
      {data.map((d, i) => {
        const height = d.value / max * 110;
        return <React.Fragment key={d.label}><Rect x={30 + i * band + band * 0.18} y={bottom - height} width={band * 0.64} height={height} rx={3} fill={d.color || colors[i % colors.length]} />
          <SvgText x={30 + (i + 0.5) * band} y={bottom - height - 6} textAnchor="middle" fontSize={10} fill={palette.ink}>{number(d.value)}</SvgText>
          <SvgText x={30 + (i + 0.5) * band} y={165} textAnchor="middle" fontSize={9} fill={palette.muted}>{d.label}</SvgText></React.Fragment>;
      })}
    </Svg>
  </View>;
}
export function DonutChart({ data = [] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (!total) return <EmptyState title="No active checked-in patients" description="Routine, priority and emergency cases will appear here." icon="pie-chart-outline" />;
  const radius = 53, length = 2 * Math.PI * radius;
  let offset = 0;
  return <View style={styles.donutRow}>
    <Svg width={156} height={156} viewBox="0 0 156 156" accessible accessibilityLabel={`${total} active checked-in patients`}>
      <Circle cx={78} cy={78} r={radius} fill="none" stroke={palette.panel} strokeWidth={19} />
      {data.filter(d => d.value > 0).map((d, i) => {
        const segment = length * d.value / total, start = offset; offset += segment;
        return <Circle key={d.label} cx={78} cy={78} r={radius} fill="none" stroke={d.color || colors[i]} strokeWidth={19}
          strokeDasharray={`${segment} ${length - segment}`} strokeDashoffset={-start} rotation={-90} origin="78,78" />;
      })}
      <SvgText x={78} y={78} textAnchor="middle" fontSize={25} fontWeight="bold" fill={palette.ink}>{total}</SvgText>
      <SvgText x={78} y={96} textAnchor="middle" fontSize={10} fill={palette.muted}>ACTIVE</SvgText>
    </Svg>
    <View style={{ flexShrink: 1, gap: 14 }}>{data.map((d, i) => <View key={d.label} style={styles.legend}>
      <View style={[styles.dot, { backgroundColor: d.color || colors[i] }]} /><Text style={styles.legendText}>{d.label} · {number(d.value)}</Text></View>)}</View>
  </View>;
}
const styles = StyleSheet.create({ donutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 }, dot: { width: 7, height: 7, borderRadius: 4 }, legendText: { color: palette.muted, fontSize: 12 } });
