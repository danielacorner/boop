import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useRef, useState, useEffect } from "react";
import { useMount } from "react-use";
import * as THREE from "three";
import { musicAtom } from "./UI/Music/Music";
import { MUSIC } from "./UI/Music/MUSIC_DATA";

export function MusicZoom() {
  const [{ trackNumber }] = useAtom(musicAtom);
  const { url } = MUSIC[trackNumber];
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

  // * http://wpdildine.github.io/blog/2015/04/08/Web-Audio-Integration
  const audioNodeRef = useRef<AudioNode | null>(null);
  const audioParamRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  useMount(() => {
    // const audio = audioRef.current;
    // if (!audio) {
    //   return;
    // }
    const ctx = new AudioContext();
    // const audioSrc = ctx.createMediaElementSource(audio);
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioNode
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
    analyserRef.current = ctx.createAnalyser();
    audioParamRef.current = ctx.createGain();
    // audioSrc.connect(analyserRef.current);
    // audioSrc.connect(ctx.destination);
    // frequencyBinCount tells you how many values you'll receive from the analyser

    // threejs example https://www.youtube.com/watch?v=tdtaihSNfMY?t=3m19s
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
    frequencyDataRef.current = new Uint8Array(
      analyserRef.current.frequencyBinCount
    );
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        console.log(
          "🌟🚨 ~ file: MusicZoom.tsx ~ line 50 ~ .then ~ stream",
          stream
        );
        const mediaStreamSource = ctx.createMediaStreamSource(stream);
        if (audioParamRef.current) {
          ctx.createMediaStreamSource(stream).connect(audioParamRef.current);
        }
        if (analyserRef.current) {
          mediaStreamSource.connect(analyserRef.current);
        }
        mediaStreamSource.connect(ctx.destination);
      })
      .catch((err) => {
        console.log(
          "🌟🚨 ~ file: MusicZoom.tsx ~ line 53 ~ useMount ~ err",
          err
        );
      });
  });

  useFrame(() => {
    if (!analyserRef.current || !frequencyDataRef.current) return;
    analyserRef.current.getByteFrequencyData(frequencyDataRef.current);
    console.log(
      "🌟🚨 ~ file: MusicZoom.tsx ~ line 33 ~ MusicZoom ~ frequencyData",
      frequencyDataRef.current
    );
  });

  return null;
  // <audio
  //   ref={audioRef}
  //   id="audio"
  // >
  //   <source src="https://www.youtube.com/watch?v=rs80mrSQliM" type=""/>
  // </audio>
  // return url === "" ? null : <PositionalSound url={url} />;
}
// function PositionalSound({ url }) {
//   const sound = useRef<any>();
//   const { camera } = useThree();
//   const [listener] = useState(() => new THREE.AudioListener());
//   const buffer = useLoader(THREE.AudioLoader, url);
//   const [isMusicOn, setIsMusicOn] = useAtom(musicAtom);
//   useEffect(() => {
//     if (isMusicOn) {
//       sound.current.setBuffer(buffer);
//       sound.current.setRefDistance(1000); // how far the sound is heard
//       sound.current.setLoop(true);
//       sound.current.play();
//       camera.add(listener);
//     } else {
//       sound.current.pause();
//     }
//     return () => {
//       camera.remove(listener);
//     };
//   }, [isMusicOn, buffer, camera, listener]);
//   return <positionalAudio ref={sound} args={[listener]} />;
// }

// async function createAudio(url) {
//   // Fetch audio data and create a buffer source
//   const res = await fetch(url);
//   const buffer = await res.arrayBuffer();
//   const context = new (window.AudioContext ||
//     (window as any).webkitAudioContext)();
//   const source = context.createBufferSource();
//   source.buffer = await new Promise((res) =>
//     context.decodeAudioData(buffer, res)
//   );
//   source.loop = true;
//   // This is why it doesn't run in Safari 🍏🐛. Start has to be called in an onClick event
//   // which makes it too awkward for a little demo since you need to load the async data first
//   source.start(0);
//   // Create gain node and an analyser
//   const gain = context.createGain();
//   const analyser = context.createAnalyser();
//   analyser.fftSize = 64;
//   source.connect(analyser);
//   analyser.connect(gain);
//   // The data array receive the audio frequencies
//   const data: Uint8Array & { avg?: number } = new Uint8Array(
//     analyser.frequencyBinCount
//   );
//   return {
//     context,
//     source,
//     gain,
//     data,
//     // This function gets called every frame per audio source
//     update: () => {
//       analyser.getByteFrequencyData(data);
//       // Calculate a frequency average
//       return (data.avg = data.reduce(
//         (prev, cur) => prev + cur / data.length,
//         0
//       ));
//     },
//   };
// }
