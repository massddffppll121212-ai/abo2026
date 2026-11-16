import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeDBackgroundCanvasProps {
  enabled?: boolean;
}

export const ThreeDBackgroundCanvas: React.FC<ThreeDBackgroundCanvasProps> = ({ enabled = true }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL safely
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xFFFDF7, 0.025);

    // 2. Camera Setup
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffbd59, 1.8);
    dirLight1.position.set(8, 12, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-8, -6, 8);
    scene.add(dirLight2);

    // 5. Create 3D Floating Spatial Objects (Gems, Spheres, Toruses, Rings)
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);

    // Color palette for 2026-Gen futuristic theme
    const colors = [0xFF6B6B, 0x4D96FF, 0x6BCB77, 0xFFD93D, 0x9B51E0, 0xFF9F43, 0x06B6D4];

    // Create 18 floating 3D shapes
    const shapes: THREE.Mesh[] = [];
    const geometries = [
      new THREE.IcosahedronGeometry(0.6, 0),
      new THREE.TorusGeometry(0.5, 0.2, 16, 32),
      new THREE.OctahedronGeometry(0.7, 0),
      new THREE.DodecahedronGeometry(0.65, 0),
      new THREE.SphereGeometry(0.55, 24, 24),
      new THREE.TorusKnotGeometry(0.4, 0.15, 64, 16),
    ];

    for (let i = 0; i < 18; i++) {
      const geom = geometries[i % geometries.length];
      const color = colors[i % colors.length];

      const mat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.6,
        transparent: true,
        opacity: 0.82,
      });

      const mesh = new THREE.Mesh(geom, mat);

      // Random 3D spatial position
      mesh.position.set(
        (Math.random() - 0.5) * 18,
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10 - 2
      );

      // Random scale & rotation
      const s = 0.5 + Math.random() * 0.7;
      mesh.scale.set(s, s, s);

      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      // Store initial float parameters
      mesh.userData = {
        initialY: mesh.position.y,
        speedY: 0.5 + Math.random() * 0.8,
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        phase: Math.random() * Math.PI * 2,
      };

      shapes.push(mesh);
      objectsGroup.add(mesh);
    }

    // 6. Mouse / Pointer 3D Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      mouseX = (clientX / window.innerWidth - 0.5) * 2;
      mouseY = (clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('pointermove', handlePointerMove);

    // 7. Animation Loop
    let animFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax easing
      targetX += (mouseX * 1.5 - targetX) * 0.05;
      targetY += (-mouseY * 1.5 - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(0, 0, 0);

      // Animate floating 3D shapes
      shapes.forEach((mesh) => {
        const u = mesh.userData;
        mesh.position.y = u.initialY + Math.sin(elapsedTime * u.speedY + u.phase) * 0.4;
        mesh.rotation.x += u.rotSpeedX;
        mesh.rotation.y += u.rotSpeedY;
      });

      // Slowly rotate objects group
      objectsGroup.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
      animFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 8. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometries.forEach((g) => g.dispose());
      renderer.dispose();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80 transition-opacity duration-700"
    />
  );
};
