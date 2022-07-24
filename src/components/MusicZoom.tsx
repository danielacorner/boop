import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { musicUrlAtom } from "./Music/Music";
import { useAtom } from "jotai";
import { suspend } from "suspend-react";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { musicAtom } from "./Music/AudioSoundButton";

export function MusicZoom() {
  const [{ url }] = useAtom(musicUrlAtom);
  // This will *not* re-create a new audio source, suspense is always cached,
  // so this will just access (or create and then cache) the source according to the url
  // const { data } = suspend(() => createAudio(musicUrl), [musicUrl]);
  // return useFrame((state) => {
  //   // Set the cameras field of view according to the frequency average
  //   console.log(
  //     "🌟🚨 ~ file: Scene.tsx ~ line 279 ~ returnuseFrame ~ state.camera",
  //     state.camera
  //   );
  //   // state.camera.fov = 25 - (data.avg??0) / 15;
  //   state.camera.updateProjectionMatrix();
  // });
  return url === "" ? null : <Sound url={url} />;
}
function Sound({ url }) {
  const sound = useRef<any>();
  const { camera } = useThree();
  const [listener] = useState(() => new THREE.AudioListener());
  const buffer = useLoader(THREE.AudioLoader, url);
  const [isMusicOn, setIsMusicOn] = useAtom(musicAtom);
  useEffect(() => {
    if (isMusicOn) {
      sound.current.setBuffer(buffer);
      sound.current.setRefDistance(1000); // how far the sound is heard
      sound.current.setLoop(true);
      sound.current.play();
      camera.add(listener);
    } else {
      sound.current.pause();
    }
    return () => {
      camera.remove(listener);
    };
  }, [isMusicOn, buffer, camera, listener]);
  return <positionalAudio ref={sound} args={[listener]} />;
}

async function createAudio(url) {
  // Fetch audio data and create a buffer source
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const context = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const source = context.createBufferSource();
  source.buffer = await new Promise((res) =>
    context.decodeAudioData(buffer, res)
  );
  source.loop = true;
  // This is why it doesn't run in Safari 🍏🐛. Start has to be called in an onClick event
  // which makes it too awkward for a little demo since you need to load the async data first
  source.start(0);
  // Create gain node and an analyser
  const gain = context.createGain();
  const analyser = context.createAnalyser();
  analyser.fftSize = 64;
  source.connect(analyser);
  analyser.connect(gain);
  // The data array receive the audio frequencies
  const data: Uint8Array & { avg?: number } = new Uint8Array(
    analyser.frequencyBinCount
  );
  return {
    context,
    source,
    gain,
    data,
    // This function gets called every frame per audio source
    update: () => {
      analyser.getByteFrequencyData(data);
      // Calculate a frequency average
      return (data.avg = data.reduce(
        (prev, cur) => prev + cur / data.length,
        0
      ));
    },
  };
}
