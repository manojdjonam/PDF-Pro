import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  TextInput,
  Image,
} from 'react-native';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [watermarkType, setWatermarkType] = useState('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [bookmarks, setBookmarks] = useState([
    { name: 'Introduction', page: 1, file: 'Document.pdf' },
    { name: 'Chapter 2', page: 15, file: 'Document.pdf' },
    { name: 'Conclusion', page: 45, file: 'Report.pdf' },
  ]);
  const [recentFiles, setRecentFiles] = useState([
    { name: 'Sample Document.pdf', size: '2.4 MB', date: 'Today' },
    { name: 'Contract 2024.pdf', size: '1.1 MB', date: 'Yesterday' },
    { name: 'Invoice March.pdf', size: '0.8 MB', date: '2 days ago' },
  ]);

  const theme = {
    background: darkMode ? '#1a1a1a' : '#f5f5f5',
    card: darkMode ? '#2d2d2d' : '#ffffff',
    text: darkMode ? '#ffffff' : '#000000',
    subtext: darkMode ? '#aaaaaa' : '#666666',
    primary: '#e74c3c',
    secondary: darkMode ? '#3d3d3d' : '#f0f0f0',
    border: darkMode ? '#444444' : '#eeeeee',
  };

  const tools = [
    { icon: '📂', name: 'Open PDF', desc: 'View any PDF file', screen: 'viewer' },
    { icon: '🗜️', name: 'Merge PDF', desc: 'Combine multiple PDFs', screen: 'merge' },
    { icon: '✂️', name: 'Split PDF', desc: 'Split into parts', screen: 'split' },
    { icon: '🔁', name: 'Rotate Pages', desc: 'Rotate any page', screen: 'rotate' },
    { icon: '💧', name: 'Watermark', desc: 'Add text or image watermark', screen: 'watermark' },
    { icon: '🔢', name: 'Page Numbers', desc: 'Add page numbers', screen: 'pagenumbers' },
    { icon: '📋', name: 'Header & Footer', desc: 'Add header and footer', screen: 'headerfooter' },
    { icon: '🖼️', name: 'Images to PDF', desc: 'Convert images to PDF', screen: 'imagetopdf' },
    { icon: '📸', name: 'PDF to Images', desc: 'Convert PDF to images', screen: 'pdftoimage' },
    { icon: '🔖', name: 'Bookmarks', desc: 'Manage bookmarks', screen: 'bookmarks' },
    { icon: '📤', name: 'Share PDF', desc: 'Share with others', screen: 'share' },
    { icon: '🗂️', name: 'Recent Files', desc: 'View recent files', screen: 'recent' },
  ];

  // ─── HOME SCREEN ───
  const HomeScreen = () => (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>📄 PDF Pro</Text>
        <TouchableOpacity
          style={styles.darkModeBtn}
          onPress={() => setDarkMode(!darkMode)}>
          <Text style={styles.darkModeText}>{darkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.welcomeCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>
            Welcome to PDF Pro! 👋
          </Text>
          <Text style={[styles.welcomeDesc, { color: theme.subtext }]}>
            Your complete PDF tool. Select any tool below to get started.
          </Text>
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🛠️ PDF Tools</Text>
        <View style={styles.grid}>
          {tools.map((tool, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.toolCard, { backgroundColor: theme.card }]}
              onPress={() => setCurrentScreen(tool.screen)}>
              <Text style={styles.toolIcon}>{tool.icon}</Text>
              <Text style={[styles.toolName, { color: theme.text }]}>{tool.name}</Text>
              <Text style={[styles.toolDesc, { color: theme.subtext }]}>{tool.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🕐 Recent Files</Text>
        {recentFiles.map((file, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.fileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.fileIcon}>📄</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fileName, { color: theme.text }]}>{file.name}</Text>
              <Text style={[styles.fileMeta, { color: theme.subtext }]}>{file.size} • {file.date}</Text>
            </View>
            <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );

  // ─── TOOL SCREEN TEMPLATE ───
  const ToolScreen = ({ icon, title, description, buttonText, onAction, children }) => (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView>
        <View style={[styles.toolScreenCard, { backgroundColor: theme.card }]}>
          <Text style={styles.toolScreenIcon}>{icon}</Text>
          <Text style={[styles.toolScreenTitle, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.toolScreenDesc, { color: theme.subtext }]}>{description}</Text>
        </View>
        {children}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={onAction}>
          <Text style={styles.actionBtnText}>{buttonText}</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );

  // ─── WATERMARK SCREEN ───
  const WatermarkScreen = () => (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💧 Watermark</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView>
        <View style={[styles.toolScreenCard, { backgroundColor: theme.card }]}>
          <Text style={styles.toolScreenIcon}>💧</Text>
          <Text style={[styles.toolScreenTitle, { color: theme.text }]}>Add Watermark</Text>
          <Text style={[styles.toolScreenDesc, { color: theme.subtext }]}>
            Add a text or image watermark to your PDF
          </Text>
        </View>

        {/* Watermark Type Selector */}
        <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Choose Watermark Type:
          </Text>
          <View style={styles.typeRow}>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                { backgroundColor: watermarkType === 'text' ? theme.primary : theme.secondary }
              ]}
              onPress={() => setWatermarkType('text')}>
              <Text style={[styles.typeBtnText, { color: watermarkType === 'text' ? '#fff' : theme.text }]}>
                📝 Text
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeBtn,
                { backgroundColor: watermarkType === 'image' ? theme.primary : theme.secondary }
              ]}
              onPress={() => setWatermarkType('image')}>
              <Text style={[styles.typeBtnText, { color: watermarkType === 'image' ? '#fff' : theme.text }]}>
                🖼️ Image
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Text Watermark Options */}
        {watermarkType === 'text' && (
          <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>Watermark Text:</Text>
            <TextInput
              style={[styles.input, {
                color: theme.text,
                borderColor: theme.border,
                backgroundColor: theme.secondary
              }]}
              value={watermarkText}
              onChangeText={setWatermarkText}
              placeholder="Enter watermark text"
              placeholderTextColor={theme.subtext}
            />
            <Text style={[styles.inputLabel, { color: theme.text, marginTop: 15 }]}>
              Preview:
            </Text>
            <View style={[styles.previewBox, { borderColor: theme.border }]}>
              <Text style={styles.previewText}>{watermarkText}</Text>
            </View>
          </View>
        )}

        {/* Image Watermark Options */}
        {watermarkType === 'image' && (
          <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Select Watermark Image:
            </Text>
            <TouchableOpacity
              style={[styles.imagePickerBtn, { borderColor: theme.primary, backgroundColor: theme.secondary }]}
              onPress={() => Alert.alert('🖼️ Pick Image', 'In the real app this will open your photo library to pick a watermark image!')}>
              {watermarkImage ? (
                <Image source={{ uri: watermarkImage }} style={styles.watermarkImagePreview} />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <Text style={styles.imagePickerIcon}>🖼️</Text>
                  <Text style={[styles.imagePickerText, { color: theme.subtext }]}>
                    Tap to pick image from photos
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={() => Alert.alert(
            '✅ Watermark Ready!',
            watermarkType === 'text'
              ? `Text watermark "${watermarkText}" will be added to your PDF!`
              : 'Image watermark will be added to your PDF!'
          )}>
          <Text style={styles.actionBtnText}>📂 Select PDF & Apply Watermark</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );

  // ─── BOOKMARKS SCREEN ───
  const BookmarksScreen = () => (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔖 Bookmarks</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView>
        <View style={[styles.toolScreenCard, { backgroundColor: theme.card }]}>
          <Text style={styles.toolScreenIcon}>🔖</Text>
          <Text style={[styles.toolScreenTitle, { color: theme.text }]}>My Bookmarks</Text>
          <Text style={[styles.toolScreenDesc, { color: theme.subtext }]}>
            Jump to any saved page instantly
          </Text>
        </View>
        {bookmarks.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: theme.card }]}>
            <Text style={styles.emptyIcon}>🔖</Text>
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              No bookmarks yet! Open a PDF and add bookmarks.
            </Text>
          </View>
        )}
        {bookmarks.map((bookmark, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.fileCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => Alert.alert('📖 Opening!', `Jumping to page ${bookmark.page} - ${bookmark.name}`)}>
            <Text style={styles.fileIcon}>🔖</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fileName, { color: theme.text }]}>{bookmark.name}</Text>
              <Text style={[styles.fileMeta, { color: theme.subtext }]}>
                Page {bookmark.page} • {bookmark.file}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setBookmarks(bookmarks.filter((_, i) => i !== index));
                Alert.alert('🗑️ Deleted', 'Bookmark removed!');
              }}>
              <Text style={{ fontSize: 20 }}>🗑️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={() => Alert.alert('➕ Add Bookmark', 'Open a PDF first then tap the bookmark icon to save your page!')}>
          <Text style={styles.actionBtnText}>➕ Add New Bookmark</Text>
        </TouchableOpacity>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );

  // ─── SETTINGS SCREEN ───
  const SettingsScreen = () => (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Settings</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView>
        <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
          <View style={styles.settingsRow}>
            <Text style={[styles.settingsText, { color: theme.text }]}>🌙 Dark Mode</Text>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: darkMode ? theme.primary : theme.secondary }]}
              onPress={() => setDarkMode(!darkMode)}>
              <Text style={{ color: darkMode ? '#fff' : '#000', fontWeight: 'bold' }}>
                {darkMode ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.settingsRow}>
            <Text style={[styles.settingsText, { color: theme.text }]}>📱 App Version</Text>
            <Text style={[styles.settingsValue, { color: theme.subtext }]}>1.0.0</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.settingsRow}>
            <Text style={[styles.settingsText, { color: theme.text }]}>👨‍💻 Developer</Text>
            <Text style={[styles.settingsValue, { color: theme.subtext }]}>PDF Pro Team</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.settingsRow}>
            <Text style={[styles.settingsText, { color: theme.text }]}>📧 Support</Text>
            <Text style={[styles.settingsValue, { color: theme.primary }]}>support@pdfpro.com</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.settingsRow}>
            <Text style={[styles.settingsText, { color: theme.text }]}>⭐ Rate App</Text>
            <Text style={[styles.settingsValue, { color: theme.primary }]}>Leave a review</Text>
          </View>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );

  // ─── RENDER CORRECT SCREEN ───
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen />;
      case 'bookmarks': return <BookmarksScreen />;
      case 'watermark': return <WatermarkScreen />;
      case 'settings': return <SettingsScreen />;
      case 'viewer':
        return <ToolScreen icon="📂" title="Open PDF" description="Select a PDF file from your device to view it. Zoom, scroll and navigate pages easily." buttonText="📂 Select PDF to View" onAction={() => Alert.alert('📂 Open PDF', 'In the real app this opens your file manager to pick any PDF!')} />;
      case 'merge':
        return <ToolScreen icon="🗜️" title="Merge PDF" description="Select multiple PDF files and combine them into one single PDF document instantly." buttonText="📂 Select PDFs to Merge" onAction={() => Alert.alert('🗜️ Merge PDF', 'In the real app select 2 or more PDFs to merge into one!')} />;
      case 'split':
        return <ToolScreen icon="✂️" title="Split PDF" description="Split your PDF into multiple smaller files. Choose page ranges for each split." buttonText="📂 Select PDF to Split" onAction={() => Alert.alert('✂️ Split PDF', 'In the real app select a PDF and choose where to split it!')} />;
      case 'rotate':
        return <ToolScreen icon="🔁" title="Rotate Pages" description="Rotate pages in your PDF 90° or 180° clockwise or counterclockwise." buttonText="📂 Select PDF to Rotate" onAction={() => Alert.alert('🔁 Rotate Pages', 'In the real app select a PDF and choose rotation direction!')} />;
      case 'pagenumbers':
        return <ToolScreen icon="🔢" title="Page Numbers" description="Automatically add page numbers to the bottom of every page in your PDF." buttonText="📂 Select PDF & Add Numbers" onAction={() => Alert.alert('🔢 Page Numbers', 'In the real app page numbers are added automatically!')} />;
      case 'headerfooter':
        return <ToolScreen icon="📋" title="Header & Footer" description="Add custom header and footer text to every page of your PDF document." buttonText="📂 Select PDF & Add Header/Footer" onAction={() => Alert.alert('📋 Header & Footer', 'In the real app type your header and footer text!')} />;
      case 'imagetopdf':
        return <ToolScreen icon="🖼️" title="Images to PDF" description="Select multiple images from your phone gallery and convert them into one PDF." buttonText="🖼️ Select Images to Convert" onAction={() => Alert.alert('🖼️ Images to PDF', 'In the real app select multiple photos to combine into PDF!')} />;
      case 'pdftoimage':
        return <ToolScreen icon="📸" title="PDF to Images" description="Convert each page of your PDF into high quality JPG or PNG images." buttonText="📂 Select PDF to Convert" onAction={() => Alert.alert('📸 PDF to Images', 'In the real app each PDF page becomes a separate image!')} />;
      case 'share':
        return <ToolScreen icon="📤" title="Share PDF" description="Select any PDF and share it via WhatsApp, Email, Telegram or any other app." buttonText="📂 Select PDF to Share" onAction={() => Alert.alert('📤 Share PDF', 'In the real app this opens your share menu!')} />;
      case 'recent':
        return <ToolScreen icon="🗂️" title="Recent Files" description="All your recently opened PDF files appear here for quick access." buttonText="🗂️ View All Files" onAction={() => Alert.alert('🗂️ Recent Files', 'Your recent files will appear here as you use the app!')} />;
      default: return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      {renderScreen()}
      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('home')}>
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navText, { color: currentScreen === 'home' ? theme.primary : theme.subtext }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('recent')}>
          <Text style={styles.navIcon}>🗂️</Text>
          <Text style={[styles.navText, { color: currentScreen === 'recent' ? theme.primary : theme.subtext }]}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('bookmarks')}>
          <Text style={styles.navIcon}>🔖</Text>
          <Text style={[styles.navText, { color: currentScreen === 'bookmarks' ? theme.primary : theme.subtext }]}>Bookmarks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentScreen('settings')}>
          <Text style={styles.navIcon}>⚙️</Text>
          <Text style={[styles.navText, { color: currentScreen === 'settings' ? theme.primary : theme.subtext }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#ffffff' },
  backBtn: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  darkModeBtn: { padding: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  darkModeText: { fontSize: 20 },
  welcomeCard: { margin: 15, padding: 20, borderRadius: 15, elevation: 3 },
  welcomeTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  welcomeDesc: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 15, marginBottom: 10, marginTop: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10 },
  toolCard: { width: '44%', margin: '3%', padding: 15, borderRadius: 15, alignItems: 'center', elevation: 3 },
  toolIcon: { fontSize: 35, marginBottom: 8 },
  toolName: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  toolDesc: { fontSize: 11, textAlign: 'center' },
  fileCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 15, marginBottom: 10, padding: 15, borderRadius: 12, borderWidth: 1, elevation: 2 },
  fileIcon: { fontSize: 30, marginRight: 12 },
  fileName: { fontSize: 14, fontWeight: 'bold', marginBottom: 3 },
  fileMeta: { fontSize: 12 },
  toolScreenCard: { margin: 15, padding: 30, borderRadius: 15, alignItems: 'center', elevation: 3 },
  toolScreenIcon: { fontSize: 60, marginBottom: 15 },
  toolScreenTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  toolScreenDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  actionBtn: { margin: 15, padding: 18, borderRadius: 15, alignItems: 'center', elevation: 3 },
  actionBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  inputCard: { margin: 15, padding: 20, borderRadius: 15, elevation: 3 },
  inputLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  input: { padding: 12, borderRadius: 10, borderWidth: 1, fontSize: 16 },
  typeRow: { flexDirection: 'row', gap: 10 },
  typeBtn: { flex: 1, padding: 15, borderRadius: 12, alignItems: 'center' },
  typeBtnText: { fontSize: 16, fontWeight: 'bold' },
  previewBox: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 10, padding: 20, alignItems: 'center', marginTop: 5 },
  previewText: { fontSize: 24, fontWeight: 'bold', color: 'rgba(231,76,60,0.4)', transform: [{ rotate: '-20deg' }] },
  imagePickerBtn: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 12, padding: 20, alignItems: 'center', minHeight: 150, justifyContent: 'center' },
  imagePickerPlaceholder: { alignItems: 'center' },
  imagePickerIcon: { fontSize: 50, marginBottom: 10 },
  imagePickerText: { fontSize: 14, textAlign: 'center' },
  watermarkImagePreview: { width: '100%', height: 150, borderRadius: 10 },
  settingsCard: { margin: 15, borderRadius: 15, elevation: 3, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  settingsText: { fontSize: 16 },
  settingsValue: { fontSize: 14 },
  toggle: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  divider: { height: 1, marginHorizontal: 15 },
  emptyCard: { margin: 15, padding: 30, borderRadius: 15, alignItems: 'center', elevation: 2 },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 20, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center' },
  navIcon: { fontSize: 22 },
  navText: { fontSize: 11, marginTop: 3, fontWeight: 'bold' },
});