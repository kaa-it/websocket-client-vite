import {
    ActionCreatorWithoutPayload,
    ActionCreatorWithPayload,
    Middleware,
} from "@reduxjs/toolkit";
import { RootState } from "../store";

export type TWsActionTypes = {
    connect: ActionCreatorWithPayload<string>;
    disconnect: ActionCreatorWithoutPayload;
    sendMessage?: ActionCreatorWithPayload<any>;
    onConnecting: ActionCreatorWithoutPayload;
    onOpen: ActionCreatorWithoutPayload;
    onClose: ActionCreatorWithoutPayload;
    onError: ActionCreatorWithPayload<string>;
    onMessage: ActionCreatorWithPayload<any>;
};

const RECONNECT_PERIOD = 3000;

export const socketMiddleware = (
    wsActions: TWsActionTypes,
    withTokenRefresh: boolean = false
): Middleware<{}, RootState> => {
    return (store) => {
        let socket: WebSocket | null = null;
        const {
            connect,
            sendMessage,
            onOpen,
            onClose,
            onError,
            onMessage,
            onConnecting,
            disconnect,
        } = wsActions;
        let isConnected = false;
        let reconnectTimer = 0;
        let url = "";

        return (next) => (action) => {
            const { dispatch } = store;

            if (connect.match(action)) {
                url = action.payload;
                socket = new WebSocket(url);
                isConnected = true;
                dispatch(onConnecting());

                socket.onopen = () => {
                    dispatch(onOpen());
                };

                socket.onerror = () => {
                    dispatch(onError("Error"));
                };

                socket.onmessage = (event) => {
                    const { data } = event;

                    try {
                        const parsedData = JSON.parse(data);

                        if (withTokenRefresh && parsedData.message === "Invalid or missing token") {
                            // refreshToken()
                            //     .then(refreshData => {
                            //         const wssUrl = new URL(url);
                            //         wssUrl.searchParams.set(
                            //             "token",
                            //             refreshData.accessToken.replace("Bearer ", "")
                            //         );
                            //         dispatch({type: wsConnect, payload: wssUrl});
                            //     })
                            //     .catch(err => {
                            //         dispatch(onError((error as {message: string}).message));
                            //     });
                            //
                            // dispatch(wsDisconnect());

                            return;
                        }

                        dispatch(onMessage(parsedData));
                    } catch (error) {
                        dispatch(onError((error as {message: string}).message));
                    }
                };

                socket.onclose = () => {
                    dispatch(onClose());

                    if (isConnected) {
                        reconnectTimer = window.setTimeout(() => {
                            dispatch(connect(url));
                        }, RECONNECT_PERIOD);
                    }
                };
            }

            if (socket && sendMessage?.match(action)) {
                try {
                    socket.send(JSON.stringify(action.payload));
                } catch (error) {
                    dispatch(onError((error as {message: string}).message));
                }
            }

            if (socket && disconnect.match(action)) {
                clearTimeout(reconnectTimer);
                isConnected = false;
                reconnectTimer = 0;
                socket.close();
                socket = null;
            }

            next(action);
        };
    };
};