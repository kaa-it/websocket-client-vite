import './app.css';
import LiveTable from '../live-table/live-table';
import {useDispatch, useSelector} from '../../services/store';
import {wsConnect, wsDisconnect} from '../../services/live-table/actions';
import {WebsocketStatus} from '../../types/live-table';
import {getLiveTable, getWebsocketStatus} from "../../services/live-table/slice.ts";

export const LIVE_TABLE_SERVER_URL = 'ws://localhost:3001';

const App = () => {
    const dispatch = useDispatch();
    const table = useSelector(getLiveTable);
    const status = useSelector(getWebsocketStatus);
    const isDisconnected = status !== WebsocketStatus.ONLINE

    let className = 'app__status';
    switch (status) {
      case WebsocketStatus.ONLINE:
        className += ' app__status--online';
        break;
      case WebsocketStatus.OFFLINE:
        className += ' app__status--offline';
        break;
      case WebsocketStatus.CONNECTING:
        className += ' app__status--connecting';
        break;
    }

    const connect = () => dispatch(wsConnect(LIVE_TABLE_SERVER_URL));
    const disconnect = () => dispatch(wsDisconnect());

    return (
        <div className="app">
            <h3 className="app__header">Live table</h3>
            <p>
                Connection status: <span className={className}>{status}</span>
            </p>
            <div>
                <button
                    className="app__button app__button--connect"
                    disabled={!isDisconnected}
                    onClick={connect}>
                    Connect
                </button>
                <button
                    className="app__button app__button--disconnect"
                    disabled={isDisconnected}
                    onClick={disconnect}>
                    Disconnect
                </button>
            </div>
            <LiveTable table={table}/>
        </div>
    );
}

export default App;
