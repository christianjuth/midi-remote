import { useEffect, useState } from "react";
import "react-piano/dist/styles.css";

import { Peer } from "peerjs";
import { useParams } from "react-router-dom";

import "react-piano/dist/styles.css";

// @ts-ignore
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";

function useRtc(id?: string) {
  const [send, setSend] = useState<{ fn: (data: any) => any }>();

  useEffect(() => {
    if (id) {
      const _peer = new Peer();

      _peer.on("open", (_id) => {
        const con = _peer.connect(id);

        con.on("open", () => {
          setSend({ fn: (data) => con.send(data) });
        });
      });
    }
  }, [id]);

  return {
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

  if (!rtc.ready) {
    return <span>loading...</span>;
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
