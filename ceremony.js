// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  countdownDuration: 5,
  suspenseDuration: 3000,
  suspenseSpeed: 100,
  revealDelay: 800,
  confettiCount: 250
};

// Chargement des données depuis localStorage
let filleuls = [];
let parrains = [];

try {
  const filleulsData = localStorage.getItem('filleulsData');
  const parrainsData = localStorage.getItem('parrainsData');
  
  if (filleulsData) filleuls = JSON.parse(filleulsData);
  if (parrainsData) parrains = JSON.parse(parrainsData);
  
  // Vérifier que les données sont présentes
  if (filleuls.length === 0 || parrains.length === 0) {
    alert('⚠️ Aucune donnée trouvée. Redirection vers la page de configuration...');
    window.location.href = 'index.html';
  }
} catch (error) {
  console.error('Erreur de chargement des données:', error);
  alert('⚠️ Erreur de chargement. Veuillez recharger les photos.');
  window.location.href = 'index.html';
}

// Copie de travail des listes
let availableFilleuls = [...filleuls];
let availableParrains = [...parrains];

// ============================================
// ÉLÉMENTS DOM
// ============================================
const drawBtn = document.getElementById('drawBtn');
const countdown = document.getElementById('countdown');
const countdownNumber = countdown.querySelector('.countdown-number');
const filleulCard = document.getElementById('filleulCard');
const parrainCard = document.getElementById('parrainCard');
const suspenseSound = document.getElementById('suspenseSound');
const revealSound = document.getElementById('revealSound');
const confettiCanvas = document.getElementById('confetti-canvas');

// ============================================
// GESTION DU TIRAGE
// ============================================
let isDrawing = false;

drawBtn.addEventListener('click', startDraw);

async function startDraw() {
  if (isDrawing) return;
  
  // Vérifier s'il reste des participants
  if (availableFilleuls.length === 0 || availableParrains.length === 0) {
    showEndMessage();
    return;
  }
  
  isDrawing = true;
  drawBtn.disabled = true;
  drawBtn.style.opacity = '0.6';
  
  // Réinitialiser les cartes
  filleulCard.classList.remove('revealed');
  parrainCard.classList.remove('revealed');
  
  // Jouer le son de suspense
  if (suspenseSound) {
    suspenseSound.currentTime = 0;
    suspenseSound.play().catch(e => console.log('Audio play failed:', e));
  }
  
  // Lancer le compte à rebours
  await runCountdown();
  
  // Phase de suspense avec défilement rapide des photos
  await suspenseAnimation();
  
  // Révéler les cartes
  const pair = await revealCards();
  
  // Retirer les participants sélectionnés des listes
  removeFromLists(pair.filleul, pair.parrain);
  
  // Lancer les confettis
  launchConfetti();
  
  // Jouer le son de révélation
  if (revealSound) {
    revealSound.currentTime = 0;
    revealSound.play().catch(e => console.log('Audio play failed:', e));
  }
  
  // Mettre à jour le texte du bouton
  updateButtonText();
  
  // Réactiver le bouton après un délai
  setTimeout(() => {
    isDrawing = false;
    drawBtn.disabled = false;
    drawBtn.style.opacity = '1';
  }, 5000);
}

// ============================================
// COMPTE À REBOURS
// ============================================
function runCountdown() {
  return new Promise((resolve) => {
    let count = CONFIG.countdownDuration;
    countdown.classList.add('active');
    countdownNumber.textContent = count;
    
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNumber.textContent = count;
        // Animation de pulsation
        countdownNumber.style.animation = 'none';
        setTimeout(() => {
          countdownNumber.style.animation = 'countdownPulse 1s ease-in-out';
        }, 10);
      } else {
        clearInterval(interval);
        countdown.classList.remove('active');
        resolve();
      }
    }, 1000);
  });
}

// ============================================
// ANIMATION DE SUSPENSE
// ============================================
function suspenseAnimation() {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    // Préparer les cartes
    filleulCard.classList.add('show');
    parrainCard.classList.add('show');
    
    const interval = setInterval(() => {
      // Afficher des photos aléatoires qui défilent
      const randomFilleul = availableFilleuls[Math.floor(Math.random() * availableFilleuls.length)];
      const randomParrain = availableParrains[Math.floor(Math.random() * availableParrains.length)];
      
      updateCardQuick(filleulCard, randomFilleul);
      updateCardQuick(parrainCard, randomParrain);
      
      // Arrêter après la durée configurée
      if (Date.now() - startTime >= CONFIG.suspenseDuration) {
        clearInterval(interval);
        resolve();
      }
    }, CONFIG.suspenseSpeed);
  });
}

// Mise à jour rapide pour l'animation de suspense
function updateCardQuick(card, person) {
  const cardImage = card.querySelector('.card-image');
  const cardName = card.querySelector('.card-name');
  
  if (person.url) {
    cardImage.innerHTML = `<img src="${person.url}" alt="${person.name}">`;
  }
  cardName.textContent = person.name;
}

// ============================================
// RÉVÉLATION DES CARTES
// ============================================
async function revealCards() {
  // Sélection aléatoire
  const filleulIndex = Math.floor(Math.random() * availableFilleuls.length);
  const parrainIndex = Math.floor(Math.random() * availableParrains.length);
  
  const selectedFilleul = availableFilleuls[filleulIndex];
  const selectedParrain = availableParrains[parrainIndex];
  
  // Mise à jour de la carte filleul avec animation
  updateCard(filleulCard, selectedFilleul);
  filleulCard.classList.add('revealed');
  
  // Attendre un peu avant de révéler le parrain
  await wait(CONFIG.revealDelay);
  
  // Mise à jour de la carte parrain avec animation
  updateCard(parrainCard, selectedParrain);
  parrainCard.classList.add('revealed');
  
  return {
    filleul: selectedFilleul,
    parrain: selectedParrain
  };
}

function updateCard(card, person) {
  const cardImage = card.querySelector('.card-image');
  const cardName = card.querySelector('.card-name');
  const cardPromo = card.querySelector('.card-promo');
  
  // Mise à jour du nom
  cardName.textContent = person.name;
  cardPromo.textContent = person.promo || '';
  
  // Afficher la photo
  if (person.url) {
    cardImage.innerHTML = `<img src="${person.url}" alt="${person.name}">`;
  } else {
    // Fallback si pas d'image
    const colors = [
      'linear-gradient(135deg, rgba(15, 92, 168, 0.4), rgba(245, 179, 1, 0.4))',
      'linear-gradient(135deg, rgba(245, 179, 1, 0.4), rgba(15, 92, 168, 0.4))',
      'linear-gradient(135deg, rgba(15, 92, 168, 0.3), rgba(255, 214, 90, 0.3))'
    ];
    const randomGradient = colors[Math.floor(Math.random() * colors.length)];
    cardImage.style.background = randomGradient;
    cardImage.innerHTML = '<div class="placeholder-icon">👤</div>';
  }
}

// ============================================
// GESTION DES LISTES
// ============================================
function removeFromLists(filleul, parrain) {
  // Retirer le filleul de la liste
  availableFilleuls = availableFilleuls.filter(f => f !== filleul);
  
  // Retirer le parrain de la liste
  availableParrains = availableParrains.filter(p => p !== parrain);
  
  // Log pour debug
  console.log(`✅ Paire formée: ${filleul.name} ← → ${parrain.name}`);
  console.log(`📊 Restants: ${availableFilleuls.length} filleuls, ${availableParrains.length} parrains`);
}

// ============================================
// MISE À JOUR DU BOUTON
// ============================================
function updateButtonText() {
  const remaining = Math.min(availableFilleuls.length, availableParrains.length);
  
  if (remaining === 0) {
    drawBtn.querySelector('.button-text').textContent = 'CÉRÉMONIE TERMINÉE 🎉';
  } else if (remaining === 1) {
    drawBtn.querySelector('.button-text').textContent = 'DERNIER TIRAGE';
  } else {
    drawBtn.querySelector('.button-text').textContent = `PROCHAIN TIRAGE (${remaining} restants)`;
  }
}

// ============================================
// MESSAGE DE FIN
// ============================================
function showEndMessage() {
  // Masquer les cartes avec animation
  filleulCard.style.transition = 'all 1s ease';
  parrainCard.style.transition = 'all 1s ease';
  filleulCard.style.opacity = '0';
  parrainCard.style.opacity = '0';
  filleulCard.style.transform = 'scale(0.8)';
  parrainCard.style.transform = 'scale(0.8)';
  
  // Afficher le message de fin
  setTimeout(() => {
    countdown.classList.add('active');
    countdownNumber.textContent = '🎊';
    countdownNumber.style.fontSize = '150px';
    
    // Créer un message de fin
    const endMessage = document.createElement('div');
    endMessage.style.cssText = `
      position: fixed;
      top: 60%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 150;
      animation: titleEntrance 1s ease-out;
    `;
    endMessage.innerHTML = `
      <h2 style="font-size: 48px; margin-bottom: 20px; color: #F5B301;">
        Cérémonie Terminée !
      </h2>
      <p style="font-size: 24px; color: rgba(255,255,255,0.9); margin-bottom: 30px;">
        Tous les parrainages ont été attribués
      </p>
      <button onclick="window.location.href='index.html'" style="
        padding: 20px 50px;
        font-size: 20px;
        border-radius: 50px;
        background: linear-gradient(135deg, #F5B301, #FFD65A);
        border: none;
        cursor: pointer;
        color: #020B1A;
        font-weight: 700;
        box-shadow: 0 10px 40px rgba(245, 179, 1, 0.5);
      ">
        🔄 Nouvelle Cérémonie
      </button>
    `;
    document.body.appendChild(endMessage);
    
    // Lancer des confettis
    launchConfetti();
    launchConfetti();
  }, 500);
  
  drawBtn.style.display = 'none';
}

// ============================================
// SYSTÈME DE CONFETTIS
// ============================================
function launchConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  
  const confettiColors = ['#0F5CA8', '#F5B301', '#FFD65A', '#1A7BC4', '#FFFFFF'];
  const confetti = [];
  
  // Créer les confettis
  for (let i = 0; i < CONFIG.confettiCount; i++) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: -20,
      size: Math.random() * 8 + 4,
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 2,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }
  
  // Animation des confettis
  function animateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    let allOffScreen = true;
    
    confetti.forEach((c, index) => {
      // Mise à jour de la position
      c.y += c.speedY;
      c.x += c.speedX;
      c.rotation += c.rotationSpeed;
      
      // Réduction de l'opacité vers la fin
      if (c.y > confettiCanvas.height - 200) {
        c.opacity -= 0.02;
      }
      
      // Vérifier si toujours à l'écran
      if (c.y < confettiCanvas.height + 20 && c.opacity > 0) {
        allOffScreen = false;
      }
      
      // Dessiner le confetti
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate((c.rotation * Math.PI) / 180);
      ctx.globalAlpha = c.opacity;
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
      ctx.restore();
    });
    
    // Continuer l'animation ou arrêter
    if (!allOffScreen) {
      requestAnimationFrame(animateConfetti);
    } else {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }
  
  animateConfetti();
}

// ============================================
// UTILITAIRES
// ============================================
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Redimensionnement du canvas
window.addEventListener('resize', () => {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
});

// ============================================
// EFFETS SUPPLÉMENTAIRES
// ============================================

// Effet de parallaxe sur les cartes au mouvement de la souris
document.addEventListener('mousemove', (e) => {
  const cards = document.querySelectorAll('.card-wrapper');
  const mouseX = e.clientX / window.innerWidth - 0.5;
  const mouseY = e.clientY / window.innerHeight - 0.5;
  
  cards.forEach((card, index) => {
    const direction = index === 0 ? 1 : -1;
    const moveX = mouseX * 20 * direction;
    const moveY = mouseY * 20;
    
    card.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });
});

// Animation du logo au survol
const logo = document.querySelector('.main-logo');
if (logo) {
  logo.addEventListener('mouseenter', () => {
    logo.style.transform = 'scale(1.1) rotate(5deg)';
  });
  
  logo.addEventListener('mouseleave', () => {
    logo.style.transform = 'scale(1) rotate(0deg)';
  });
}

// Gestion des touches clavier
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !isDrawing) {
    e.preventDefault();
    startDraw();
  }
});

// Message de console stylisé
console.log(
  '%c🎓 Cérémonie de Parrainage AE2I',
  'font-size: 24px; font-weight: bold; color: #F5B301; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);'
);
console.log(
  '%c✨ Interface développée pour l\'Association des Élèves Ingénieurs en Informatique',
  'font-size: 14px; color: #0F5CA8;'
);

// Initialiser le texte du bouton
updateButtonText();