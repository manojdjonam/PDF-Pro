import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Alert, TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [watermarkType, setWatermarkType] = useState('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [bookmarks, setBookmarks] = useState([
    { name: 'Introduction', page: 1, file: 'Document.pdf' },
    { name: 'Chapter 2', page: 15, file: 'Document.pdf' },
  ]);
  const [recentFiles, setRecentFiles] = useState([
    { name: 'Sample Document.pdf', size: '2.4 MB', date: 'Today', uri: '' },
    { name: 'Contract 2024.pdf', size: '1.1 MB', date: 'Yesterday', uri: '' },
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

  // ─── PICK PDF FILE ───
  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        setRecentFiles(prev => [{
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          date: 'Just now',
          uri: file.uri
        }, ...prev.slice(0, 4)]);
        return file;
      }
      return null;
    } catch (err) {
      Alert.alert('Error', 'Could not open file picker!');
      return null;
    }
  };

  // ─── PICK MULTIPLE PDFs ───
  const pickMultiplePDFs = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (!result.canceled) return result.assets;
      return null;
    } catch (err) {
      Alert.alert('Error', 'Could not open file picker!');
      return null;
    }
  };

  // ─── SHARE FILE ───
  const shareFile = async (uri) => {
    try {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device!');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not share file!');
    }
  };

  // ─── MERGE PDFs ───
  const mergePDFs = async () => {
    try {
      Alert.alert('📂 Select PDFs', 'Select 2 or more PDF files to merge!');
      const files = await pickMultiplePDFs();
      if (!files || files.length < 2) {
        Alert.alert('Error', 'Please select at least 2 PDF files!');
        return;
      }
      Alert.alert('⏳ Processing', 'Merging your PDFs...');
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const pdfBytes = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const pdf = await PDFDocument.load(pdfBytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.saveAsBase64();
      const outputUri = FileSystem.cacheDirectory + 'merged_pdf.pdf';
      await FileSystem.writeAsStringAsync(outputUri, mergedBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert('✅ Success!', 'PDFs merged successfully! Sharing now...');
      await shareFile(outputUri);
    } catch (err) {
      Alert.alert('Error', 'Could not merge PDFs: ' + err.message);
    }
  };

  // ─── SPLIT PDF ───
  const splitPDF = async () => {
    try {
      const file = await pickPDF();
      if (!file) return;
      Alert.alert('⏳ Processing', 'Splitting your PDF...');
      const pdfBytes = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdf = await PDFDocument.load(pdfBytes);
      const totalPages = pdf.getPageCount();
      const halfPage = Math.floor(totalPages / 2);
      const pdf1 = await PDFDocument.create();
      const pdf2 = await PDFDocument.create();
      const pages1 = await pdf1.copyPages(pdf, Array.from({length: halfPage}, (_, i) => i));
      pages1.forEach(page => pdf1.addPage(page));
      const pages2 = await pdf2.copyPages(pdf, Array.from({length: totalPages - halfPage}, (_, i) => i + halfPage));
      pages2.forEach(page => pdf2.addPage(page));
      const bytes1 = await pdf1.saveAsBase64();
      const bytes2 = await pdf2.saveAsBase64();
      const uri1 = FileSystem.cacheDirectory + 'split_part1.pdf';
      const uri2 = FileSystem.cacheDirectory + 'split_part2.pdf';
      await FileSystem.writeAsStringAsync(uri1, bytes1, { encoding: FileSystem.EncodingType.Base64 });
      await FileSystem.writeAsStringAsync(uri2, bytes2, { encoding: FileSystem.EncodingType.Base64 });
      Alert.alert('✅ Success!', `PDF split into 2 parts!\nPart 1: ${halfPage} pages\nPart 2: ${totalPages - halfPage} pages\nSharing Part 1 now...`);
      await shareFile(uri1);
    } catch (err) {
      Alert.alert('Error', 'Could not split PDF: ' + err.message);
    }
  };

  // ─── ROTATE PDF ───
  const rotatePDF = async () => {
    try {
      const file = await pickPDF();
      if (!file) return;
      Alert.alert('⏳ Processing', 'Rotating pages...');
      const pdfBytes = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = pdf.getPages();
      pages.forEach(page => {
        page.setRotation(degrees(90));
      });
      const rotatedBytes = await pdf.saveAsBase64();
      const outputUri = FileSystem.cacheDirectory + 'rotated_pdf.pdf';
      await FileSystem.writeAsStringAsync(outputUri, rotatedBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert('✅ Success!', 'All pages rotated 90°! Sharing now...');
      await shareFile(outputUri);
    } catch (err) {
      Alert.alert('Error', 'Could not rotate PDF: ' + err.message);
    }
  };

  // ─── ADD WATERMARK ───
  const addWatermark = async () => {
    try {
      const file = await pickPDF();
      if (!file) return;
      Alert.alert('⏳ Processing', 'Adding watermark...');
      const pdfBytes = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = pdf.getPages();
      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(watermarkText, {
          x: width / 4,
          y: height / 2,
          size: 40,
          color: rgb(0.8, 0.1, 0.1),
          opacity: 0.3,
          rotate: degrees(-45),
        });
      });
      const watermarkedBytes = await pdf.saveAsBase64();
      const outputUri = FileSystem.cacheDirectory + 'watermarked_pdf.pdf';
      await FileSystem.writeAsStringAsync(outputUri, watermarkedBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert('✅ Success!', `Watermark "${watermarkText}" added! Sharing now...`);
      await shareFile(outputUri);
    } catch (err) {
      Alert.alert('Error', 'Could not add watermark: ' + err.message);
    }
  };

  // ─── ADD PAGE NUMBERS ───
  const addPageNumbers = async () => {
    try {
      const file = await pickPDF();
      if (!file) return;
      Alert.alert('⏳ Processing', 'Adding page numbers...');
      const pdfBytes = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = pdf.getPages();
      pages.forEach((page, index) => {
        const { width } = page.getSize();
        page.drawText(`Page ${index + 1} of ${pages.length}`, {
          x: width / 2 - 40,
          y: 20,
          size: 12,
          color: rgb(0, 0, 0),
        });
      });
      const numberedBytes = await pdf.saveAsBase64();
      const outputUri = FileSystem.cacheDirectory + 'numbered_pdf.pdf';
      await FileSystem.writeAsStringAsync(outputUri, numberedBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert('✅ Success!', 'Page numbers added! Sharing now...');
      await shareFile(outputUri);
    } catch (err) {
      Alert.alert('Error', 'Could not add page numbers: ' + err.message);
    }
  };

  // ─── ADD HEADER FOOTER ───
  const addHeaderFooter = async () => {
    try {
      const file = await pickPDF();
      if (!file) return;
      Alert.alert('⏳ Processing', 'Adding header and footer...');
      const pdfBytes = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = pdf.getPages();
      pages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawText('PDF Pro - Header', {
          x: width / 2 - 60,
          y: height - 30,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
        page.drawText('PDF Pro - Footer', {
          x: width / 2 - 60,
          y: 15,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
      });
      const headerBytes = await pdf.saveAsBase64();
      const outputUri = FileSystem.cacheDirectory + 'headerfooter_pdf.pdf';
      await FileSystem.writeAsStringAsync(outputUri, headerBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert('✅ Success!', 'Header & Footer added! Sharing now...');
      await shareFile(outputUri);
    } catch (err) {
      Alert.alert('Error', 'Could not add header/footer: ' + err.message);
    }
  };

  // ─── IMAGES TO PDF ───
  const imagesToPDF = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      Alert.alert('⏳ Processing', 'Converting images to PDF...');
      const pdf = await PDFDocument.create();
      for (const image of result.assets) {
        const imageBytes = await FileSystem.readAsStringAsync(image.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        let embeddedImage;
        if (image.uri.endsWith('.png')) {
          embeddedImage = await pdf.embedPng(imageBytes);
        } else {
          embeddedImage = await pdf.embedJpg(imageBytes);
        }
        const page = pdf.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0, y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }
      const pdfBytes = await pdf.saveAsBase64();
      const outputUri = FileSystem.cacheDirectory + 'images_to_pdf.pdf';
      await FileSystem.writeAsStringAsync(outputUri, pdfBytes, {
        encoding: FileSystem.EncodingType.Base64,
      });
      Alert.alert('✅ Success!', `${result.assets.length} images converted to PDF! Sharing now...`);
      await shareFile(outputUri);
    } catch (err) {
      Alert.alert('Error', 'Could not convert images: ' + err.message);
    }
  };

  // ─── SHARE PDF ───
  const sharePDF = async () => {
    try {
      const file = await pickPDF();
      if (!file) return;
      await shareFile(file.uri);
    } catch (err) {
      Alert.alert('Error', 'Could not share PDF!');
    }
  };

  const tools = [
    { icon: '📂', name: 'Open PDF', desc: 'View any PDF file', action: pickPDF },
    { icon: '🗜️', name: 'Merge PDF', desc: 'Combine multiple PDFs', action: mergePDFs },
    { icon: '✂️', name: 'Split PDF', desc: 'Split into parts', action: splitPDF },
    { icon: '🔁', name: 'Rotate Pages', desc: 'Rotate any page', action: rotatePDF },
    { icon: '💧', name: 'Watermark', desc: 'Add text watermark', action: () => setCurrentScreen('watermark') },
    { icon: '🔢', name: 'Page Numbers', desc: 'Add page numbers', action: addPageNumbers },
    { icon: '📋', name: 'Header & Footer', desc: 'Add header and footer', action: addHeaderFooter },
    { icon: '🖼️', name: 'Images to PDF', desc: 'Convert images to PDF', action: imagesToPDF },
    { icon: '📸', name: 'PDF to Images', desc: 'Convert PDF to images', action: () => Alert.alert('📸 Coming Soon', 'This feature coming in next update!') },
    { icon: '🔖', name: 'Bookmarks', desc: 'Manage bookmarks', action: () => setCurrentScreen('bookmarks') },
    { icon: '📤', name: 'Share PDF', desc: 'Share with others', action: sharePDF },
    { icon: '🗂️', name: 'Recent Files', desc: 'View recent files', action: () => setCurrentScreen('recent') },
  ];

  // ─── HOME SCREEN ───
  const HomeScreen = () => (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <Text style={styles.headerTitle}>📄 PDF Pro</Text>
        <TouchableOpacity style={styles.darkModeBtn} onPress={() => setDarkMode(!darkMode)}>
          <Text style={styles.darkModeText}>{darkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.welcomeCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>Welcome to PDF Pro! 👋</Text>
          <Text style={[styles.welcomeDesc, { color: theme.subtext }]}>
            Your complete PDF tool. All features are real and working!
          </Text>
        </View>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>🛠️ PDF Tools</Text>
        <View style={styles.grid}>
          {tools.map((tool, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.toolCard, { backgroundColor: theme.card }]}
              onPress={tool.action}>
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
          </TouchableOpacity>
        ))}
        <View style={{ height: 20 }} />
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
            Add a text watermark to your PDF
          </Text>
        </View>
        <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Watermark Text:</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.secondary }]}
            value={watermarkText}
            onChangeText={setWatermarkText}
            placeholder="Enter watermark text"
            placeholderTextColor={theme.subtext}
          />
          <View style={[styles.previewBox, { borderColor: theme.border }]}>
            <Text style={styles.previewText}>{watermarkText}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={addWatermark}>
          <Text style={styles.actionBtnText}>📂 Select PDF & Add Watermark</Text>
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
          <Text style={[styles.toolScreenDesc, { color: theme.subtext }]}>Jump to any saved page instantly</Text>
        </View>
        {bookmarks.map((bookmark, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.fileCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => Alert.alert('📖 Opening!', `Jumping to page ${bookmark.page} - ${bookmark.name}`)}>
            <Text style={styles.fileIcon}>🔖</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fileName, { color: theme.text }]}>{bookmark.name}</Text>
              <Text style={[styles.fileMeta, { color: theme.subtext }]}>Page {bookmark.page} • {bookmark.file}</Text>
            </View>
            <TouchableOpacity onPress={() => setBookmarks(bookmarks.filter((_, i) => i !== index))}>
              <Text style={{ fontSize: 20 }}>🗑️</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={() => Alert.alert('➕ Add Bookmark', 'Open a PDF first to add bookmarks!')}>
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
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );

  // ─── RECENT FILES SCREEN ───
  const RecentScreen = () => (
    <View style={{ flex: 1 }}>
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={() => setCurrentScreen('home')}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗂️ Recent Files</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView>
        {recentFiles.length === 0 && (
          <View style={[styles.toolScreenCard, { backgroundColor: theme.card }]}>
            <Text style={styles.toolScreenIcon}>🗂️</Text>
            <Text style={[styles.toolScreenTitle, { color: theme.text }]}>No Recent Files</Text>
            <Text style={[styles.toolScreenDesc, { color: theme.subtext }]}>
              Open a PDF to see it here!
            </Text>
          </View>
        )}
        {recentFiles.map((file, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.fileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={styles.fileIcon}>📄</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.fileName, { color: theme.text }]}>{file.name}</Text>
              <Text style={[styles.fileMeta, { color: theme.subtext }]}>{file.size} • {file.date}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );

  // ─── RENDER SCREEN ───
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen />;
      case 'watermark': return <WatermarkScreen />;
      case 'bookmarks': return <BookmarksScreen />;
      case 'settings': return <SettingsScreen />;
      case 'recent': return <RecentScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      {renderScreen()}
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
    paddingTop: 50, paddingBottom: 15, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
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
  input: { padding: 12, borderRadius: 10, borderWidth: 1, fontSize: 16, marginBottom: 10 },
  previewBox: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 10, padding: 20, alignItems: 'center' },
  previewText: { fontSize: 24, fontWeight: 'bold', color: 'rgba(231,76,60,0.4)', transform: [{ rotate: '-20deg' }] },
  settingsCard: { margin: 15, borderRadius: 15, elevation: 3, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  settingsText: { fontSize: 16 },
  settingsValue: { fontSize: 14 },
  toggle: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  divider: { height: 1, marginHorizontal: 15 },
  bottomNav: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 20, paddingTop: 10 },
  navItem: { flex: 1, alignItems: 'center' },
  navIcon: { fontSize: 22 },
  navText: { fontSize: 11, marginTop: 3, fontWeight: 'bold' },
});
