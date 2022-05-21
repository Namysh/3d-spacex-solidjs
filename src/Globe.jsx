import { createEffect, onMount } from 'solid-js';
import * as THREE from 'three'
import ThreeGlobe from 'three-globe';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import gsap from "gsap";

export default function Globe (props) {
  let canvas;

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xbbbbbb, 0.3));
  scene.background = new THREE.Color(0x040d21);
  scene.fog = new THREE.Fog(0x535ef3, 400, 2000);

  const camera = new THREE.PerspectiveCamera();
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  camera.position.z = 350;

  const light1 = new THREE.DirectionalLight(0x7982f6, 1);
  light1.position.set(-200, 500, 200);
  camera.add(light1);

  const light2 = new THREE.PointLight(0x8566cc, 0.5);
  light2.position.set(-200, 500, 200);
  camera.add(light2);

  scene.add(camera)

  const renderers = [new THREE.WebGLRenderer(), new CSS2DRenderer()];

  const controls = new OrbitControls(camera, renderers[0].domElement, scene);
  controls.enablePan = false
  controls.maxDistance = 400
  controls.minDistance = 200
  controls.update()

  const Globe = new ThreeGlobe()
    .hexPolygonResolution(3)
    .hexPolygonMargin(0.3)
    .showAtmosphere(true)
    .atmosphereColor("#3a228a")
    .atmosphereAltitude(0.3)
    .hexPolygonColor(() => "rgba(255,255,255, 0.7)")
    .pointAltitude('size')
    .pointColor('color')
    .pointRadius(0.6)
    .htmlElement(d => {
      return <div class="ml-24 bg-white/30 text-white flex flex-col gap-4 p-4  rounded-md  ">
        <h1 class="text-xs font-bold uppercase">launchpad</h1>
        <img src={props.launchpad().images.large} class=" h-24 w-24 rounded-md object-cover" alt="" />
        <span class="font-medium">{props.launchpad().name}</span>
      </div>
    });

  fetch('https://raw.githubusercontent.com/vasturiano/three-globe/master/example/hexed-polygons/ne_110m_admin_0_countries.geojson')
    .then(res => res.json()).then(countries => {
      Globe.hexPolygonsData(countries.features)
    })

  Globe.setPointOfView(camera.position, Globe.position);
  controls.addEventListener('change', () => Globe.setPointOfView(camera.position, Globe.position));

  const globeMaterial = Globe.globeMaterial();
  globeMaterial.color = new THREE.Color(0x3a228a);
  globeMaterial.emissive = new THREE.Color(0x220038);
  globeMaterial.emissiveIntensity = 0.1;
  globeMaterial.shininess = 0.7;

  scene.add(Globe);

  createEffect(() => {
    if (props.launchpad()) {
      light1.intensity = 1

      Globe.pointsData([{
        lat: props.launchpad().latitude,
        lng: props.launchpad().longitude,
        size: 0.05,
        color: 'black',
      },
      ]);

      Globe.htmlElementsData([{
        lat: props.launchpad().latitude,
        lng: props.launchpad().longitude,
        size: 0.05,
        color: 'black',
      },
      ])

      const pointCoords = Globe.getCoords(props.launchpad().latitude, props.launchpad().longitude)

      const startCameraPos = camera.position.clone()

      const camDistance = camera.position.length()
      camera.position.copy(pointCoords).normalize().multiplyScalar(camDistance)

      const endCameraPos = camera.position.clone()
      camera.position.copy(startCameraPos).normalize().multiplyScalar(camDistance)

      gsap.to(camera.position, {
        x: endCameraPos.x, y: endCameraPos.y, z: endCameraPos.z, duration: 1, onUpdate: () => {
          controls.update()
        }
      })

    } else {
      light1.intensity = 0.3
    }
  })


  const sizes = {}

  const handleResize = () => {
    sizes.width = canvas.offsetWidth
    sizes.height = canvas.offsetHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderers.forEach(r => r.setSize(sizes.width, sizes.height))
  }

  onMount(() => {
    sizes.width = canvas.offsetWidth
    sizes.height = canvas.offsetHeight

    renderers.forEach((r, id) => {
      canvas.appendChild(r.domElement);
      r.setSize(canvas.offsetWidth, canvas.offsetHeight);
      if (id > 0) {
        r.domElement.style.position = 'absolute';
        r.domElement.style.top = '0px';
        r.domElement.style.pointerEvents = 'none';
      }
    });

    renderers[0].setPixelRatio(window.devicePixelRatio)
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
  });

  window.addEventListener('resize', handleResize)

  function animate() {
    renderers.forEach(r => r.render(scene, camera));
    controls.update()
    requestAnimationFrame(animate);
  }

  animate()

  return (
    <div class="relative " style="width: calc(100vw - 400px); height: 100vh"  ref={canvas} className={props.class} >
      <div className={props.launchpad() && 'hidden'} class="absolute inset-0 flex items-center text-white font-bold justify-center text-3xl text-bold uppercase">
        select a launch to continue
      </div>
    </div>
  )
}