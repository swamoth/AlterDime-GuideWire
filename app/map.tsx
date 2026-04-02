// Map Trajectory Ping Screen (OpenStreetMap via Leaflet)
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { ArrowLeft, Navigation, ShieldAlert, Cpu } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../constants/theme';

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { padding: 0; margin: 0; background: #121212; }
        #map { height: 100vh; width: 100vw; background: #121212; }
        /* Minimal UI adjustments for CartoDB Dark tiles */
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out {
            filter: invert(100%);
        }
        .leaflet-control-attribution { display: none; } /* Clean UI */
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([20.5937, 78.9629], 5);
        
        // Using CartoDB Dark Matter tiles (No Referer blocking + Native Dark Theme)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: ''
        }).addTo(map);

        var glowLine = L.polyline([], {color: '#CBFF00', weight: 16, opacity: 0.15, smoothFactor: 1}).addTo(map);
        var polyline = L.polyline([], {color: '#FFFFFF', weight: 3, opacity: 1, smoothFactor: 1}).addTo(map);
        var marker = null;

        var customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div style='background-color:#CBFF00;width:18px;height:18px;border-radius:50%;border:3px solid #121212;box-shadow: 0 0 10px rgba(203,255,0,0.5);'></div>",
            iconSize: [18, 18],
            iconAnchor: [9, 9]
        });

        // Threat Zones Overlay
        // Mumbai flood zone
        L.circle([19.0760, 72.8777], {
            color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: 0.15, radius: 15000, weight: 2, dashArray: '5, 5'
        }).bindPopup("<b style='color:#0A84FF'>Critical Alert</b><br>Severe Flooding Zone").addTo(map);

        // Chennai flood zone
        L.circle([13.0827, 80.2707], {
            color: '#0A84FF', fillColor: '#0A84FF', fillOpacity: 0.15, radius: 12000, weight: 2, dashArray: '5, 5'
        }).bindPopup("<b style='color:#0A84FF'>Warning Alert</b><br>Moderate Flooding").addTo(map);

        // Delhi heat zone
        L.circle([28.6139, 77.2090], {
            color: '#FF9500', fillColor: '#FF9500', fillOpacity: 0.15, radius: 20000, weight: 2, dashArray: '5, 5'
        }).bindPopup("<b style='color:#FF9500'>Critical Alert</b><br>Extreme Heat Wave (45°C+)").addTo(map);

        // Handle incoming data
        function handleData(dataString) {
            try {
                var data = JSON.parse(dataString);
                if (data.type === 'updateLocation') {
                    var latlngs = data.locations;
                    if (latlngs.length > 0) {
                        glowLine.setLatLngs(latlngs);
                        polyline.setLatLngs(latlngs);
                        var latest = latlngs[latlngs.length - 1];
                        
                        if (!marker) {
                            marker = L.marker(latest, {icon: customIcon, zIndexOffset: 1000}).addTo(map);
                            map.setView(latest, 15);
                        } else {
                            marker.setLatLng(latest);
                        }
                    }
                } else if (data.type === 'centerMap') {
                    if (data.location) {
                       map.setView(data.location, 16, {animate: true});
                    }
                }
            } catch(e) {}
        }

        // Standard React Native WebView bridge
        document.addEventListener("message", function(event) { handleData(event.data); });
        window.addEventListener("message", function(event) { handleData(event.data); });
    </script>
</body>
</html>
`;

export default function MapPingScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const iframeRef = useRef<any>(null);
  const [locations, setLocations] = useState<Location.LocationObjectCoords[]>([]);
  const [isPinging, setIsPinging] = useState(false);
  const [pingInterval, setPingInterval] = useState(40000); // Default to 40 sec
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === 'granted');
      if (status === 'granted') {
        const currentLoc = await Location.getCurrentPositionAsync({});
        setLocations([currentLoc.coords]);
      }
    })();
  }, []);

  // Update WebView or IFrame when locations array changes
  useEffect(() => {
    if (locations.length > 0) {
      const mappedLocations = locations.map(l => [l.latitude, l.longitude]);
      
      if (Platform.OS === 'web') {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ 
            type: 'updateLocation', 
            locations: mappedLocations 
          }), '*');
        }
      } else if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          handleData(JSON.stringify({ 
            type: 'updateLocation', 
            locations: ${JSON.stringify(mappedLocations)} 
          }));
          true;
        `);
      }
    }
  }, [locations]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPinging && hasPermission) {
      interval = setInterval(async () => {
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setLocations((prev) => [...prev, loc.coords]);
        } catch (error) {
          console.warn('Failed to ping GPS:', error);
        }
      }, pingInterval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPinging, hasPermission, pingInterval]);

  const togglePinging = () => {
    if (!hasPermission) {
      Alert.alert("Permission Denied", "GPS location permission is required.");
      return;
    }
    setIsPinging(!isPinging);
  };

  const centerMap = () => {
    if (locations.length > 0) {
      const latest = locations[locations.length - 1];
      
      if (Platform.OS === 'web') {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ 
            type: 'centerMap', 
            location: [latest.latitude, latest.longitude] 
          }), '*');
        }
      } else if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          handleData(JSON.stringify({ 
            type: 'centerMap', 
            location: [${latest.latitude}, ${latest.longitude}] 
          }));
          true;
        `);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color={Colors.dark.textPrimary} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trajectory Tracker (OSM)</Text>
      </View>

      {/* Map Content */}
      <View style={styles.mapContainer}>
        {hasPermission === false ? (
          <View style={styles.noPermissionBox}>
            <ShieldAlert color={Colors.dark.red} size={48} />
            <Text style={styles.noPermissionText}>Location Access Denied</Text>
          </View>
        ) : Platform.OS === 'web' ? (
          <iframe
            ref={iframeRef}
            srcDoc={MAP_HTML}
            style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#121212' }}
          />
        ) : (
          <WebView
            ref={webViewRef}
            style={styles.map}
            originWhitelist={['*']}
            source={{ html: MAP_HTML }}
            scrollEnabled={false}
            bounces={false}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        )}

        {/* Floating Custom Location Button */}
        <TouchableOpacity style={styles.centerBtn} onPress={centerMap}>
          <Navigation color={Colors.dark.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      {/* Bottom Control Panel */}
      <View style={styles.controlPanel}>
        {/* Interval Selector */}
        <View style={styles.intervalWrapper}>
          <Text style={styles.intervalLabel}>PING RATE:</Text>
          <View style={styles.intervalRow}>
            {[10, 20, 30, 40].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={[styles.intervalBtn, pingInterval === sec * 1000 && styles.intervalBtnActive]}
                onPress={() => setPingInterval(sec * 1000)}
                disabled={isPinging}
              >
                <Text style={[styles.intervalText, pingInterval === sec * 1000 && styles.intervalTextActive]}>
                  {sec}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>PINGS RECORDED</Text>
            <Text style={styles.infoValue}>{locations.length}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.pingBtn, isPinging ? styles.pingBtnActive : {}]} 
          onPress={togglePinging}
        >
          <Cpu color={isPinging ? Colors.dark.background : Colors.dark.lime} size={24} />
          <Text style={[styles.pingBtnText, isPinging ? styles.pingBtnTextActive : {}]}>
            {isPinging ? 'STOP TRACKING' : `START ${pingInterval / 1000}s PING`}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>
          Powered by completely free OpenStreetMap. Leave this screen open to accurately plot points.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backBtn: { paddingRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark.textPrimary },
  mapContainer: { flex: 1, position: 'relative', overflow: 'hidden' },
  map: { width: '100%', height: '100%', backgroundColor: '#121212' },
  noPermissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  noPermissionText: { color: Colors.dark.red, fontSize: 16, fontWeight: '600' },
  centerBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: Colors.dark.card,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  controlPanel: {
    backgroundColor: Colors.dark.card,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    paddingBottom: 40,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  infoBox: { flex: 1 },
  infoLabel: { fontSize: 10, color: Colors.dark.textTertiary, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, color: Colors.dark.textPrimary, fontWeight: '800', marginTop: 4 },
  
  intervalWrapper: { marginBottom: 20 },
  intervalLabel: { fontSize: 10, color: Colors.dark.textTertiary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  intervalRow: { flexDirection: 'row', gap: 8 },
  intervalBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.dark.border, alignItems: 'center' },
  intervalBtnActive: { backgroundColor: Colors.dark.elevated, borderColor: Colors.dark.lime },
  intervalText: { fontSize: 12, fontWeight: '600', color: Colors.dark.textSecondary },
  intervalTextActive: { color: Colors.dark.lime, fontWeight: '800' },

  pingBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.elevated,
    padding: 16,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.dark.lime,
  },
  pingBtnActive: {
    backgroundColor: Colors.dark.lime,
  },
  pingBtnText: {
    color: Colors.dark.lime,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  pingBtnTextActive: {
    color: Colors.dark.background,
  },
  helperText: { marginTop: 12, fontSize: 11, color: Colors.dark.textTertiary, textAlign: 'center' },
});
