import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ClientAPI, ModelProvider } from "../client/api";

const initialState = {
  models: [] as {
    name: string,
    available: boolean,
    provider: {
      id: string,
      providerName: string,
      providerType: string,
    },
  }[],
  lastSelectedIndex: 0,
  updating: false,
  lastUpdated: (new Date('2021-09-01')).getTime(),
}

export const updateModelsAsync = createAsyncThunk(
  'updateModels',
  async () => {
    // Fetch models from OpenAI
    const api = new ClientAPI(ModelProvider.OpenAI);
    return await api.models();
  }
)

export const gptModelsSlicer = createSlice({
  name: 'gptModels',
  initialState,
  reducers: {
    updateIndex: (state, action: PayloadAction<number>) => {
      state.lastSelectedIndex = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateModelsAsync.pending, (state) => {
        state.updating = true;
      })
      .addCase(updateModelsAsync.rejected, (state) => {
        state.updating = false;
      })
      .addCase(updateModelsAsync.fulfilled, (state, action) => {
        // Update last updated time
        state.lastUpdated = Date.now();
        // Mark all models as unavailable
        state.models.forEach((model) => {
          model.available = false;
        });

        const models = action.payload;
        const oldModels = state.models;

        models.forEach((model) => {
          var chatmodel = oldModels.find((m) => m.name === model.name);
          if (!chatmodel) {
            state.models.push({
              name: model.name,
              available: true,
              provider: {
                id: "openai",
                providerName: "OpenAI",
                providerType: "openai",
              },
            });
          } else {
            chatmodel.available = true;
          }
        });
      })
  }
})

export const { updateIndex } = gptModelsSlicer.actions;
export default gptModelsSlicer.reducer;
