import {combineReducers} from "redux";
import {liveTableSlice, wsClose, wsConnecting, wsError, wsMessage, wsOpen} from "./live-table/slice.ts";
import {configureStore} from "@reduxjs/toolkit";
import {
    useDispatch as dispatchHook,
    useSelector as selectorHook,
} from "react-redux";
import {socketMiddleware} from "./middleware/socket-middleware.ts";
import {wsConnect, wsDisconnect} from "./live-table/actions.ts";

const rootReducer = combineReducers({
    [liveTableSlice.reducerPath]: liveTableSlice.reducer
});

const liveTableMiddleware = socketMiddleware({
    connect: wsConnect,
    disconnect: wsDisconnect,
    onConnecting: wsConnecting,
    onOpen: wsOpen,
    onClose: wsClose,
    onError: wsError,
    onMessage: wsMessage,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(liveTableMiddleware)
    }
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch = dispatchHook.withTypes<AppDispatch>()
export const useSelector = selectorHook.withTypes<RootState>()