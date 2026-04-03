import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.z = 30

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const particleCount = 120
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 80
    }
    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x6c63ff,
      size: 0.25,
      transparent: true,
      opacity: 0.7,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    const shapes = []
    const geometries = [
      new THREE.TetrahedronGeometry(1.2),
      new THREE.OctahedronGeometry(1),
      new THREE.IcosahedronGeometry(0.9),
      new THREE.TorusGeometry(0.8, 0.25, 8, 16),
    ]
    const baseMat = new THREE.MeshBasicMaterial({
      color: 0x6c63ff,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    })

    for (let i = 0; i < 12; i++) {
      const geo = geometries[i % geometries.length]
      const mesh = new THREE.Mesh(geo, baseMat.clone())
      mesh.position.set(
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20
      )
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      )
      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.003,
        speedY: (Math.random() - 0.5) * 0.003,
        speedZ: (Math.random() - 0.5) * 0.002,
        floatSpeed: Math.random() * 0.0008 + 0.0004,
        floatOffset: Math.random() * Math.PI * 2,
      }
      scene.add(mesh)
      shapes.push(mesh)
    }

    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      targetX += (mouseX - targetX) * 0.04
      targetY += (mouseY - targetY) * 0.04

      particles.rotation.y = elapsed * 0.03
      particles.rotation.x = elapsed * 0.01

      shapes.forEach((mesh) => {
        const { speedX, speedY, speedZ, floatSpeed, floatOffset } = mesh.userData
        mesh.rotation.x += speedX
        mesh.rotation.y += speedY
        mesh.rotation.z += speedZ
        mesh.position.y += Math.sin(elapsed * floatSpeed * 60 + floatOffset) * 0.005
      })

      camera.position.x += (targetX * 3 - camera.position.x) * 0.05
      camera.position.y += (-targetY * 2 - camera.position.y) * 0.05
      camera.lookAt(scene.position)

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
