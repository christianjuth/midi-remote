import { useEffect, useState } from "react";

import "react-piano/dist/styles.css";
import "./App.css";
import { w3cwebsocket } from "websocket";
// @ts-ignore
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";

function useClient(ip: string) {
  const [client, setClient] = useState<w3cwebsocket>();

  useEffect(() => {
    if (ip) {
      const _client = new w3cwebsocket(`ws://${ip}:3002/`, "echo-protocol");

      _client.onopen = () => {
        setClient(_client);
      };

      _client.onclose = () => {
        setClient(undefined);
      };
    }
  }, [ip]);

  return client;
}

const firstNote = MidiNumbers.fromNote("c3");
const lastNote = MidiNumbers.fromNote("f5");

const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: firstNote,
  lastNote: lastNote,
  keyboardConfig: KeyboardShortcuts.HOME_ROW,
});

function App() {
  const [clientIp, setClientIp] = useState("");
  const [ip, setIp] = useState("");

  const client = useClient(clientIp);

  return (
    <div className="App">
      {!client ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setClientIp(ip.trim());
          }}
        >
          <input
            onChange={(e) => setIp(e.target.value)}
            placeholder="Local ip address of your computer"
          />
          <button>Set IP</button>
        </form>
      ) : (
        <Piano
          noteRange={{ first: firstNote, last: lastNote }}
          playNote={(note: number) => {
            client?.send(JSON.stringify({ note, velocity: 100 }));
          }}
          stopNote={(note: number) => {
            console.log("STAWP");
            client?.send(JSON.stringify({ note, velocity: 0 }));
          }}
          width={1000}
          keyboardShortcuts={keyboardShortcuts}
        />
      )}
    </div>
  );
}

export default App;
