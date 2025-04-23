import { useState, useEffect, useRef, useCallback } from "react";
import { Item } from "../types";

export default function Home() {
  const initialItems: Item[] = [
    { type: 'Fruit', name: 'Apple' },
    { type: 'Vegetable', name: 'Broccoli' },
    { type: 'Vegetable', name: 'Mushroom' },
    { type: 'Fruit', name: 'Banana' },
    { type: 'Vegetable', name: 'Tomato' },
    { type: 'Fruit', name: 'Orange' },
    { type: 'Fruit', name: 'Mango' },
    { type: 'Fruit', name: 'Pineapple' },
    { type: 'Vegetable', name: 'Cucumber' },
    { type: 'Fruit', name: 'Watermelon' },
    { type: 'Vegetable', name: 'Carrot' },
  ];

  const [items, setItems] = useState<Item[]>(initialItems);
  const [fruits, setFruits] = useState<Item[]>([]);
  const [vegetables, setVegetables] = useState<Item[]>([]);
  const timeoutsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const handleReturn = useCallback((item: Item, setTargetList: React.Dispatch<React.SetStateAction<Item[]>>) => {
    setTargetList(prev => prev.filter(i => i.name !== item.name));
    setItems(prevItems => 
      prevItems.some(i => i.name === item.name)
        ? prevItems
        : [...prevItems, item]
    );
  }, []);

  const moveItem = useCallback((item: Item) => {
    const isFruit = item.type === 'Fruit';
    const setTargetList = isFruit ? setFruits : setVegetables;

    if (items.includes(item)) {
      setItems(prevItems => prevItems.filter(i => i.name !== item.name));
      setTargetList(prev => [...prev, item]);
      
      if (timeoutsRef.current[item.name]) {
        clearTimeout(timeoutsRef.current[item.name]);
      }
      
      timeoutsRef.current[item.name] = setTimeout(() => {
        handleReturn(item, setTargetList);
        delete timeoutsRef.current[item.name];
      }, 5000);
    } else {
      if (timeoutsRef.current[item.name]) {
        clearTimeout(timeoutsRef.current[item.name]);
        delete timeoutsRef.current[item.name];
      }
      handleReturn(item, setTargetList);
    }
  }, [items, handleReturn]);

  const renderItemList = useCallback((itemList: Item[], title?: string) => (
    <div className="col-span-1">
      {title && <h2>{title}</h2>}
      {itemList.map((item) => (
        <button
          key={item.name}
          className="block mb-2 p-2 border rounded"
          onClick={() => moveItem(item)}
        >
          {item.name}
        </button>
      ))}
    </div>
  ), [moveItem]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      {renderItemList(items)}
      {renderItemList(fruits, "Fruit")}
      {renderItemList(vegetables, "Vegetable")}
    </div>
  );
}
