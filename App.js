import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Image,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from './theme';
import { CATEGORIES, INITIAL_ACTIVITIES, DEMO_CERTIFICATES, calculateStats } from './utils';

const STORAGE_KEYS = {
  IS_LOGGED_IN: '@ap_tracker:is_logged_in',
  ACTIVITIES: '@ap_tracker:activities',
};

export default function App() {
  // Navigation & Session State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [currentScreen, setCurrentScreen] = useState('dashboard'); // dashboard, activities, scanner, profile

  // Focus states for input fields
  const [isUserFocused, setIsUserFocused] = useState(false);
  const [isPassFocused, setIsPassFocused] = useState(false);

  // App Core Data State
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ totalPoints: 0, pendingCount: 0, activitiesCount: 0, chartPoints: {} });
  
  // UI Interactions
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Scanner States
  const [scannerMode, setScannerMode] = useState('upload'); // upload, scanning, review
  const [scannedImage, setScannedImage] = useState(null);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(-1);
  const [reviewForm, setReviewForm] = useState({
    title: '',
    category: 'nss_clubs',
    detail: '',
    date: '',
    points: 10,
  });

  // Animated values for laser scanner
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanAnimLoop = useRef(null);

  // Initialize App Data
  useEffect(() => {
    loadSession();
    loadActivities();
  }, []);

  // Recalculate stats when activities change
  useEffect(() => {
    if (activities.length > 0) {
      const computed = calculateStats(activities);
      setStats(computed);
      saveActivities(activities);
    }
  }, [activities]);

  // Global verification timer countdown ticker
  useEffect(() => {
    const hasVerifying = activities.some(a => a.status === 'Verifying');
    if (!hasVerifying) return;

    const interval = setInterval(() => {
      setActivities(prev => {
        let updated = false;
        const next = prev.map(act => {
          if (act.status === 'Verifying') {
            updated = true;
            const nextTime = (act.verificationTimeLeft || 30) - 1;
            if (nextTime <= 0) {
              // Automatically approve the activity when timer hits 0
              return { ...act, status: 'Approved', verificationTimeLeft: undefined };
            }
            return { ...act, verificationTimeLeft: nextTime };
          }
          return act;
        });
        return updated ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activities]);

  const loadSession = async () => {
    try {
      const logged = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      if (logged === 'true') {
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.log('Error loading session', e);
    }
  };

  const loadActivities = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (stored) {
        // Reset any verifying tasks from past sessions to Approved to avoid getting stuck
        const parsed = JSON.parse(stored).map(a => 
          a.status === 'Verifying' ? { ...a, status: 'Approved', verificationTimeLeft: undefined } : a
        );
        setActivities(parsed);
      } else {
        setActivities(INITIAL_ACTIVITIES);
      }
    } catch (e) {
      console.log('Error loading activities', e);
    }
  };

  const saveActivities = async (newActivities) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(newActivities));
    } catch (e) {
      console.log('Error saving activities', e);
    }
  };

  // Login handler
  const handleLogin = async () => {
    if (username.trim() === 'Sahil' && password === 'Sahil') {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
        setIsLoggedIn(true);
        setLoginError('');
        setUsername('');
        setPassword('');
      } catch (e) {
        setLoginError('Session save failed');
      }
    } else {
      setLoginError('Invalid Username or Password');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
      setIsLoggedIn(false);
      setCurrentScreen('dashboard');
    } catch (e) {
      console.log('Error during logout', e);
    }
  };

  // Reset database state
  const handleResetData = () => {
    Alert.alert(
      "Reset Data",
      "Are you sure you want to restore the default activities (67 points)?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => {
            setActivities(INITIAL_ACTIVITIES);
            Alert.alert("Success", "Database reset to defaults.");
          }
        }
      ]
    );
  };

  // Image Picker for scanning
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera roll access is needed to upload certificates.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setScannedImage(result.assets[0].uri);
      const randIndex = Math.floor(Math.random() * DEMO_CERTIFICATES.length);
      startScanningSimulation(randIndex);
    }
  };

  // Camera Picker for scanning
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Camera access is needed to capture certificates.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setScannedImage(result.assets[0].uri);
      const randIndex = Math.floor(Math.random() * DEMO_CERTIFICATES.length);
      startScanningSimulation(randIndex);
    }
  };

  // Select Demo Certificate directly
  const selectDemoTemplate = (index) => {
    setSelectedDemoIndex(index);
    setScannedImage('demo');
  };

  // Trigger Scanning Effect
  const startScanningSimulation = (demoIndex) => {
    setScannerMode('scanning');
    
    // Start animation loop
    scanLineAnim.setValue(0);
    scanAnimLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ])
    );
    scanAnimLoop.current.start();

    // End scan after 3 seconds and review
    setTimeout(() => {
      if (scanAnimLoop.current) {
        scanAnimLoop.current.stop();
      }
      
      const template = DEMO_CERTIFICATES[demoIndex];
      setReviewForm({
        title: template.title,
        category: template.category,
        detail: template.detail,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        points: template.points,
      });
      setScannerMode('review');
    }, 3000);
  };

  // Submit new scanned activity
  const handleSubmitScanned = () => {
    if (!reviewForm.title.trim()) {
      Alert.alert("Error", "Please provide an activity title.");
      return;
    }

    const newActivity = {
      id: Date.now().toString(),
      title: reviewForm.title,
      category: reviewForm.category,
      detail: reviewForm.detail,
      date: reviewForm.date,
      points: Number(reviewForm.points),
      status: 'Verifying', // Submits to verifying status
      verificationTimeLeft: 30, // 30-second countdown
    };

    setActivities(prev => [newActivity, ...prev]);
    Alert.alert("Submitted", "Certificate submitted. Verification queue initiated (30s).");
    
    // Reset scanner
    setScannerMode('upload');
    setScannedImage(null);
    setSelectedDemoIndex(-1);
    setCurrentScreen('dashboard');
  };

  const approveActivity = (id) => {
    setActivities(prev => prev.map(act => {
      if (act.id === id) {
        return { ...act, status: 'Approved', verificationTimeLeft: undefined };
      }
      return act;
    }));
  };

  // Delete activity
  const deleteActivity = (id) => {
    Alert.alert(
      "Delete Activity",
      "Are you sure you want to remove this activity?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            setActivities(prev => prev.filter(act => act.id !== id));
            if (selectedActivity && selectedActivity.id === id) {
              setSelectedActivity(null);
            }
          }
        }
      ]
    );
  };

  // Filter & Search Logic
  const getFilteredActivities = () => {
    return activities.filter(act => {
      const matchSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.detail.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (filterCategory === 'All') return matchSearch;
      
      const catMapping = {
        'Community Service': 'nss_clubs',
        'Academic Seminars': 'other_activities',
        'Sports': 'health_activities'
      };
      
      return act.category === catMapping[filterCategory] && matchSearch;
    });
  };

  // Check if there are any actively verifying activities
  const verifyingActivity = activities.find(a => a.status === 'Verifying');

  // Login View
  const renderLogin = () => (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <ScrollView contentContainerStyle={styles.loginScroll}>
        <View style={styles.loginHeader}>
          <View style={styles.brutalistBorder}>
            <Text style={styles.loginLogo}>Activity Point Tracker</Text>
          </View>
          <Text style={styles.loginSublogo}>BMSCE PORTAL GATEWAY</Text>
        </View>

        <View style={styles.loginCard}>
          <Text style={[theme.typography.labelCaps, { color: theme.colors.textMuted, marginBottom: 8 }]}>
            SECURE ACCESS
          </Text>
          
          <Text style={styles.inputLabel}>STUDENT USERNAME</Text>
          <TextInput
            style={[
              styles.textInput,
              isUserFocused && { borderColor: theme.colors.borderActive }
            ]}
            placeholder="e.g. Sahil"
            placeholderTextColor={theme.colors.textDim}
            value={username}
            onChangeText={setUsername}
            onFocus={() => setIsUserFocused(true)}
            onBlur={() => setIsUserFocused(false)}
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>CREDENTIAL KEY (PASSWORD)</Text>
          <TextInput
            style={[
              styles.textInput,
              isPassFocused && { borderColor: theme.colors.borderActive }
            ]}
            placeholder="Password"
            placeholderTextColor={theme.colors.textDim}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setIsPassFocused(true)}
            onBlur={() => setIsPassFocused(false)}
            secureTextEntry
            autoCapitalize="none"
          />

          {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>INITIALIZE SESSION</Text>
          </TouchableOpacity>

          <View style={styles.loginHelpContainer}>
            <Text style={styles.loginHelpText}>DEMO USER: Sahil</Text>
            <Text style={styles.loginHelpText}>DEMO KEY: Sahil</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Tab views
  const renderDashboard = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Bento Grid Header */}
      <View style={styles.bentoSection}>
        <Text style={theme.typography.labelCaps}>BMS College of Engineering</Text>
        <Text style={styles.screenHeading}>Dashboard</Text>
      </View>

      {/* Main Metric Card */}
      <View style={styles.mainBentoCard}>
        <View style={styles.cardAccentGlow} />
        <View style={styles.mainBentoRow}>
          <View style={{ flex: 1 }}>
            <Text style={theme.typography.labelCaps}>TOTAL POINTS</Text>
            <View style={styles.pointsRow}>
              <Text style={styles.pointsHuge}>{stats.totalPoints}</Text>
              <Text style={styles.pointsGoalText}>/ 100 GOAL</Text>
            </View>
          </View>

          {/* Indigo Circular Progress */}
          <View style={styles.circularTracker}>
            <Text style={styles.trackerPercentage}>
              {Math.min(100, Math.round((stats.totalPoints / 100) * 100))}%
            </Text>
            <Text style={[theme.typography.labelCaps, { fontSize: 8, color: theme.colors.primary }]}>
              REACHED
            </Text>
          </View>
        </View>
      </View>

      {/* Secondary Metrics Bento Grid */}
      <View style={styles.bentoRow}>
        <View style={[styles.bentoHalfCard, { marginRight: 12 }]}>
          <Text style={theme.typography.labelCaps}>THIS YEAR</Text>
          <View style={styles.compactMetricRow}>
            <Text style={styles.metricBig}>
              {activities
                .filter(a => a.status === 'Approved' && (a.date.includes('2026') || a.date.includes('2025')))
                .reduce((sum, a) => sum + a.points, 0) || 67}
            </Text>
            <Text style={styles.metricSub}>TOTAL</Text>
          </View>
        </View>

        {/* Home page > activities bubble with 30s verification countdown */}
        <View style={styles.bentoHalfCard}>
          <Text style={theme.typography.labelCaps}>ACTIVITIES</Text>
          <View style={styles.compactMetricRow}>
            <View>
              <Text style={styles.metricBig}>{stats.activitiesCount}</Text>
              {verifyingActivity ? (
                <Text style={styles.countdownAlertText}>
                  VERIFYING: {verifyingActivity.verificationTimeLeft}s
                </Text>
              ) : (
                <Text style={styles.countdownAlertTextMuted}>
                  {stats.pendingCount} PENDING
                </Text>
              )}
            </View>
            <View style={[styles.pendingBadge, verifyingActivity && { backgroundColor: theme.colors.warningTint }]}>
              <Text style={[styles.pendingBadgeText, verifyingActivity && { color: theme.colors.warning }]}>
                {verifyingActivity ? 'WAITING' : 'SYNCED'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bar Chart Section */}
      <View style={styles.chartBentoCard}>
        <View style={styles.bentoHeaderRow}>
          <Text style={styles.bentoCardTitle}>POINTS BY CATEGORY</Text>
          <View style={styles.capsuleBadge}>
            <Text style={styles.capsuleBadgeText}>8 CATS</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          {Object.entries(stats.chartPoints).map(([key, value], index) => {
            const percentage = Math.min(100, Math.round((value / 40) * 100)); // Max points cap is ~40
            const barColor = theme.colors.chartColors[index % theme.colors.chartColors.length];
            return (
              <View key={key} style={styles.chartBarRow}>
                <Text style={styles.chartLabel} numberOfLines={1}>{key}</Text>
                <View style={styles.chartTrack}>
                  <View 
                    style={[
                      styles.chartFill, 
                      { width: `${Math.max(4, percentage)}%`, backgroundColor: barColor }
                    ]} 
                  />
                </View>
                <Text style={styles.chartValue}>{value}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.listBentoCard}>
        <View style={[styles.bentoHeaderRow, { marginBottom: 12 }]}>
          <Text style={styles.bentoCardTitle}>RECENT LEDGER RECORDS</Text>
          <TouchableOpacity onPress={() => setCurrentScreen('activities')}>
            <Text style={styles.textLink}>VIEW LEDGER</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recentList}>
          {activities.slice(0, 4).map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.recentItem}
              onPress={() => setSelectedActivity(item)}
            >
              <View style={[
                styles.itemIconBox,
                item.status === 'Approved' && { backgroundColor: theme.colors.successTint },
                item.status === 'Verifying' && { backgroundColor: theme.colors.warningTint }
              ]}>
                <MaterialIcons 
                  name={item.status === 'Approved' ? 'check-circle' : item.status === 'Verifying' ? 'hourglass-top' : 'hourglass-empty'} 
                  size={18} 
                  color={item.status === 'Approved' ? theme.colors.success : item.status === 'Verifying' ? theme.colors.warning : theme.colors.textMuted} 
                />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.recentItemTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.recentItemSub}>{item.date}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.recentItemPoints}>+{item.points}</Text>
                <Text style={[
                  styles.statusLabel,
                  item.status === 'Approved' && styles.approvedStatus,
                  item.status === 'Verifying' && styles.verifyingStatus,
                  item.status === 'Pending' && styles.pendingStatus
                ]}>
                  {item.status === 'Verifying' ? `VERIFYING (${item.verificationTimeLeft}s)` : item.status.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderActivities = () => (
    <View style={styles.tabContent}>
      <View style={styles.bentoSection}>
        <Text style={theme.typography.labelCaps}>Record Ledger</Text>
        <Text style={styles.screenHeading}>Activity Log</Text>
      </View>

      {/* Filter Chips Scroll */}
      <View style={styles.filtersScrollContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {['All', 'Community Service', 'Academic Seminars', 'Sports'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                filterCategory === cat && styles.filterChipActive
              ]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[
                styles.filterChipText,
                filterCategory === cat && styles.filterChipTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Input */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="SEARCH LEDGER ENTRIES..."
          placeholderTextColor={theme.colors.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
      </View>

      {/* Activities Ledger List */}
      <FlatList
        data={getFilteredActivities()}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 160 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.ledgerCard}
            onPress={() => setSelectedActivity(item)}
          >
            <View style={styles.ledgerHeader}>
              <Text style={styles.ledgerTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.ledgerPoints}>+{item.points} PTS</Text>
            </View>
            <View style={styles.ledgerFooter}>
              <View style={styles.ledgerMeta}>
                <MaterialIcons name="event" size={12} color={theme.colors.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.ledgerMetaText}>{item.date}</Text>
              </View>
              <Text style={[
                styles.statusLabelBorder,
                item.status === 'Approved' && styles.approvedBorder,
                item.status === 'Verifying' && styles.verifyingBorder,
                item.status === 'Pending' && styles.pendingBorder
              ]}>
                {item.status === 'Verifying' ? `VERIFYING (${item.verificationTimeLeft}s)` : item.status}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          setScannerMode('upload');
          setScannedImage(null);
          setSelectedDemoIndex(-1);
          setCurrentScreen('scanner');
        }}
      >
        <MaterialIcons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderScanner = () => {
    const translateY = scanLineAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 260]
    });

    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.bentoSection}>
          <Text style={theme.typography.labelCaps}>DOCUMENT INTEGRATOR</Text>
          <Text style={styles.screenHeading}>Scanner</Text>
        </View>

        {scannerMode === 'upload' && (
          <View style={styles.scannerWrapper}>
            {selectedDemoIndex !== -1 ? (
              /* Plain Bland White Certificate Mockup Preview */
              <View style={styles.certPreviewContainer}>
                <Text style={styles.certPreviewHeader}>CERTIFICATE PREVIEW</Text>
                
                <View style={styles.plainCertificateSheet}>
                  <Text style={styles.certOrgName}>{DEMO_CERTIFICATES[selectedDemoIndex].org.toUpperCase()}</Text>
                  <View style={styles.certDividerLine} />
                  <Text style={styles.certSubText}>This is to certify that</Text>
                  <Text style={styles.certStudentName}>SAHIL</Text>
                  <Text style={styles.certBodyText}>{DEMO_CERTIFICATES[selectedDemoIndex].desc}</Text>
                  
                  <View style={styles.certFooterRow}>
                    <View>
                      <Text style={styles.certFooterLabel}>DATE</Text>
                      <Text style={styles.certFooterVal}>{DEMO_CERTIFICATES[selectedDemoIndex].date}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.certFooterLabel}>CREDIT VALUE</Text>
                      <Text style={styles.certFooterVal}>{DEMO_CERTIFICATES[selectedDemoIndex].points} POINTS</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.previewActionRow}>
                  <TouchableOpacity 
                    style={styles.primaryButtonCompact}
                    onPress={() => startScanningSimulation(selectedDemoIndex)}
                  >
                    <Text style={styles.primaryButtonText}>SCAN DOCUMENT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.outlineBtnCompact}
                    onPress={() => setSelectedDemoIndex(-1)}
                  >
                    <Text style={styles.outlineBtnText}>CLEAR PREVIEW</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* Upload View */
              <View style={styles.viewfinderBox}>
                <MaterialIcons name="document-scanner" size={54} color={theme.colors.primary} />
                <Text style={styles.viewfinderTitle}>Integrate Certificate Document</Text>
                <Text style={styles.viewfinderSubtitle}>TAP TO BROWSE FILES OR OPEN CAMERA</Text>
                
                <View style={styles.viewfinderButtons}>
                  <TouchableOpacity style={styles.outlineBtn} onPress={pickImage}>
                    <Text style={styles.outlineBtnText}>CHOOSE FROM GALLERY</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.outlineBtn, { marginTop: 8 }]} onPress={takePhoto}>
                    <Text style={styles.outlineBtnText}>CAPTURE PHOTO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Demo Templates Selector */}
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>TEST PRESET CERTIFICATES</Text>
              <Text style={styles.demoSubtitle}>TAP TO PREVIEW AND SCAN DUMMY CREDENTIAL SHEETS</Text>
              
              <View style={styles.demoGrid}>
                {DEMO_CERTIFICATES.map((cert, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[
                      styles.demoChip,
                      selectedDemoIndex === index && { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryTint }
                    ]} 
                    onPress={() => selectDemoTemplate(index)}
                  >
                    <MaterialIcons 
                      name="insert-drive-file" 
                      size={14} 
                      color={selectedDemoIndex === index ? theme.colors.primary : theme.colors.textMuted} 
                      style={{ marginRight: 6 }} 
                    />
                    <Text style={[
                      styles.demoChipText,
                      selectedDemoIndex === index && { color: theme.colors.primary, fontWeight: '700' }
                    ]} numberOfLines={1}>
                      {cert.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {scannerMode === 'scanning' && (
          <View style={styles.scannerWrapper}>
            <View style={styles.scanningFrame}>
              <Animated.View style={[styles.laserScanLine, { transform: [{ translateY }] }]} />
              <MaterialIcons name="center-focus-strong" size={48} color={theme.colors.primary} />
              <Text style={styles.scanningLabel}>PROCESSING DOCUMENT STRUCTURE...</Text>
              <Text style={styles.scanningSublabel}>EXTRACTING CREDITS DATA WITH simulated AI OCR</Text>
            </View>
          </View>
        )}

        {scannerMode === 'review' && (
          <View style={styles.scannerWrapper}>
            <View style={styles.reviewCard}>
              <Text style={styles.reviewCardTitle}>REVIEW METADATA FIELDS</Text>
              <Text style={styles.reviewSubtitle}>CONFIRM AND ADJUST VALUES BEFORE ALLOCATING</Text>

              <Text style={styles.inputLabel}>ACTIVITY TITLE</Text>
              <TextInput
                style={styles.textInput}
                value={reviewForm.title}
                onChangeText={(text) => setReviewForm(prev => ({ ...prev, title: text }))}
              />

              <Text style={styles.inputLabel}>CATEGORY SOURCE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row' }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.formRadioChip,
                        reviewForm.category === cat.id && styles.formRadioChipActive
                      ]}
                      onPress={() => {
                        const matchingAct = cat.activities[0];
                        setReviewForm(prev => ({ 
                          ...prev, 
                          category: cat.id,
                          detail: matchingAct.name,
                          points: matchingAct.points 
                        }));
                      }}
                    >
                      <Text style={[
                        styles.formRadioChipText,
                        reviewForm.category === cat.id && styles.formRadioChipTextActive
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.inputLabel}>CRITERIA / ROLE DETAIL</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row' }}>
                  {(CATEGORIES.find(c => c.id === reviewForm.category)?.activities || []).map(act => (
                    <TouchableOpacity
                      key={act.name}
                      style={[
                        styles.formRadioChip,
                        reviewForm.detail === act.name && styles.formRadioChipActive
                      ]}
                      onPress={() => setReviewForm(prev => ({ ...prev, detail: act.name, points: act.points }))}
                    >
                      <Text style={[
                        styles.formRadioChipText,
                        reviewForm.detail === act.name && styles.formRadioChipTextActive
                      ]}>
                        {act.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 16 }}>
                  <Text style={styles.inputLabel}>DATE</Text>
                  <TextInput
                    style={styles.textInput}
                    value={reviewForm.date}
                    onChangeText={(text) => setReviewForm(prev => ({ ...prev, date: text }))}
                  />
                </View>
                <View style={{ width: 100 }}>
                  <Text style={styles.inputLabel}>POINTS</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={reviewForm.points.toString()}
                    onChangeText={(text) => setReviewForm(prev => ({ ...prev, points: text ? Number(text) : 0 }))}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitScanned}>
                <Text style={styles.primaryButtonText}>SUBMIT FOR VERIFICATION</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.outlineBtn, { marginTop: 12, borderColor: theme.colors.error }]} 
                onPress={() => setScannerMode('upload')}
              >
                <Text style={[styles.outlineBtnText, { color: theme.colors.error }]}>CANCEL SCAN</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderProfile = () => (
    <View style={styles.tabContent}>
      <View style={styles.bentoSection}>
        <Text style={theme.typography.labelCaps}>Account Gateway</Text>
        <Text style={styles.screenHeading}>Profile</Text>
      </View>

      <View style={styles.profileWrapper}>
        <View style={styles.avatarFrame}>
          <Image 
            style={styles.avatarImage} 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASk4Gs0bylSRPowhIhOCo-MKoiZe5Q9ZGlBtnHwefJIV-fm7W5GrDLIf-WGBCKjbzgRVBffZ7dW6OM0pB6TSI5jn4nHy-OrndjH_srmBK-Yn0BB6ybJtb5GuMB_5pvo4t7S-4pKp7xkV6_oERG_InLnMEyTWCoEVItFyNxRg0e4PDGfJ1Lz4sJNmlkVyW38MFAd237lVoNxH0eaRzJGWq7Nn2XmLckUhVkx-oEKOlA2kWwIS9tv4rCwMsf-8WCb0LnCLV2fk5Fkw' }} 
          />
        </View>

        <Text style={styles.profileName}>SAHIL</Text>
        <Text style={styles.profileUsn}>USN: 1BM22CS001</Text>
        <Text style={styles.profileDegree}>B.E. COMPUTER SCIENCE & ENGINEERING</Text>

        <View style={styles.profileDivider} />

        <Text style={styles.infoCardText}>BMS COLLEGE OF ENGINEERING - AICTE ACTIVITY POINTS</Text>
        <Text style={[styles.infoCardSub, { marginBottom: 24 }]}>Target: 100 points to qualify for degree completion.</Text>

        <TouchableOpacity style={styles.outlineBtn} onPress={handleResetData}>
          <Text style={styles.outlineBtnText}>RESET DATABASE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.primaryButton, { marginTop: 16, backgroundColor: theme.colors.errorContainer, borderColor: theme.colors.error }]} 
          onPress={handleLogout}
        >
          <Text style={[styles.primaryButtonText, { color: theme.colors.onErrorContainer }]}>LOGOUT SESSION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Main navigation switcher
  const renderMainContent = () => {
    switch (currentScreen) {
      case 'dashboard':
        return renderDashboard();
      case 'activities':
        return renderActivities();
      case 'scanner':
        return renderScanner();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  // Main Render Tree
  if (!isLoggedIn) {
    return renderLogin();
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Top App Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity Point Tracker</Text>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialIcons name="notifications" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Screen Canvas */}
      <View style={styles.canvas}>
        {renderMainContent()}
      </View>

      {/* Bottom Tab Navigation Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setCurrentScreen('dashboard')}
        >
          <MaterialIcons 
            name="dashboard" 
            size={24} 
            color={currentScreen === 'dashboard' ? theme.colors.primary : theme.colors.textMuted} 
          />
          <Text style={[
            styles.tabItemText, 
            currentScreen === 'dashboard' && styles.tabItemTextActive
          ]}>
            HOME
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setCurrentScreen('activities')}
        >
          <MaterialIcons 
            name="list-alt" 
            size={24} 
            color={currentScreen === 'activities' ? theme.colors.primary : theme.colors.textMuted} 
          />
          <Text style={[
            styles.tabItemText, 
            currentScreen === 'activities' && styles.tabItemTextActive
          ]}>
            LOG
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.scannerTabItem} 
          onPress={() => {
            setScannerMode('upload');
            setScannedImage(null);
            setSelectedDemoIndex(-1);
            setCurrentScreen('scanner');
          }}
        >
          <View style={styles.scannerIconWrapper}>
            <MaterialIcons 
              name="qr-code-scanner" 
              size={26} 
              color="#FFFFFF" 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setCurrentScreen('profile')}
        >
          <MaterialIcons 
            name="person" 
            size={24} 
            color={currentScreen === 'profile' ? theme.colors.primary : theme.colors.textMuted} 
          />
          <Text style={[
            styles.tabItemText, 
            currentScreen === 'profile' && styles.tabItemTextActive
          ]}>
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Activity Details Modal */}
      {selectedActivity && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!selectedActivity}
          onRequestClose={() => setSelectedActivity(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalLabel}>LEDGER RECORD</Text>
                <TouchableOpacity onPress={() => setSelectedActivity(null)}>
                  <MaterialIcons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalTitle}>{selectedActivity.title}</Text>
              
              <View style={styles.modalMetaCard}>
                <Text style={styles.metaLabel}>CATEGORY</Text>
                <Text style={styles.metaValue}>
                  {CATEGORIES.find(c => c.id === selectedActivity.category)?.name || selectedActivity.category}
                </Text>

                <Text style={styles.metaLabel}>CRITERIA</Text>
                <Text style={styles.metaValue}>{selectedActivity.detail}</Text>

                <View style={styles.metaRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.metaLabel}>DATE</Text>
                    <Text style={styles.metaValue}>{selectedActivity.date}</Text>
                  </View>
                  <View style={{ width: 100 }}>
                    <Text style={styles.metaLabel}>POINTS</Text>
                    <Text style={[styles.metaValue, { color: theme.colors.primary, fontWeight: '800' }]}>
                      +{selectedActivity.points}
                    </Text>
                  </View>
                </View>

                <Text style={styles.metaLabel}>STATUS</Text>
                <Text style={[
                  styles.metaValue,
                  selectedActivity.status === 'Approved' && { color: theme.colors.success },
                  selectedActivity.status === 'Verifying' && { color: theme.colors.warning },
                  selectedActivity.status === 'Pending' && { color: theme.colors.textMuted }
                ]}>
                  {selectedActivity.status === 'Verifying' ? `VERIFYING (${selectedActivity.verificationTimeLeft}s)` : selectedActivity.status.toUpperCase()}
                </Text>
              </View>

              <View style={styles.modalActions}>
                {selectedActivity.status === 'Pending' && (
                  <TouchableOpacity 
                    style={styles.primaryButton}
                    onPress={() => {
                      approveActivity(selectedActivity.id);
                      setSelectedActivity(null);
                      Alert.alert("Success", "Activity points approved!");
                    }}
                  >
                    <Text style={styles.primaryButtonText}>APPROVE RECORD</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.outlineBtn, { marginTop: 12, borderColor: theme.colors.error }]}
                  onPress={() => deleteActivity(selectedActivity.id)}
                >
                  <Text style={[styles.outlineBtnText, { color: theme.colors.error }]}>REMOVE ENTRY</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Global layout
  mainContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  canvas: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  
  // Header App Bar
  header: {
    height: 56,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    ...theme.typography.labelCaps,
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '800',
  },
  notifBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.small,
    backgroundColor: '#FFFFFF',
  },

  // Login View
  loginContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loginScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loginHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loginLogo: {
    ...theme.typography.displayLg,
    color: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    textAlign: 'center',
  },
  loginSublogo: {
    ...theme.typography.labelCaps,
    color: theme.colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  brutalistBorder: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.roundness.sharp,
  },
  loginCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 24,
    borderRadius: theme.roundness.medium,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  inputLabel: {
    ...theme.typography.labelCaps,
    color: theme.colors.textMuted,
    marginTop: 16,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.small,
    backgroundColor: '#FFFFFF',
    color: theme.colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  primaryButton: {
    height: 48,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    borderRadius: theme.roundness.small,
  },
  primaryButtonText: {
    ...theme.typography.labelCaps,
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  loginHelpContainer: {
    marginTop: 24,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 16,
  },
  loginHelpText: {
    ...theme.typography.mono,
    color: theme.colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },

  // Dashboard styles
  bentoSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  screenHeading: {
    ...theme.typography.displayLg,
    fontSize: 26,
    color: theme.colors.text,
    marginTop: 4,
  },
  mainBentoCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.large,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  cardAccentGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    backgroundColor: 'rgba(79, 70, 229, 0.05)',
    borderRadius: 75,
  },
  mainBentoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  pointsHuge: {
    ...theme.typography.displayXl,
    fontSize: 54,
    lineHeight: 54,
  },
  pointsGoalText: {
    ...theme.typography.labelCaps,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  circularTracker: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  trackerPercentage: {
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.text,
  },
  bentoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bentoHalfCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.medium,
    padding: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  compactMetricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metricBig: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
  },
  metricSub: {
    ...theme.typography.labelCaps,
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  countdownAlertText: {
    fontSize: 9,
    fontWeight: '700',
    color: theme.colors.warning,
    marginTop: 4,
  },
  countdownAlertTextMuted: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  pendingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.roundness.small,
  },
  pendingBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  chartBentoCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.medium,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  bentoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bentoCardTitle: {
    ...theme.typography.labelCaps,
    color: theme.colors.text,
  },
  capsuleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  capsuleBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  chartContainer: {
    marginTop: 16,
  },
  chartBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chartLabel: {
    ...theme.typography.labelCaps,
    width: 68,
    fontSize: 9,
    color: theme.colors.textMuted,
  },
  chartTrack: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.roundness.full,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    borderRadius: theme.roundness.full,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text,
    width: 24,
    textAlign: 'right',
  },
  listBentoCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.medium,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  textLink: {
    ...theme.typography.labelCaps,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  recentList: {
    marginTop: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  recentItemSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  recentItemPoints: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  statusLabel: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.roundness.small,
  },
  approvedStatus: {
    color: theme.colors.success,
    backgroundColor: theme.colors.successTint,
  },
  verifyingStatus: {
    color: theme.colors.warning,
    backgroundColor: theme.colors.warningTint,
  },
  pendingStatus: {
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surfaceContainerLow,
  },

  // Activities Log view styles
  filtersScrollContainer: {
    marginBottom: 12,
  },
  filtersScroll: {
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.small,
    marginRight: 10,
    backgroundColor: theme.colors.surface,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    ...theme.typography.labelCaps,
    color: theme.colors.textMuted,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  searchBarContainer: {
    marginBottom: 16,
  },
  searchBar: {
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.small,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    paddingHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  ledgerCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    marginBottom: 12,
    borderRadius: theme.roundness.medium,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ledgerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
    paddingRight: 12,
  },
  ledgerPoints: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  ledgerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ledgerMetaText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  statusLabelBorder: {
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    textTransform: 'uppercase',
    borderRadius: theme.roundness.small,
  },
  approvedBorder: {
    borderColor: theme.colors.success,
    color: theme.colors.success,
    backgroundColor: theme.colors.successTint,
  },
  verifyingBorder: {
    borderColor: theme.colors.warning,
    color: theme.colors.warning,
    backgroundColor: theme.colors.warningTint,
  },
  pendingBorder: {
    borderColor: theme.colors.border,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
  },

  // Scanner View
  scannerWrapper: {
    paddingTop: 8,
  },
  viewfinderBox: {
    height: 260,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.textDim,
    borderRadius: theme.roundness.large,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  viewfinderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  viewfinderSubtitle: {
    ...theme.typography.labelCaps,
    color: theme.colors.textMuted,
    fontSize: 9,
    marginTop: 4,
  },
  viewfinderButtons: {
    marginTop: 24,
    width: '100%',
    maxWidth: 220,
  },
  outlineBtn: {
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.small,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  outlineBtnText: {
    ...theme.typography.labelCaps,
    color: theme.colors.text,
    fontSize: 10,
  },
  demoBox: {
    marginTop: 24,
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    paddingTop: 20,
  },
  demoTitle: {
    ...theme.typography.labelCaps,
    color: theme.colors.text,
  },
  demoSubtitle: {
    ...theme.typography.labelCaps,
    fontSize: 8,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.small,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: theme.colors.surface,
    maxWidth: '47%',
  },
  demoChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
    flex: 1,
  },
  scanningFrame: {
    height: 260,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.roundness.large,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  laserScanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 4,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 3,
  },
  scanningLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
    marginTop: 16,
  },
  scanningSublabel: {
    ...theme.typography.labelCaps,
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.large,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  reviewCardTitle: {
    ...theme.typography.headline,
    fontSize: 16,
    color: theme.colors.text,
  },
  reviewSubtitle: {
    ...theme.typography.labelCaps,
    fontSize: 9,
    color: theme.colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  formRadioChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.small,
    marginRight: 8,
    backgroundColor: theme.colors.background,
  },
  formRadioChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryTint,
  },
  formRadioChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  formRadioChipTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  // Plain white certificate preview styles
  certPreviewContainer: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.large,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  certPreviewHeader: {
    ...theme.typography.labelCaps,
    color: theme.colors.textMuted,
    marginBottom: 12,
    fontWeight: '800',
  },
  plainCertificateSheet: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: theme.roundness.sharp,
    padding: 20,
    alignItems: 'center',
  },
  certOrgName: {
    fontFamily: 'Courier',
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  certDividerLine: {
    width: '60%',
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  certSubText: {
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    fontSize: 12,
    color: '#64748B',
  },
  certStudentName: {
    fontFamily: 'Georgia',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    marginVertical: 10,
    letterSpacing: 1,
  },
  certBodyText: {
    fontFamily: 'Georgia',
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  certFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 12,
  },
  certFooterLabel: {
    fontFamily: 'Courier',
    fontSize: 8,
    color: '#94A3B8',
  },
  certFooterVal: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 2,
  },
  previewActionRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  primaryButtonCompact: {
    flex: 1,
    marginRight: 8,
    height: 40,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.roundness.small,
  },
  outlineBtnCompact: {
    flex: 1,
    marginLeft: 8,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.small,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  // Profile page styles
  profileWrapper: {
    alignItems: 'center',
    paddingTop: 20,
  },
  avatarFrame: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    overflow: 'hidden',
    marginBottom: 16,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  profileUsn: {
    ...theme.typography.mono,
    color: theme.colors.primary,
    fontSize: 13,
    marginTop: 4,
  },
  profileDegree: {
    ...theme.typography.labelCaps,
    color: theme.colors.textMuted,
    fontSize: 9,
    marginTop: 8,
    textAlign: 'center',
  },
  profileDivider: {
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 24,
  },
  infoCardText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
  },
  infoCardSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },

  // Bottom navigation tab bar styles
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabItemText: {
    ...theme.typography.labelCaps,
    fontSize: 8,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  tabItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  scannerTabItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  scannerIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Detail Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 24,
    borderRadius: theme.roundness.large,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingBottom: 12,
    marginBottom: 16,
  },
  modalLabel: {
    ...theme.typography.labelCaps,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  modalTitle: {
    ...theme.typography.displayLg,
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 16,
  },
  modalMetaCard: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    borderRadius: theme.roundness.medium,
  },
  metaLabel: {
    ...theme.typography.labelCaps,
    fontSize: 9,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActions: {
    marginTop: 20,
  },
});
