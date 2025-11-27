// Configuración básica de Three.js
let scene, camera, renderer, cityGroup;

function init() {
    // 1. Crear la escena
    scene = new THREE.Scene();
    // Color de fondo y niebla para dar profundidad atmosférica (un tono azulado oscuro)
    scene.background = new THREE.Color(0x050510);
    scene.fog = new THREE.Fog(0x050510, 10, 50);

    // 2. Crear la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    camera.position.y = 15;
    camera.lookAt(0, 0, 0);

    // 3. El renderizador (lo que dibuja en el HTML)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 4. Iluminación
    const ambientLight = new THREE.AmbientLight(0x404040, 2); // Luz ambiental suave
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d2ff, 1, 100); // Luz azul neón
    pointLight.position.set(10, 20, 10);
    scene.add(pointLight);

    // 5. Generar la Ciudad Abstracta
    cityGroup = new THREE.Group();
    
    // Geometría básica para un edificio (un cubo)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    // Material básico que reacciona a la luz
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x222244, // Color base oscuro para los edificios
        shininess: 100   // Un poco de brillo
    });

    // Creamos 200 edificios en un bucle
    for (let i = 0; i < 200; i++) {
        const building = new THREE.Mesh(geometry, material);
        
        // Posición aleatoria en el suelo (plano XZ)
        building.position.x = (Math.random() - 0.5) * 60;
        building.position.z = (Math.random() - 0.5) * 60;
        building.position.y = 0; // Empiezan a nivel del suelo

        // Escala aleatoria para altura (Y) y anchura (X, Z)
        const height = Math.random() * 10 + 1; // Altura entre 1 y 11
        building.scale.set(
            Math.random() * 2 + 1, // Ancho aleatorio
            height,
            Math.random() * 2 + 1  // Profundidad aleatoria
        );
        
        // Ajustamos la posición Y para que la base del edificio esté en el suelo
        building.position.y = height / 2;

        cityGroup.add(building);
    }
    scene.add(cityGroup);

    // Evento para ajustar si cambian el tamaño de la ventana
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// Función para manejar el redimensionamiento de la ventana
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Bucle de animación (se ejecuta 60 veces por segundo aprox)
function animate() {
    requestAnimationFrame(animate);

    // Hacemos que la ciudad rote lentamente para darle vida
    cityGroup.rotation.y += 0.001;

    // Renderizamos la escena
    renderer.render(scene, camera);
}

// Iniciar todo
init();