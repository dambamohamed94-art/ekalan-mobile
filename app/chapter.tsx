import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "../components/brand-logo";
import { DataState } from "../components/data-state";
import { getErrorMessage } from "../src/api/errorMessage";
import { goBackOrReplace } from "../src/navigation/goBackOrReplace";
import { getStudentChapter } from "../src/services/learningService";
import { colors } from "../src/theme/colors";

export default function ChapterPage() {
  const { subject, chapter } = useLocalSearchParams<{ subject: string; chapter: string }>();
  const [loading, setLoading] = useState(true);
  const [chapterData, setChapterData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setLoading(true); setError(null);
    getStudentChapter(subject, chapter)
      .then(setChapterData)
      .catch((err: unknown) => setError(getErrorMessage(err, "Impossible de charger ce chapitre.")))
      .finally(() => setLoading(false));
  }, [subject, chapter, reloadKey]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.loadingText}>Chargement du chapitre...</Text></View>;
  if (error) return <View style={styles.center}><DataState title="Chargement impossible" message={error} onRetry={() => setReloadKey(v => v + 1)} /></View>;

  const lessons = chapterData?.lessons ?? [];
  const accent = getAccent(subject);
  return (
    <FlatList
      contentContainerStyle={styles.content}
      data={lessons}
      keyExtractor={(lesson, index) => String(lesson.id || index)}
      ListHeaderComponent={<>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Retour à la matière" accessibilityRole="button" onPress={() => goBackOrReplace({ pathname: "/subject", params: { subject } })} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={26} color={colors.primary} />
        </Pressable>
        <BrandLogo style={styles.logo} />
      </View>

      <View style={[styles.hero, { backgroundColor: accent }]}>
        <View style={styles.heroGlow} />
        <View style={styles.heroCopy}>
          <Text style={styles.title}>{chapterData?.title || "Chapitre"}</Text>
          <View style={styles.lessonBadge}><Text style={styles.lessonBadgeText}>{lessons.length} leçon{lessons.length > 1 ? "s" : ""}</Text></View>
          <View style={styles.heroStats}>
            <Text style={styles.heroStat}>📖 {lessons.length} leçons</Text>
            <Text style={styles.heroStat}>🎯 {getProgress(chapterData)}%</Text>
          </View>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${getProgress(chapterData)}%` }]} /></View>
        </View>
        <View style={styles.heroIcon}><MaterialIcons name={getChapterIcon(subject)} size={70} color="#FFFFFF" /></View>
      </View>

      <Text style={styles.sectionTitle}>Leçons</Text>
      {!lessons.length ? <DataState title="Chapitre vide" message="Les leçons apparaîtront ici dès leur publication." onRetry={() => setReloadKey(v => v + 1)} /> : null}
      </>}
      renderItem={({ item: lesson, index }) => {
        const progress = getProgress(lesson);
        return <Pressable accessibilityLabel={`Ouvrir la leçon ${lesson.title || index + 1}`} accessibilityRole="button" style={styles.itemCard} onPress={() => router.push({ pathname: "/lesson", params: { subject, chapter, index: String(index), lesson: String(lesson.id ?? "") } })}>
          <View style={[styles.itemVisual, { backgroundColor: `${accent}14` }]}><MaterialIcons name={getLessonIcon(index)} size={37} color={accent} /></View>
          <View style={styles.numberBadge}><Text style={[styles.numberText, { color: accent }]}>{index + 1}</Text></View>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{lesson.title}</Text><Text style={styles.itemMeta}>Leçon {index + 1}</Text>
            <View style={styles.itemProgressRow}><View style={styles.itemTrack}><View style={[styles.itemFill, { width: `${progress}%`, backgroundColor: accent }]} /></View><Text style={[styles.progressText, { color: accent }]}>{progress}%</Text></View>
          </View>
          <View style={[styles.arrowCircle, { backgroundColor: `${accent}12` }]}><MaterialIcons name="chevron-right" size={27} color={accent} /></View>
        </Pressable>;
      }}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      style={styles.container}
      windowSize={7}
    />
  );
}

function getProgress(value: any) { const raw = value?.progress_percent ?? value?.progress ?? value?.completion_percentage ?? 0; const n = Number(raw); return Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0; }
function getAccent(subject: string) { const key = String(subject).toLowerCase(); if (key.includes("fran")) return "#F97316"; if (key.includes("anglais")) return "#3563E9"; if (key.includes("histoire") || key.includes("geo")) return "#16A34A"; if (key.includes("science")) return "#0891B2"; return colors.primary; }
function getChapterIcon(subject: string): React.ComponentProps<typeof MaterialIcons>["name"] { return String(subject).toLowerCase().includes("math") ? "calculate" : "menu-book"; }
function getLessonIcon(index: number): React.ComponentProps<typeof MaterialIcons>["name"] { return (["auto-stories", "filter-2", "checklist", "add-circle", "calculate"] as const)[index % 5]; }

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:"#F7F9FD"},content:{padding:20,paddingBottom:120},center:{flex:1,backgroundColor:"#F7F9FD",alignItems:"center",justifyContent:"center",padding:22},loadingText:{marginTop:12,color:"#64748B",fontWeight:"800"},
  header:{marginTop:38,alignItems:"center",justifyContent:"center"},backButton:{position:"absolute",left:0,width:54,height:54,borderRadius:18,backgroundColor:"#FFF",alignItems:"center",justifyContent:"center",elevation:4},logo:{width:58,height:58},
  hero:{marginTop:28,borderRadius:30,padding:25,minHeight:250,overflow:"hidden",flexDirection:"row",alignItems:"center"},heroGlow:{position:"absolute",right:-55,top:-55,width:220,height:220,borderRadius:110,backgroundColor:"rgba(74,222,128,.13)"},heroCopy:{flex:1,zIndex:2},title:{color:"#FFF",fontSize:31,fontWeight:"900",lineHeight:36},lessonBadge:{alignSelf:"flex-start",marginTop:16,paddingHorizontal:14,paddingVertical:8,borderRadius:18,backgroundColor:"rgba(255,255,255,.14)"},lessonBadgeText:{color:"#FFF",fontWeight:"900"},heroStats:{flexDirection:"row",gap:16,marginTop:22},heroStat:{color:"#FFF",fontWeight:"800",fontSize:12},progressTrack:{height:7,borderRadius:6,backgroundColor:"rgba(255,255,255,.2)",marginTop:18,overflow:"hidden"},progressFill:{height:"100%",borderRadius:6,backgroundColor:"#61E6A7"},heroIcon:{width:105,alignItems:"center",justifyContent:"center"},
  sectionTitle:{marginTop:28,marginBottom:4,fontSize:25,fontWeight:"900",color:"#0F1D3A"},itemCard:{marginTop:14,minHeight:138,backgroundColor:"#FFF",borderRadius:26,padding:15,flexDirection:"row",alignItems:"center",gap:11,shadowColor:"#8FA5C4",shadowOffset:{width:0,height:8},shadowOpacity:.13,shadowRadius:15,elevation:4},itemVisual:{width:66,height:78,borderRadius:20,alignItems:"center",justifyContent:"center"},numberBadge:{width:36,height:44,borderRadius:16,backgroundColor:"#F0F5FD",alignItems:"center",justifyContent:"center"},numberText:{fontSize:19,fontWeight:"900"},itemContent:{flex:1},itemTitle:{fontSize:17,fontWeight:"900",color:"#0F1D3A"},itemMeta:{marginTop:4,color:"#64748B",fontWeight:"700"},itemProgressRow:{flexDirection:"row",alignItems:"center",gap:8,marginTop:12},itemTrack:{flex:1,height:7,borderRadius:5,backgroundColor:"#E5EAF2",overflow:"hidden"},itemFill:{height:"100%",borderRadius:5},progressText:{fontSize:11,fontWeight:"900"},arrowCircle:{width:39,height:39,borderRadius:20,alignItems:"center",justifyContent:"center"}
});
