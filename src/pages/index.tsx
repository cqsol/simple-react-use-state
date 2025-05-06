import { useCallback } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { Item } from "../types";
import { RootState, AppDispatch } from '../store/store'; // Adjust path
import { moveToCategoryWithTimeout, returnToInitial } from '../store/itemSlice'; // Adjust path

export default function Home() {
  // Get state from Redux store
  const { initial: items, fruits, vegetables } = useSelector((state: RootState) => state.items);
  // Get the dispatch function
  const dispatch = useDispatch<AppDispatch>();

  // Determine if an item is currently in the initial list
  const isItemInInitialList = useCallback((item: Item): boolean => {
    // Check if an item with the same ID exists in the initial list from the store
    return items.some(i => i.id === item.id);
  }, [items]); // Dependency: items list from Redux

  // Handle item click: dispatch appropriate Redux action
  const handleItemClick = useCallback((item: Item) => {
    if (isItemInInitialList(item)) {
      // If in initial list, move to category with timeout
      dispatch(moveToCategoryWithTimeout(item));
    } else {
      // If in a category list, return to initial immediately
      dispatch(returnToInitial(item));
    }
  }, [dispatch, isItemInInitialList]); // Dependencies: dispatch and the helper function

  // Helper function to render a list (remains largely the same)
  const renderItemList = useCallback((itemList: Item[], title?: string) => (
    <div className="col-span-1">
      {title && <h2>{title}</h2>}
      {itemList.map((item) => (
        <button
          // Use the unique ID for the key now
          key={item.id}
          className="block mb-2 p-2 border rounded"
          onClick={() => handleItemClick(item)} // Use the new handler
        >
          {item.name}
        </button>
      ))}
    </div>
  ), [handleItemClick]); // Dependency: the click handler

  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      {renderItemList(items)}
      {renderItemList(fruits, "Fruit")}
      {renderItemList(vegetables, "Vegetable")}
    </div>
  );
}
