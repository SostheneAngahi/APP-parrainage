// ============================================
// VARIABLES GLOBALES
// ============================================
let filleulsFiles = [];
let parrainsFiles = [];

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
  
  // Animation du bouton
  startBtn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    startBtn.style.transform = 'scale(1)';
  }, 200);
  
  // Convertir les fichiers en données utilisables
  const filleulsData = await Promise.all(
    filleulsFiles.map(file => fileToData(file))
  );
  
  const parrainsData = await Promise.all(
    parrainsFiles.map(file => fileToData(file))
  );
  
  // Sauvegarder dans le localStorage
  localStorage.setItem('filleulsData', JSON.stringify(filleulsData));
  localStorage.setItem('parrainsData', JSON.stringify(parrainsData));
  
  // Redirection avec animation
  document.body.style.transition = 'opacity 0.5s ease';
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    window.location.href = 'ceremony.html';
  }, 500);
});

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