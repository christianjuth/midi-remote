import { useEffect, useRef, useState } from "react";
import "react-piano/dist/styles.css";

import { Peer } from "peerjs";
import { useParams } from "react-router-dom";

import "react-piano/dist/styles.css";

// @ts-ignore
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";

import { WebMidi, NoteMessageEvent } from "webmidi";

function useMidi(onMidi: (obj: { note: number; velocity: number }) => any) {
  const onMidiRef = useRef(onMidi);
  onMidiRef.current = onMidi;

  useEffect(() => {
    const remoteListeners: (() => any)[] = [];

    const listener = (e: NoteMessageEvent) => {
      onMidiRef.current({
        note: e.note.number,
        velocity: e.type === "noteoff" ? 0 : 100,
      });
    };

    const addListeners = () => {
      for (const input of WebMidi.inputs) {
        input.addListener("noteon", listener);
        input.addListener("noteoff", listener);

        remoteListeners.push(() => {
          input.removeListener("noteon", listener);
          input.removeListener("noteoff", listener);
        });
      }
    }

    WebMidi.addListener("portschanged", addListeners);
    WebMidi.addListener("enabled", addListeners);
    WebMidi.enable();

    return () => {
      WebMidi.removeListener("enabled", addListeners);
      WebMidi.removeListener("portschanged", addListeners);
      for (const l of remoteListeners) {
        l();
      }
    };
  }, []);
}

function useRtc(id?: string) {
  const [send, setSend] = useState<{ fn: (data: any) => any }>();
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (id) {
      const _peer = new Peer();

      _peer.on("open", (_id) => {
        const con = _peer.connect(id);

        con.on("open", () => {
          setSend({ fn: (data) => con.send(data) });
        });

        con.on("close", () => {
          setEnded(true);
        });
      });
    }
  }, [id]);

  return {
    ended,
    send: send?.fn,
    ready: Boolean(send?.fn),
  };
}

const firstNote = MidiNumbers.fromNote("c3");
const lastNote = MidiNumbers.fromNote("f5");

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

export default function Transmitter() {
  const { id } = useParams();
  const rtc = useRtc(id);
  useMidi(({ note, velocity }) => {
    rtc.send?.(JSON.stringify({ note, velocity }));
  });

  if (rtc.ended) {
    return <h1>Disconnected from reciever</h1>;
  }

  if (!rtc.ready) {
    return <h1>Loading...</h1>;
  }

  return (
    <Piano
      noteRange={{ first: firstNote, last: lastNote }}
      playNote={(note: number) => {
        rtc.send?.(JSON.stringify({ note, velocity: 100 }));
      }}
      stopNote={(note: number) => {
        rtc.send?.(JSON.stringify({ note, velocity: 0 }));
      }}
      width={1000}
      keyboardShortcuts={keyboardShortcuts}
    />
  );
}
