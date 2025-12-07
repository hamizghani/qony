"use client";

import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { AnalysisResult } from './ConsultantWhiteboard';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', padding: 30, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#1e3a8a', paddingBottom: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headerTitle: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  logo: { fontSize: 14, fontWeight: 'bold', color: '#1e3a8a' },
  slideTitle: { fontSize: 24, color: '#0f172a', marginBottom: 15, fontFamily: 'Helvetica-Bold' },
  text: { fontSize: 10, color: '#334155', lineHeight: 1.5, marginBottom: 5 },
  
  // Table Styles for Solutions
  table: { display: "flex", flexDirection: "column", marginTop: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", minHeight: 40, alignItems: 'center' },
  tableHeader: { backgroundColor: "#f1f5f9", height: 30 },
  cellPillar: { width: "20%", padding: 8, fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1e3a8a' },
  cellAction: { width: "35%", padding: 8, fontSize: 9, color: '#334155' },
  cellImpact: { width: "30%", padding: 8, fontSize: 9, color: '#059669', fontFamily: 'Helvetica-Bold' },
  cellDifficulty: { width: "15%", padding: 8, fontSize: 9, textAlign: 'center', color: '#64748b' },

  // Footer
  footer: { position: 'absolute', bottom: 20, left: 30, right: 30, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  pageNumber: { fontSize: 8, color: '#94a3b8' },
});

// Helper Components
const SlideHeader = ({ title, sub }: { title: string, sub: string }) => (
  <View>
    <View style={styles.header}>
      <Text style={styles.logo}>AI CONSULTANT</Text>
      <Text style={styles.headerTitle}>{sub}</Text>
    </View>
    <Text style={styles.slideTitle}>{title}</Text>
  </View>
);

const SlideFooter = ({ page }: { page: number }) => (
  <View style={styles.footer}>
    <Text style={styles.pageNumber}>Confidential - Internal Use Only</Text>
    <Text style={styles.pageNumber}>Page {page}</Text>
  </View>
);

export default function ConsultantDeckPDF({ data }: { data: AnalysisResult }) {
  return (
    <Document>
      {/* SLIDE 1: COVER */}
      <Page size="A4" orientation="landscape" style={[styles.page, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1e3a8a' }]}>
        <View style={{ width: '80%', alignItems: 'center' }}>
          <Text style={{ fontSize: 36, color: 'white', fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 20 }}>
            {data.diagram_title || "Strategic Analysis"}
          </Text>
          <Text style={{ fontSize: 14, color: '#93c5fd', marginBottom: 50 }}>
            Automated Logic & Issue Tree Analysis
          </Text>
          <View style={{ width: 100, height: 2, backgroundColor: 'white', marginBottom: 20 }} />
          <Text style={{ fontSize: 10, color: '#e0f2fe' }}>{new Date().toLocaleDateString()}</Text>
        </View>
      </Page>

      {/* SLIDE 2: EXECUTIVE SUMMARY */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <SlideHeader title="Executive Summary" sub="Situation & Hypothesis" />
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Core Problem</Text>
          <View style={{ backgroundColor: '#fef2f2', padding: 10, borderRadius: 4, borderLeftWidth: 4, borderLeftColor: '#ef4444' }}>
            <Text style={{ fontSize: 11, color: '#7f1d1d' }}>{data.core_problem}</Text>
          </View>
        </View>
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Strategic Hypothesis</Text>
          <View style={{ backgroundColor: '#f1f5f9', padding: 10, borderRadius: 4, borderLeftWidth: 4, borderLeftColor: '#1e3a8a' }}>
            <Text style={{ fontSize: 12, color: '#1e3a8a', fontFamily: 'Helvetica-Bold' }}>{data.hypothesis}</Text>
          </View>
        </View>
        <SlideFooter page={2} />
      </Page>

      {/* SLIDE 3: PILLARS */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <SlideHeader title="Strategic Pillars" sub="Detailed Breakdown" />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          {data.analysis_pillars.map((pillar, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: '#f8fafc', padding: 10, borderRadius: 4, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e3a8a', marginBottom: 5 }}>{pillar.category}</Text>
              <Text style={{ fontSize: 9, fontStyle: 'italic', marginBottom: 8, color: '#64748b' }}>{pillar.goal}</Text>
              {pillar.key_findings.map((finding, idx) => (
                <Text key={idx} style={{ fontSize: 9, marginBottom: 3, color: '#475569' }}>• {finding}</Text>
              ))}
            </View>
          ))}
        </View>
        <SlideFooter page={3} />
      </Page>

      {/* SLIDE 4: SOLUTIONS ROADMAP (NEW) */}
      <Page size="A4" orientation="landscape" style={styles.page}>
        <SlideHeader title="Implementation Roadmap" sub="Recommended Solutions" />
        
        <Text style={{ fontSize: 10, color: '#64748b', marginBottom: 10 }}>
            The following initiatives are recommended to achieve the projected impact.
        </Text>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.cellPillar}>Workstream</Text>
            <Text style={styles.cellAction}>Initiative & Description</Text>
            <Text style={styles.cellImpact}>Projected Impact</Text>
            <Text style={styles.cellDifficulty}>Difficulty</Text>
          </View>

          {/* Table Body */}
          {data.analysis_pillars.flatMap(pillar => 
            (pillar.initiatives || []).map((init, index) => (
              <View key={`${pillar.category}-${index}`} style={styles.tableRow}>
                <Text style={styles.cellPillar}>{pillar.category}</Text>
                <View style={styles.cellAction}>
                    <Text style={{fontFamily: 'Helvetica-Bold', fontSize: 9}}>{init.title}</Text>
                    <Text style={{fontSize: 8, color: '#64748b'}}>{init.description}</Text>
                </View>
                <Text style={styles.cellImpact}>{init.impact}</Text>
                <Text style={styles.cellDifficulty}>{init.difficulty}</Text>
              </View>
            ))
          )}
        </View>

        <SlideFooter page={4} />
      </Page>
    </Document>
  );
}