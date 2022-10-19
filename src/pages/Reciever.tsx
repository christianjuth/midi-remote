import { useEffect, useRef, useState } from "react";

import "react-piano/dist/styles.css";
import { w3cwebsocket } from "websocket";
import QRCode from "react-qr-code";

import { Peer } from "peerjs";

function useClient() {
  const [client, setClient] = useState<w3cwebsocket>();

  useEffect(() => {
    const _client = new w3cwebsocket(`ws://localhost:3002/`, "echo-protocol");

    _client.onopen = () => {
      setClient(_client);
    };

    _client.onclose = () => {
      setClient(undefined);
    };
  }, []);

  return client;
}

function useRtc(onData: (data: any) => any) {
  const [id, setId] = useState<string>();
  const onDataRef = useRef(onData);
  onDataRef.current = onData;

  useEffect(() => {
    const peer = new Peer();
    peer.on("open", (_id) => {
      setId(_id);
      console.log(_id);
    });
    peer.on("connection", (connection) => {
      console.log("connection");
      connection.on("data", (data) => {
        onDataRef.current(data);
      });
    });
  }, []);

  return {
    id,
  };
}

function Reciever() {
  const client = useClient();
  const rtc = useRtc((data) => {
    client?.send(data);
  });

  const transmitUrl = `${window.location.origin}/transmitter/${rtc.id}`;

  if (!client) {
    return <h1>Looking for ableton</h1>
  }

  if (!rtc.id) {
    return <h1>Loading...</h1>
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh",
      }}
    >
      <h1>Connect a transmitter</h1>
      <span>Scan this qr code</span>
      <QRCode value={transmitUrl} style={{ margin: "15px 0" }} />
      <span style={{ marginBottom: 15 }}>Or visit the following url</span>
      <a href={transmitUrl} style={{ marginBottom: 15 }}>
        {transmitUrl}
      </a>
      <span>
        <i>Don't close this tab while transmitting</i>
      </span>
    </div>
  );
}

export default Reciever;
