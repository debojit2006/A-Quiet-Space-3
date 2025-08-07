document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let activeFeature = null; // 'breathing', 'words', or 'environment'
    let activeEnvironment = 'sky'; // 'sky', 'mountains', 'beach'
    let breathingInterval = null;
    let environmentIntervals = [];
    const isMobile = window.innerWidth < 768;

    // --- DOM ELEMENTS ---
    const appContainer = document.getElementById('app-container');
    const breatheBtn = document.getElementById('breathe-btn');
    const wordsBtn = document.getElementById('words-btn');
    const envBtns = document.querySelectorAll('[data-environment]');
    
    const initialMessage = document.getElementById('initial-message');
    const envInstructions = document.getElementById('environment-instructions');
    const envInstructionsText = document.getElementById('environment-text');

    const breathingFeature = document.getElementById('breathing-feature');
    const kindWordsFeature = document.getElementById('kind-words-feature');
    
    // --- FEATURE ELEMENTS ---
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingInstructions = document.getElementById('breathing-instructions');
    const kindWordText = document.getElementById('kind-word-text');
    const anotherWordBtn = document.getElementById('another-word-btn');
    
    // Wish Modal Elements
    const wishPrompt = document.getElementById('wish-prompt');
    const wishConfirmation = document.getElementById('wish-confirmation');
    const makeWishBtn = document.getElementById('make-wish-btn');
    const wishInput = document.getElementById('wish-input');

    const kindWords = [ "You’re not just studying Computer Science, you’re rewriting your own future with every line of code.", "I see how hard you work, and it inspires me every single day.", "You carry so much strength in your silence and so much fire in your focus.", "Behind every sleepless night, there's a brighter tomorrow waiting just for you.", "Your dedication isn’t ordinary—it’s rare, powerful, and beautiful.", "The world needs more minds like yours—sharp, sincere, and kind.", "Keep going, even when it’s tough—you're closer to your goals than you think.", "Your grind today is the glow-up the future will thank you for.", "You might feel overwhelmed now, but one day you’ll look back and smile at how far you’ve come.", "I know it’s not easy, but I also know you were never meant for the easy path—you were made for greatness.", "You're not just studying code, you're building the foundation for your dreams.", "Every bug you fix, every concept you master is one more proof of how capable you are.", "Don’t let stress make you forget how brilliant you are.", "Even on your worst days, you’re doing more than enough.", "The late nights, the frustration, the doubt—it’s all part of your powerful journey.", "I know it’s exhausting sometimes, but you’re stronger than anything life throws at you.", "You’re not behind—you’re blooming in your own time.", "It's okay to rest, but never forget the fire that made you start.", "You’ve come too far to not be proud of yourself.", "There’s something extraordinary about the way you never give up.", "Not everyone sees how hard you work—but I do, and it amazes me.", "You’re writing your own success story—one challenge at a time.", "Your ambition is magnetic, and your energy is something rare.", "You’re the kind of person who turns stress into strength.", "The way you manage everything—even when it's hard—is a quiet kind of heroism.", "Your mind is powerful, but your heart makes it even more incredible.", "Remember: pressure turns coal into diamonds—and you’re already sparkling.", "You’re not just going through it—you’re growing through it.", "If only you could see yourself through my eyes—you'd see someone unstoppable.", "There’s magic in your persistence. Don’t ever let it fade.", "You’ve got the kind of grit that changes lives—starting with your own.", "Take breaks, but never break down—you’re too brilliant to quit.", "I believe in your journey, even on the days you don’t.", "You’re not meant to be perfect—only persistent.", "When you’re tired, let your dreams rest—but never let them die.", "There’s no shortcut to success, but I see you building the whole road yourself.", "You’re not behind—you’re learning what most never dare to.", "The hard work you’re doing today is shaping a life full of possibilities.", "Some people study; you transform every lesson into power.", "No algorithm can calculate the brilliance of your determination.", "Even machines would admire your logic and your heart.", "Your strength is not in always having the answers, but in never being afraid to seek them.", "I know you’re tired, but that spark in your eyes is still there.", "You’re a storm of intelligence, kindness, and resilience.", "Keep showing up, even when it’s hard—especially then.", "What you’re building matters. You matter.", "When things get hard, remember who you are and why you started.", "I’m proud of your ambition and grateful to know someone so driven.", "Your dreams aren’t just dreams—they’re blueprints for a future only you can build.", "Keep being you—brilliant, hardworking, and truly one of a kind." ];
    let currentWordIndex = 0;

    // --- RENDER & STATE MANAGEMENT ---
    function render() {
        // Stop all ongoing animations and hide all features
        stopAllAnimations();
        initialMessage.classList.add('hidden');
        breathingFeature.classList.add('hidden');
        kindWordsFeature.classList.add('hidden');
        envInstructions.classList.add('hidden');

        // Update button active states
        document.querySelectorAll('.feature-btn').forEach(b => b.classList.remove('active'));
        if (activeFeature === 'breathing') breatheBtn.classList.add('active');
        if (activeFeature === 'words') wordsBtn.classList.add('active');

        // Render the active feature
        if (activeFeature === 'breathing') {
            breathingFeature.classList.remove('hidden');
            startBreathingAnimation();
        } else if (activeFeature === 'words') {
            kindWordsFeature.classList.remove('hidden');
            showNewKindWord();
        } else if (activeFeature === 'environment') {
            document.querySelector(`[data-environment="${activeEnvironment}"]`).classList.add('active');
            envInstructions.classList.remove('hidden');
            startEnvironment(activeEnvironment);
        } else {
            initialMessage.classList.remove('hidden');
        }
    }

    function stopAllAnimations() {
        // Stop breathing animation
        clearInterval(breathingInterval);
        breathingInterval = null;

        // Stop all environment animations
        environmentIntervals.forEach(clearInterval);
        environmentIntervals = [];
        const envContainer = document.querySelector('.environment-container');
        if (envContainer) envContainer.remove();
    }
    
    // --- EVENT LISTENERS ---
    breatheBtn.addEventListener('click', () => {
        activeFeature = activeFeature === 'breathing' ? null : 'breathing';
        render();
    });

    wordsBtn.addEventListener('click', () => {
        activeFeature = activeFeature === 'words' ? null : 'words';
        render();
    });

    envBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const env = btn.dataset.environment;
            activeEnvironment = env;
            activeFeature = 'environment';
            render();
        });
    });

    anotherWordBtn.addEventListener('click', () => {
        if (anotherWordBtn.classList.contains('refreshing')) return;
        anotherWordBtn.classList.add('refreshing');
        showNewKindWord();
        setTimeout(() => anotherWordBtn.classList.remove('refreshing'), 500);
    });
    
    makeWishBtn.addEventListener('click', handleMakeWish);
    wishInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleMakeWish();
    });

    function handleMakeWish() {
        if (wishInput.value.trim()) {
            wishPrompt.classList.add('hidden');
            wishConfirmation.classList.remove('hidden');
            wishInput.value = '';
            setTimeout(() => wishConfirmation.classList.add('hidden'), 3000);
        }
    }

    // --- FEATURE LOGIC ---

    function startBreathingAnimation() {
        if (breathingInterval) return;
        const cycle = [ { text: 'Breathe in slowly...', scale: 1.5, duration: 4000 }, { text: 'Hold...', scale: 1.5, duration: 2000 }, { text: 'Breathe out gently...', scale: 0.8, duration: 6000 }, { text: 'Rest...', scale: 0.8, duration: 2000 } ];
        let currentPhaseIndex = 0;
        const totalCycleTime = cycle.reduce((sum, p) => sum + p.duration, 0);

        function runCycle() {
            const current = cycle[currentPhaseIndex];
            breathingInstructions.classList.add('fade-out');
            setTimeout(() => {
                breathingInstructions.textContent = current.text;
                breathingInstructions.classList.remove('fade-out');
            }, 500);
            breathingCircle.style.transitionDuration = `${current.duration / 1000}s`;
            breathingCircle.style.transform = `scale(${current.scale})`;
            currentPhaseIndex = (currentPhaseIndex + 1) % cycle.length;
        }
        
        function schedulePhases() {
            let cumulativeTime = 0;
            cycle.forEach(phase => {
                setTimeout(runCycle, cumulativeTime);
                cumulativeTime += phase.duration;
            });
        }
        schedulePhases();
        breathingInterval = setInterval(schedulePhases, totalCycleTime);
    }

    function showNewKindWord() {
        let newIndex;
        do { newIndex = Math.floor(Math.random() * kindWords.length); } while (newIndex === currentWordIndex && kindWords.length > 1);
        currentWordIndex = newIndex;
        kindWordText.style.opacity = 0;
        kindWordText.style.transform = 'translateY(20px)';
        setTimeout(() => {
            kindWordText.textContent = kindWords[currentWordIndex];
            kindWordText.style.opacity = 1;
            kindWordText.style.transform = 'translateY(0)';
        }, 300);
    }

    // --- ENVIRONMENT LOGIC ---
    function startEnvironment(envType) {
        const container = document.createElement('div');
        container.className = `environment-container ${envType}-container`;
        
        switch(envType) {
            case 'sky':
                envInstructionsText.textContent = "Gaze at the galaxy and catch a shooting star to make a wish ✨";
                startNightSky(container);
                break;
            case 'mountains':
                envInstructionsText.textContent = "Breathe in the mountain air and watch the clouds drift by 🏔️";
                startMountains(container);
                break;
            case 'beach':
                envInstructionsText.textContent = "Listen to the gentle waves and watch the seagulls soar 🌊";
                startBeach(container);
                break;
        }
        appContainer.prepend(container);
    }

    function createAndAppend(parent, tag, className, styles = {}) {
        const el = document.createElement(tag);
        el.className = className;
        Object.assign(el.style, styles);
        parent.appendChild(el);
        return el;
    }
    
    function addInterval(callback, duration) {
        callback();
        environmentIntervals.push(setInterval(callback, duration));
    }
    
    function startNightSky(sky) {
        const starCount = isMobile ? 75 : 200;
        const galaxyCount = isMobile ? 50 : 100;
        createAndAppend(sky, 'div', 'nebula-cloud', { top: '20%', right: '10%', width: '8rem', height: '8rem', background: 'radial-gradient(ellipse at center, rgba(168, 85, 247, 0.2) 0%, transparent 70%)' });
        for (let i = 0; i < starCount; i++) { createAndAppend(sky, 'div', 'star', { width: `${Math.random()*2+1}px`, height: `${Math.random()*2+1}px`, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDuration: `${3+Math.random()*2}s`, animationDelay: `${Math.random()*5}s`, '--start-opacity': Math.random()*0.7+0.3 }); }
        for (let i = 0; i < galaxyCount; i++) {
             const angle = (i / galaxyCount) * Math.PI * 4; const distance = (i / galaxyCount) * 30;
             createAndAppend(sky, 'div', 'galaxy-particle', { backgroundColor: `hsl(${260 + Math.random()*40}, 70%, 70%)`, left: `${75 + Math.cos(angle) * distance}%`, top: `${25 + Math.sin(angle) * distance * 0.3}%`, width: `${Math.random()*2+1}px`, height: `${Math.random()*2+1}px`, animationDuration: `${4+Math.random()*2}s`, '--start-opacity': Math.random()*0.6+0.2 });
        }
        addInterval(() => {
            const startX = Math.random()*100; const startY = Math.random()*30; const endX = Math.random()*100; const endY = Math.random()*30+70;
            const endTranslate = `translate(${(endX - startX) * window.innerWidth / 100}px, ${(endY - startY) * window.innerHeight / 100}px)`;
            const star = createAndAppend(sky, 'div', 'shooting-star', { left: `${startX}%`, top: `${startY}%`, animationDuration: `${1.5+Math.random()}s`, '--translate-end': endTranslate });
            setTimeout(() => star.remove(), 3000);
            wishPrompt.classList.remove('hidden');
            setTimeout(() => wishPrompt.classList.add('hidden'), 4000);
        }, 12000);
    }

    function startMountains(container) {
        const cloudCount = isMobile ? 4 : 8;
        container.style.background = 'linear-gradient(to bottom, #fde68a, #fbcfe8, #e9d5ff)';
        container.innerHTML = `
            <svg viewBox="0 0 1200 400" style="height: 66.67%; fill: rgba(147, 197, 253, 0.3);"><path d="M0,400 L0,200 Q150,120 300,160 Q450,200 600,140 Q750,80 900,120 Q1050,160 1200,100 L1200,400 Z"></path></svg>
            <svg viewBox="0 0 1200 350" style="height: 60%; fill: rgba(99, 102, 241, 0.4);"><path d="M0,350 L0,250 Q100,180 250,220 Q400,260 550,200 Q700,140 850,180 Q1000,220 1200,160 L1200,350 Z"></path></svg>
            <svg viewBox="0 0 1200 300" style="height: 50%; fill: rgba(79, 70, 229, 0.5);"><path d="M0,300 L0,280 Q120,200 280,240 Q440,280 600,220 Q760,160 920,200 Q1080,240 1200,180 L1200,300 Z"></path></svg>
            <div style="position:absolute; bottom: 25%; left:0; width:100%; height:8rem; background: linear-gradient(to top, rgba(255,255,255,0.1), transparent);"></div>
        `;
        for (let i = 0; i < cloudCount; i++) { createAndAppend(container, 'div', 'mountain-cloud', { width: `${Math.random()*40+20}vw`, height: `${Math.random()*10+5}vh`, left: `${Math.random()*100}vw`, top: `${Math.random()*40+10}%`, opacity: Math.random()*0.4+0.3, animationDuration: `${40+Math.random()*40}s` }); }
        addInterval(() => {
            const bird = createAndAppend(container, 'div', 'mountain-bird', { top: `${Math.random()*30+20}%`, animationDuration: `${30+Math.random()*20}s` });
            bird.innerHTML = `<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M8 0C6 2 4 4 0 6c4 2 6 4 8 6 2-2 4-4 8-6-4-2-6-4-8-6z" /></svg>`;
            setTimeout(() => bird.remove(), 45000);
        }, 20000);
    }

    function startBeach(container) {
        const cloudCount = isMobile ? 3 : 6;
        container.style.background = 'linear-gradient(to bottom, #a5f3fc, #bae6fd, #e0f2fe)';
        createAndAppend(container, 'div', 'ocean'); createAndAppend(container, 'div', 'sand'); createAndAppend(container, 'div', 'sun');
        for (let i = 0; i < 4; i++) {
            const wave = createAndAppend(container, 'svg', 'wave', { height: `${15-i*3}%`, zIndex: 10-i, animationDuration: `${4+Math.random()*2}s`, animationDelay: `${i*0.5}s` });
            wave.setAttribute('viewBox', '0 0 1200 100');
            createAndAppend(wave, 'path', '', { fill: `rgba(59, 130, 246, ${0.3 - i * 0.05})`, animationDuration: `${4+Math.random()*2}s`, animationDelay: `${i*0.5}s` });
        }
        for (let i = 0; i < cloudCount; i++) { createAndAppend(container, 'div', 'beach-cloud', { width: `${Math.random()*30+15}vw`, height: `${Math.random()*8+4}vh`, left: `${Math.random()*100}vw`, top: `${Math.random()*30+5}%`, opacity: Math.random()*0.4+0.6, animationDuration: `${60+Math.random()*40}s` }); }
        addInterval(() => {
            const seagull = createAndAppend(container, 'div', 'seagull', { top: `${Math.random()*40+15}%`, animationDuration: `${20+Math.random()*10}s` });
            seagull.innerHTML = `<svg width="20" height="14" viewBox="0 0 20 14" fill="currentColor"><path d="M10 0C8 3 6 6 0 8c6 2 8 5 10 8 2-3 4-6 10-8-6-2-8-5-10-8z"/></svg>`;
            setTimeout(() => seagull.remove(), 25000);
        }, 10000);
    }

    // Initial Render
    render();
    activeFeature = 'environment';
    render();
});
