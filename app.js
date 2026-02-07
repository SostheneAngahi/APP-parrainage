// ============================================
// VARIABLES GLOBALES
// ============================================
let filleulsFiles = [];
let parrainsFiles = [];
let db;

// ============================================
// INITIALISATION DE LA BASE DE DONNÉES
// ============================================
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CeremonyDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'type' });
      }
    };
  });
}

// Initialiser la DB au chargement
initDB().catch(err => {
  console.error('Erreur d\'initialisation de la base de données:', err);
  alert('⚠️ Erreur d\'initialisation. Veuillez recharger la page.');
});

// ============================================
// ÉLÉMENTS DOM
// ============================================
const filleulsInput = document.getElementById('filleulsInput');
const parrainsInput = document.getElementById('parrainsInput');
const filleulsDropZone = document.getElementById('filleulsDropZone');
const parrainsDropZone = document.getElementById('parrainsDropZone');
const filleulsCounter = document.getElementById('filleulsCounter');
const parrainsCounter = document.getElementById('parrainsCounter');
const filleulsPreview = document.getElementById('filleulsPreview');
const parrainsPreview = document.getElementById('parrainsPreview');
const startBtn = document.getElementById('startBtn');

// ============================================
// GESTION DES FILLEULS
// ============================================

// Clic sur la drop zone
filleulsDropZone.addEventListener('click', () => {
  filleulsInput.click();
});

// Sélection de fichiers
filleulsInput.addEventListener('change', (e) => {
  handleFiles(e.target.files, 'filleuls');
});

// Drag & Drop
filleulsDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  filleulsDropZone.classList.add('drag-over');
});

filleulsDropZone.addEventListener('dragleave', () => {
  filleulsDropZone.classList.remove('drag-over');
});

filleulsDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  filleulsDropZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files, 'filleuls');
});

// ============================================
// GESTION DES PARRAINS
// ============================================

// Clic sur la drop zone
parrainsDropZone.addEventListener('click', () => {
  parrainsInput.click();
});

// Sélection de fichiers
parrainsInput.addEventListener('change', (e) => {
  handleFiles(e.target.files, 'parrains');
});

// Drag & Drop
parrainsDropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  parrainsDropZone.classList.add('drag-over');
});

parrainsDropZone.addEventListener('dragleave', () => {
  parrainsDropZone.classList.remove('drag-over');
});

parrainsDropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  parrainsDropZone.classList.remove('drag-over');
  handleFiles(e.dataTransfer.files, 'parrains');
});

// ============================================
// TRAITEMENT DES FICHIERS
// ============================================
function handleFiles(files, type) {
  // Filtrer uniquement les images
  const imageFiles = Array.from(files).filter(file => 
    file.type.startsWith('image/')
  );
  
  if (imageFiles.length === 0) {
    alert('⚠️ Veuillez sélectionner uniquement des images (JPG, PNG, etc.)');
    return;
  }
  
  // Stocker les fichiers selon le type
  if (type === 'filleuls') {
    filleulsFiles = imageFiles;
    updateDisplay('filleuls', imageFiles);
  } else {
    parrainsFiles = imageFiles;
    updateDisplay('parrains', imageFiles);
  }
  
  // Vérifier si on peut activer le bouton
  checkStartButton();
}

// ============================================
// MISE À JOUR DE L'AFFICHAGE
// ============================================
function updateDisplay(type, files) {
  const counter = type === 'filleuls' ? filleulsCounter : parrainsCounter;
  const preview = type === 'filleuls' ? filleulsPreview : parrainsPreview;
  
  // Mettre à jour le compteur
  const counterNumber = counter.querySelector('.counter-number');
  counterNumber.textContent = files.length;
  counterNumber.style.animation = 'none';
  setTimeout(() => {
    counterNumber.style.animation = 'iconPulse 2s ease-in-out infinite';
  }, 10);
  
  // Vider la preview
  preview.innerHTML = '';
  
  // Créer les miniatures
  files.forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const previewItem = document.createElement('div');
      previewItem.className = 'preview-item';
      previewItem.style.animationDelay = `${index * 0.05}s`;
      
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = file.name;
      img.title = file.name;
      
      previewItem.appendChild(img);
      preview.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
  });
}

// ============================================
// VÉRIFICATION DU BOUTON
// ============================================
function checkStartButton() {
  if (filleulsFiles.length > 0 && parrainsFiles.length > 0) {
    startBtn.disabled = false;
    startBtn.style.animation = 'buttonEntrance 0.5s ease-out, iconPulse 2s ease-in-out infinite 0.5s';
  } else {
    startBtn.disabled = true;
  }
}

// ============================================
// LANCEMENT DE LA CÉRÉMONIE
// ============================================
startBtn.addEventListener('click', async () => {
  if (filleulsFiles.length === 0 || parrainsFiles.length === 0) {
    alert('⚠️ Veuillez charger les photos des filleuls et des parrains');
    return;
  }
  
  // Désactiver le bouton pendant le traitement
  startBtn.disabled = true;
  const originalText = startBtn.querySelector('.button-text').textContent;
  
  try {
    // Afficher la progression
    startBtn.querySelector('.button-text').textContent = 'PRÉPARATION...';
    
    // Convertir les fichiers en données utilisables
    startBtn.querySelector('.button-text').textContent = `CHARGEMENT FILLEULS (0/${filleulsFiles.length})`;
    const filleulsData = await convertFilesWithProgress(filleulsFiles, 'filleuls', startBtn);
    
    startBtn.querySelector('.button-text').textContent = `CHARGEMENT PARRAINS (0/${parrainsFiles.length})`;
    const parrainsData = await convertFilesWithProgress(parrainsFiles, 'parrains', startBtn);
    
    // Sauvegarder dans IndexedDB
    startBtn.querySelector('.button-text').textContent = 'SAUVEGARDE...';
    await saveToIndexedDB('filleuls', filleulsData);
    await saveToIndexedDB('parrains', parrainsData);
    
    console.log(`✅ ${filleulsData.length} filleuls et ${parrainsData.length} parrains chargés`);
    
    // Animation de transition
    startBtn.querySelector('.button-text').textContent = 'DÉMARRAGE...';
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '0';
    
    setTimeout(() => {
      window.location.href = 'ceremony.html';
    }, 500);
    
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    alert('⚠️ Erreur lors du chargement des photos. Essayez avec moins de photos ou des images plus petites.');
    startBtn.disabled = false;
    startBtn.querySelector('.button-text').textContent = originalText;
  }
});

// ============================================
// CONVERSION AVEC PROGRESSION
// ============================================
async function convertFilesWithProgress(files, type, button) {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const data = await fileToData(files[i]);
    results.push(data);
    
    // Mettre à jour la progression
    if (button) {
      button.querySelector('.button-text').textContent = 
        `CHARGEMENT ${type.toUpperCase()} (${i + 1}/${files.length})`;
    }
  }
  
  return results;
}

// ============================================
// SAUVEGARDE DANS INDEXEDDB
// ============================================
function saveToIndexedDB(type, data) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['photos'], 'readwrite');
    const store = transaction.objectStore('photos');
    
    const request = store.put({ type: type, data: data });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// CONVERSION FICHIER → DONNÉES
// ============================================
function fileToData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      // Extraire le nom sans l'extension
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      
      resolve({
        name: nameWithoutExt,
        url: e.target.result,
        originalName: file.name
      });
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================
// EFFETS VISUELS SUPPLÉMENTAIRES
// ============================================

// Animation au chargement
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  }, 100);
});

// Message de console stylisé
console.log(
  '%c🎓 Configuration Cérémonie AE2I',
  'font-size: 24px; font-weight: bold; color: #F5B301; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
);
console.log(
  '%c✨ Système de chargement de photos',
  'font-size: 14px; color: #0F5CA8;'
);

// Raccourci clavier
document.addEventListener('keydown', (e) => {
  if (e.code === 'Enter' && !startBtn.disabled) {
    startBtn.click();
  }
});