import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch } from './store.ts'; // We'll create this next
import { Item } from '../types';

// --- Initial State ---
const initialItemsData: Item[] = [
  // Add unique IDs based on name for simplicity
  { id: 'Apple', type: 'Fruit', name: 'Apple' },
  { id: 'Broccoli', type: 'Vegetable', name: 'Broccoli' },
  { id: 'Mushroom', type: 'Vegetable', name: 'Mushroom' },
  { id: 'Banana', type: 'Fruit', name: 'Banana' },
  { id: 'Tomato', type: 'Vegetable', name: 'Tomato' },
  { id: 'Orange', type: 'Fruit', name: 'Orange' },
  { id: 'Mango', type: 'Fruit', name: 'Mango' },
  { id: 'Pineapple', type: 'Fruit', name: 'Pineapple' },
  { id: 'Cucumber', type: 'Vegetable', name: 'Cucumber' },
  { id: 'Watermelon', type: 'Fruit', name: 'Watermelon' },
  { id: 'Carrot', type: 'Vegetable', name: 'Carrot' },
];

interface ItemsState {
  initial: Item[];
  fruits: Item[];
  vegetables: Item[];
}

const initialState: ItemsState = {
  initial: initialItemsData,
  fruits: [],
  vegetables: [],
};

// --- Timeout Management (outside Redux state) ---
// We need a way to track timeouts to cancel them
const activeTimeouts: { [itemId: string]: NodeJS.Timeout } = {};

// --- Thunks (for async logic like timeouts) ---

// Action to move an item to its category and start the return timer
export const moveToCategoryWithTimeout = createAsyncThunk<void, Item, { dispatch: AppDispatch }>(
  'items/moveToCategoryWithTimeout',
  async (item, { dispatch }) => {
    // 1. Clear any existing timeout for this item
    if (activeTimeouts[item.id]) {
      clearTimeout(activeTimeouts[item.id]);
      delete activeTimeouts[item.id];
    }

    // 2. Dispatch the synchronous action to move the item
    dispatch(itemSlice.actions.moveToCategory(item));

    // 3. Set a new timeout to return the item
    const timeoutId = setTimeout(() => {
      console.log(`Timeout returning ${item.name}`);
      dispatch(returnToInitial(item)); // Dispatch the return action
      delete activeTimeouts[item.id]; // Clean up the tracking
    }, 5000); // 5 seconds

    // 4. Track the new timeout
    activeTimeouts[item.id] = timeoutId;
  }
);

// Action to return an item to the initial list and clear its timer
export const returnToInitial = createAsyncThunk<void, Item, { dispatch: AppDispatch }>(
  'items/returnToInitial',
  async (item, { dispatch }) => {
    // 1. Clear any existing timeout for this item
    if (activeTimeouts[item.id]) {
      clearTimeout(activeTimeouts[item.id]);
      delete activeTimeouts[item.id];
    }
    // 2. Dispatch the synchronous action to move the item back
    dispatch(itemSlice.actions.returnItem(item));
  }
);

// --- Slice Definition ---
export const itemSlice = createSlice({
  name: 'items',
  initialState,
  reducers: {
    // Synchronous action to move item from initial to category
    moveToCategory: (state, action: PayloadAction<Item>) => {
      const item = action.payload;
      state.initial = state.initial.filter(i => i.id !== item.id);
      if (item.type === 'Fruit') {
        state.fruits.push(item);
      } else {
        state.vegetables.push(item);
      }
    },
    // Synchronous action to return item from category to initial
    returnItem: (state, action: PayloadAction<Item>) => {
      const item = action.payload;
      if (item.type === 'Fruit') {
        state.fruits = state.fruits.filter(i => i.id !== item.id);
      } else {
        state.vegetables = state.vegetables.filter(i => i.id !== item.id);
      }
      // Add back to initial only if it's not already there (safety check)
      if (!state.initial.some(i => i.id === item.id)) {
        // Optional: maintain original order (requires access to original list or sorting logic)
        state.initial.push(item);
      }
    },
  },
});

// Export reducer
export default itemSlice.reducer;