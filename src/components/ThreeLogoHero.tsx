'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeLogoHeroProps {
  isDark?: boolean;
  className?: string;
}

export default function ThreeLogoHero({ isDark = true, className = '' }: ThreeLogoHeroProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    let animationFrameId: number;
    let isVisible = true;

    // Scene setup
    const scene = new THREE.Scene();

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Root 3D Pivot Group
    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    // Studio Lights
    const ambientLight = new THREE.AmbientLight(isDark ? 0x2a0810 : 0xf4f1eb, isDark ? 1.4 : 2.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, isDark ? 2.2 : 2.8);
    dirLight.position.set(3, 4, 4);
    scene.add(dirLight);

    // Blood-red Rim Light
    const rimLightLeft = new THREE.PointLight(0xdc2626, isDark ? 5.5 : 3.5, 12);
    rimLightLeft.position.set(-3.5, 1.5, -0.5);
    scene.add(rimLightLeft);

    const rimLightRight = new THREE.PointLight(0xb91c1c, isDark ? 4.5 : 2.5, 12);
    rimLightRight.position.set(3.5, -1.5, -0.5);
    scene.add(rimLightRight);

    // Dynamic Cursor Specular Glint Light
    const cursorLight = new THREE.PointLight(0xffffff, isDark ? 3.8 : 2.5, 8);
    cursorLight.position.set(0, 0, 2.5);
    scene.add(cursorLight);

    // Load Pure 3D Logo Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/assets/generated/logo_3d_pure.webp',
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;

        const imgAspect = texture.image.width / texture.image.height;
        const planeHeight = 2.4;
        const planeWidth = planeHeight * imgAspect;

        // Front Face Material (Metallic sheen & clearcoat gloss)
        const frontMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.015,
          roughness: 0.22,
          metalness: 0.78,
          side: THREE.DoubleSide,
        });

        const frontGeo = new THREE.PlaneGeometry(planeWidth, planeHeight, 32, 32);
        const frontMesh = new THREE.Mesh(frontGeo, frontMaterial);
        frontMesh.position.z = 0.05;
        emblemGroup.add(frontMesh);

        // Multi-Layer Depth Slabs (Creates authentic physical thickness)
        const depthLayers = 4;
        const slabMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.02,
          color: isDark ? 0x1f0408 : 0x450a0a,
        });

        for (let i = 1; i <= depthLayers; i++) {
          const slabMesh = new THREE.Mesh(frontGeo, slabMaterial);
          slabMesh.position.z = 0.05 - i * 0.035;
          emblemGroup.add(slabMesh);
        }
      },
      undefined,
      () => {
        // Fallback if texture fails
        setWebglSupported(false);
      }
    );

    // Floating 3D Halo Ring (Luxury Syndicate Trophy Aesthetic)
    const ringGeo = new THREE.TorusGeometry(1.65, 0.018, 16, 90);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0x991b1b,
      emissiveIntensity: isDark ? 0.45 : 0.25,
      metalness: 0.9,
      roughness: 0.15,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3.2;
    scene.add(ringMesh);

    // Subtle 3D Floating Ember Particles
    const particleCount = 45;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 5;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3;
      particleSpeeds[i] = 0.003 + Math.random() * 0.006;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: isDark ? 0xef4444 : 0xb91c1c,
      size: 0.04,
      transparent: true,
      opacity: isDark ? 0.75 : 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // Interaction State
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      mouseX = normX;
      mouseY = normY;

      targetRotationY = normX * 0.45; // Max horizontal tilt ~25 deg
      targetRotationX = -normY * 0.35; // Max vertical tilt ~20 deg

      // Move specular glint light
      cursorLight.position.x = normX * 2.5;
      cursorLight.position.y = normY * 2.0;
    };

    const handlePointerLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
      cursorLight.position.set(0, 0, 2.5);
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mouseleave', handlePointerLeave);
    container.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };
    window.addEventListener('resize', handleResize);

    // Visibility Observer (Pause render loop when scrolled out of view = 0% GPU)
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // Animation Render Loop
    let clock = new THREE.Clock();
    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Inertia Damping
      emblemGroup.rotation.y += (targetRotationY - emblemGroup.rotation.y) * 0.08;
      emblemGroup.rotation.x += (targetRotationX - emblemGroup.rotation.x) * 0.08;

      // Gentle Organic Breathing Float
      emblemGroup.position.y = Math.sin(time * 1.6) * 0.09;
      emblemGroup.rotation.z = Math.sin(time * 0.8) * 0.02;

      // Ring Orbit
      ringMesh.rotation.z = time * 0.25;
      ringMesh.rotation.y = Math.sin(time * 0.5) * 0.15;

      // Drift Particles Upward
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleSpeeds[i];
        if (positions[i * 3 + 1] > 2.5) {
          positions[i * 3 + 1] = -2.5;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    render();

    // Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mouseleave', handlePointerLeave);
      container.removeEventListener('touchmove', handlePointerMove);

      scene.clear();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  if (!webglSupported) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <img
          src="/assets/generated/logo_3d_pure.webp"
          alt="4BLOODS GANG Official 3D Crest"
          className="w-full max-w-[440px] h-auto object-contain drop-shadow-[0_20px_40px_rgba(220,38,38,0.35)]"
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      data-testid="three-logo-hero"
      className={`relative w-full h-[380px] sm:h-[450px] lg:h-[500px] xl:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {/* Subtle Crimson Vignette / Radial Glow Behind 3D Canvas */}
      <div
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(220,38,38,0.22) 0%, rgba(220,38,38,0) 65%)'
            : 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, rgba(220,38,38,0) 65%)',
        }}
        className="absolute inset-4 rounded-full pointer-events-none -z-10"
      />
    </div>
  );
}
