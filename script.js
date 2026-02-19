(() => {
    'use strict';

    const FLOW_KEY = 'contactoV2:flowToken';
    const FLOW_TIME_KEY = 'contactoV2:submittedAt';
    const FLOW_TTL_MS = 15 * 60 * 1000;
    const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign'];

    const CHANNEL_LINKS = {
        whatsapp: 'https://wa.me/56900000000?text=Hola%20Ignacio,%20quiero%20cotizar%20una%20web',
        instagram: 'https://instagram.com/ignacio.rojas.dev'
    };

    const PAYMENT_LINKS = {
        start: 'https://mpago.la/1StartCLP',
        growth: 'https://mpago.la/1GrowthCLP',
        scale: 'https://mpago.la/1ScaleCLP',
        ecommerce: 'https://mpago.la/1EcommerceCLP'
    };

    let scene;
    let camera;
    let renderer;
    let cityGroup;

    function initBackgroundScene() {
        if (!window.THREE) return;

        const canvasContainer = document.getElementById('canvas-container');
        if (!canvasContainer) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x060b19);
        scene.fog = new THREE.Fog(0x060b19, 10, 55);

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;
        camera.position.y = 15;
        camera.lookAt(0, 0, 0);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
        renderer.setSize(window.innerWidth, window.innerHeight);
        canvasContainer.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0x3f5c92, 1.35);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x46b3ff, 1, 120);
        pointLight.position.set(10, 20, 10);
        scene.add(pointLight);

        cityGroup = new THREE.Group();
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x11203f, shininess: 90 });

        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const buildingCount = isMobile ? 80 : 160;

        for (let i = 0; i < buildingCount; i += 1) {
            const building = new THREE.Mesh(geometry, material);
            building.position.x = (Math.random() - 0.5) * 60;
            building.position.z = (Math.random() - 0.5) * 60;

            const height = Math.random() * 10 + 1;
            building.scale.set(Math.random() * 2 + 1, height, Math.random() * 2 + 1);
            building.position.y = height / 2;
            cityGroup.add(building);
        }

        scene.add(cityGroup);
        window.addEventListener('resize', onWindowResize);
        animate();
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        if (!renderer || !scene || !camera || !cityGroup) return;
        requestAnimationFrame(animate);
        cityGroup.rotation.y += 0.0009;
        renderer.render(scene, camera);
    }

    function createFlowToken() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    }

    function showInvalidFlowWarning() {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('flow') !== 'invalid') return;
        const warning = document.getElementById('flow-warning');
        if (warning) warning.hidden = false;
    }

    function persistUtmParams() {
        const queryParams = new URLSearchParams(window.location.search);
        UTM_FIELDS.forEach((field) => {
            const value = queryParams.get(field);
            if (value) {
                sessionStorage.setItem(`lead:${field}`, value.slice(0, 120));
            }
        });
    }

    function fillUtmFields() {
        UTM_FIELDS.forEach((field) => {
            const input = document.getElementById(field);
            if (!input) return;
            const storedValue = sessionStorage.getItem(`lead:${field}`);
            if (storedValue) input.value = storedValue;
        });
    }


    function wireChannelLinks() {
        const waTop = document.getElementById('waLinkTop');
        const waMain = document.getElementById('waLinkMain');
        const igTop = document.getElementById('igLinkTop');
        const igMain = document.getElementById('igLinkMain');

        if (waTop) waTop.href = CHANNEL_LINKS.whatsapp;
        if (waMain) waMain.href = CHANNEL_LINKS.whatsapp;
        if (igTop) igTop.href = CHANNEL_LINKS.instagram;
        if (igMain) igMain.href = CHANNEL_LINKS.instagram;
    }

    function wirePaymentLinks() {
        const buttons = document.querySelectorAll('.pay-button[data-plan]');
        buttons.forEach((btn) => {
            const plan = btn.getAttribute('data-plan');
            const link = plan ? PAYMENT_LINKS[plan] : null;
            if (link) {
                btn.setAttribute('href', link);
            } else {
                btn.setAttribute('href', CHANNEL_LINKS.whatsapp);
            }
        });
    }

    function markContactIntent() {
        const form = document.getElementById('contactoForm');
        if (!form) return;

        const flowTokenInput = document.getElementById('flowToken');
        const submitBtn = document.getElementById('submitBtn');

        form.addEventListener('submit', (event) => {
            if (!form.checkValidity()) {
                event.preventDefault();
                form.reportValidity();
                return;
            }

            const flowToken = createFlowToken();
            const submittedAt = Date.now();
            sessionStorage.setItem(FLOW_KEY, flowToken);
            sessionStorage.setItem(FLOW_TIME_KEY, String(submittedAt));

            if (flowTokenInput) flowTokenInput.value = flowToken;
            form.action = `gracias.html?st=${encodeURIComponent(flowToken)}`;

            if (submitBtn) {
                submitBtn.textContent = 'Enviando...';
                submitBtn.setAttribute('aria-disabled', 'true');
            }
        });

        showInvalidFlowWarning();
        persistUtmParams();
        fillUtmFields();
    }

    function validateThanksPageEntry() {
        const isThanksPage = window.location.pathname.endsWith('/gracias.html') || window.location.pathname.endsWith('gracias.html');
        if (!isThanksPage) return;

        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get('st');
        const tokenFromSession = sessionStorage.getItem(FLOW_KEY);
        const submittedAtRaw = sessionStorage.getItem(FLOW_TIME_KEY);
        const submittedAt = Number(submittedAtRaw);
        const withinTtl = Number.isFinite(submittedAt) && Date.now() - submittedAt <= FLOW_TTL_MS;

        if (!tokenFromUrl || tokenFromUrl !== tokenFromSession || !withinTtl) {
            window.location.replace('index.html?flow=invalid#contacto');
            return;
        }

        sessionStorage.removeItem(FLOW_KEY);
        sessionStorage.removeItem(FLOW_TIME_KEY);
        window.history.replaceState({}, document.title, 'gracias.html');
    }

    document.addEventListener('DOMContentLoaded', () => {
        initBackgroundScene();
        wireChannelLinks();
        wirePaymentLinks();
        markContactIntent();
        validateThanksPageEntry();
    });
})();
