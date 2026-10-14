'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const CREST_SRC = '/assets/generated/crest_v1_3d.webp';

interface ThreeLogoHeroProps {
  isDark?: boolean;
  className?: string;
  /** Fired on click/tap only (not after a drag-spin). */
  onClick?: () => void;
}

/**
 * Builds the crest as a real 3D slab: diamond-shaped extrusion with beveled edges.
 * Shape lives in 0..1 so ExtrudeGeometry's cap UVs map the square crest texture 1:1.
 */
function buildCrestGeometry() {
  const m = 0.012; // inset so transparent image corners never hit the cap
  const shape = new THREE.Shape();
  shape.moveTo(0.5, 1 - m);
  shape.lineTo(1 - m, 0.5);
  shape.lineTo(0.5, m);
  shape.lineTo(m, 0.5);
  shape.closePath();

  const depth = 0.04;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.01,
    bevelSegments: 3,
    curveSegments: 1,
  });

  // Group 0 = both caps. Mirror U on the back cap so the crest reads correctly from behind.
  const caps = geo.groups[0];
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = caps.start; i < caps.start + caps.count; i++) {
    if (pos.getZ(i) < depth / 2) uv.setX(i, 1 - uv.getX(i));
  }
  uv.needsUpdate = true;

  geo.center();
  return geo;
}

export default function ThreeLogoHero({ isDark = true, className = '', onClick }: ThreeLogoHeroProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    try {
      const canvas = document.createElement('canvas');
      if (!(canvas.getContext('webgl2') || canvas.getContext('webgl'))) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    let animationFrameId: number;
    let isVisible = true;

    const scene = new THREE.Scene();
    const width = container.clientWidth || 420;
    const height = container.clientHeight || 420;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.z = 5.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.8 : 2.2);
    keyLight.position.set(2, 3, 5);
    scene.add(keyLight);

    const rimLeft = new THREE.PointLight(0xdc2626, isDark ? 6 : 4, 12);
    rimLeft.position.set(-3.5, 1.5, -1);
    scene.add(rimLeft);

    const rimRight = new THREE.PointLight(0xb91c1c, isDark ? 5 : 3, 12);
    rimRight.position.set(3.5, -1.5, -1);
    scene.add(rimRight);

    // Crest model
    const crestGroup = new THREE.Group();
    scene.add(crestGroup);

    const geometry = buildCrestGeometry();
    const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.45, metalness: 0.35 });
    const faceMaterial = new THREE.MeshStandardMaterial({ roughness: 0.6, metalness: 0 });
    const crestMesh = new THREE.Mesh(geometry, [faceMaterial, sideMaterial]);
    crestMesh.scale.setScalar(3);
    crestGroup.add(crestMesh);

    const texture = new THREE.TextureLoader().load(
      CREST_SRC,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
        faceMaterial.map = tex;
        faceMaterial.needsUpdate = true;
      },
      undefined,
      () => setWebglSupported(false)
    );

    // Soft contact shadow under the floating crest
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d')!;
    const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.4, 0.35);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: isDark ? 0.7 : 0.3,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, -1.85, -0.5);
    scene.add(shadowMesh);

    // Ember particles
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
    scene.add(new THREE.Points(particleGeo, particleMat));

    // Spin state: auto-spin + drag with inertia
    const autoSpeed = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.6; // rad/s
    let spinVelocity = autoSpeed;
    let tiltTarget = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let dragDistance = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      dragDistance = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      container.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      dragDistance += Math.abs(dx) + Math.abs(dy);
      lastX = e.clientX;
      lastY = e.clientY;
      crestGroup.rotation.y += dx * 0.012;
      spinVelocity = dx * 0.6; // fling
      tiltTarget = THREE.MathUtils.clamp(tiltTarget + dy * 0.006, -0.5, 0.5);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      tiltTarget = 0;
      if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
      if (dragDistance < 6) onClickRef.current?.();
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    // Pause render loop when out of view
    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    observer.observe(container);

    const clock = new THREE.Clock();
    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = Math.min(clock.getDelta(), 0.05);
      if (!isVisible) return;
      const time = clock.elapsedTime;

      if (!dragging) {
        spinVelocity += (autoSpeed - spinVelocity) * 0.04; // ease back to auto-spin
        crestGroup.rotation.y += spinVelocity * delta;
      }
      crestGroup.rotation.x += (tiltTarget - crestGroup.rotation.x) * 0.1;
      const float = Math.sin(time * 1.6);
      crestGroup.position.y = float * 0.08;

      // Shadow tightens & darkens as crest dips, spreads & fades as it rises
      shadowMesh.scale.setScalar(1 - float * 0.08);
      shadowMat.opacity = (isDark ? 0.7 : 0.3) * (1 - float * 0.15);

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3 + 1] += particleSpeeds[i];
        if (particlePositions[i * 3 + 1] > 2.5) particlePositions[i * 3 + 1] = -2.5;
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);

      [geometry, shadowGeo, particleGeo].forEach((g) => g.dispose());
      [faceMaterial, sideMaterial, shadowMat, particleMat].forEach((mat) => mat.dispose());
      texture.dispose();
      shadowTex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isDark]);

  if (!webglSupported) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} onClick={onClick}>
        <img
          src={CREST_SRC}
          alt="4BLOODS GANG Official 3D Crest"
          className="w-full h-auto object-contain drop-shadow-[0_20px_40px_rgba(220,38,38,0.35)]"
        />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      data-testid="three-logo-hero"
      role="img"
      aria-label="4BLOODS GANG Official 3D Crest — drag to spin"
      className={`relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none touch-pan-y ${className}`}
    >
      {/* Crimson radial glow behind canvas */}
      <div
        style={{
          background: isDark
            ? 'radial-gradient(circle, rgba(220,38,38,0.25) 0%, rgba(220,38,38,0) 65%)'
            : 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, rgba(220,38,38,0) 65%)',
        }}
        className="absolute inset-4 rounded-full pointer-events-none -z-10"
      />
    </div>
  );
}
