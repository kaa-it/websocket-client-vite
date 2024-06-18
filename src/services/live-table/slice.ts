import {LiveTable, LiveTableActions, WebsocketStatus} from "../../types/live-table.ts";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {liveTableUpdate} from "./live-table-update.ts";

export type LiveTableStore = {
    status: WebsocketStatus;
    table: LiveTable;
    connectionError: string | null;
};

const initialState: LiveTableStore = {
    status: WebsocketStatus.OFFLINE,
    table: [],
    connectionError: null,
};

export const liveTableSlice = createSlice({
    name: "liveTable",
    initialState,
    reducers: {
        wsConnecting: (state) => {
            state.status = WebsocketStatus.CONNECTING;
        },
        wsOpen: (state) => {
            state.status = WebsocketStatus.ONLINE;
            state.connectionError = null;
        },
        wsClose: (state) => {
            state.status = WebsocketStatus.OFFLINE;
        },
        wsError: (state, action: PayloadAction<string>) => {
            state.connectionError = action.payload;
        },
        wsMessage: (state, action: PayloadAction<LiveTableActions>) => {
            state.table = liveTableUpdate(state.table, action.payload)
        }
    },
    selectors: {
        getLiveTable: state => state.table,
        getWebsocketStatus: state => state.status,
    }
})

export const {wsConnecting, wsOpen, wsClose, wsError, wsMessage} = liveTableSlice.actions;
export const { getLiveTable, getWebsocketStatus } = liveTableSlice.selectors;