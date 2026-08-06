import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { BrandLogo } from "./brand-logo";

export function ProgressHeader({ back = false }: { back?: boolean }) {
  return <View style={s.header}>{back ? <Pressable onPress={() => router.back()} style={s.headerButton}><MaterialIcons name="arrow-back-ios-new" size={22} color="#0C2B6A" /></Pressable> : <View style={s.headerButton}><MaterialIcons name="menu" size={25} color="#0C2B6A" /></View>}<BrandLogo size={54} /><View style={s.headerButton}><MaterialIcons name="notifications-none" size={27} color="#0C2B6A" /><View style={s.dot}><Text style={s.dotText}>3</Text></View></View></View>;
}

export function ProgressNav() {
  const items = [
    ["home", "Accueil", "/(tabs)/subjects"], ["menu-book", "Cours", "/(tabs)/subjects"],
    ["bar-chart", "Progrès", "/progress-overview"], ["person-outline", "Profil", "/(tabs)/profile"],
  ] as const;
  return <View style={s.nav}>{items.map(([icon,label,path]) => <Pressable key={label} onPress={() => router.push(path)} style={s.navItem}><MaterialIcons name={icon} size={25} color={label === "Progrès" ? "#159B32" : "#41557B"}/><Text style={[s.navText,label === "Progrès" && s.active]}>{label}</Text></Pressable>)}</View>;
}

export function ProgressState({ loading, error, onRetry }: { loading: boolean; error: boolean; onRetry: () => void }) {
  if (loading) return <View style={s.state}><ActivityIndicator color="#159B32" size="large"/><Text style={s.stateText}>Chargement de tes progrès…</Text></View>;
  if (!error) return null;
  return <View style={s.state}><MaterialIcons name="cloud-off" size={42} color="#6B7892"/><Text style={s.stateTitle}>Progression indisponible</Text><Pressable onPress={onRetry} style={s.retry}><Text style={s.retryText}>Réessayer</Text></Pressable></View>;
}

export function percent(value?: number) { return Math.max(0, Math.min(100, Number(value) || 0)); }

const s = StyleSheet.create({
  header:{height:72,flexDirection:"row",alignItems:"center",justifyContent:"space-between",paddingHorizontal:18},headerButton:{width:46,height:46,alignItems:"center",justifyContent:"center"},dot:{position:"absolute",right:2,top:3,backgroundColor:"#EF2929",borderRadius:9,minWidth:18,height:18,alignItems:"center",justifyContent:"center"},dotText:{color:"white",fontSize:10,fontWeight:"900"},
  nav:{height:76,backgroundColor:"#FFF",borderTopColor:"#E5EAF2",borderTopWidth:1,flexDirection:"row",paddingBottom:6},navItem:{flex:1,alignItems:"center",justifyContent:"center",gap:3},navText:{fontSize:11,color:"#41557B",fontWeight:"700"},active:{color:"#159B32",fontWeight:"900"},
  state:{flex:1,minHeight:300,alignItems:"center",justifyContent:"center",gap:12,padding:30},stateText:{color:"#64718B",fontWeight:"700"},stateTitle:{color:"#102553",fontSize:18,fontWeight:"900"},retry:{backgroundColor:"#174A9B",borderRadius:14,paddingHorizontal:22,paddingVertical:12},retryText:{color:"white",fontWeight:"900"},
});
