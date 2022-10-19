import { useEffect, useRef, useState } from "react";

import "react-piano/dist/styles.css";
import { w3cwebsocket } from "websocket";

import { Peer } from "peerjs";
import { v4 as uuid } from 'uuid'

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
  const [id, setId] = useState<string>()
  const onDataRef = useRef(onData)
  onDataRef.current = onData

  useEffect(() => {
    const peer = new Peer();
    peer.on('open', (_id) => {
      setId(_id)
      console.log(_id)
    })
    peer.on('connection', (connection) =>  {
      console.log('connection')
      connection.on('data', (data) => {
        onDataRef.current(data)
      })
    });
  }, [])

  return {
    id,
  }
}

function Reciever() {
  const client = useClient();
  const rtc = useRtc((data) => {
    client?.send(data)
  })

  return (
    <div className="App">
      <span>{rtc.id}</span>
    </div>
  );
}

export default Reciever;
