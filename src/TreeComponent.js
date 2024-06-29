import React, { useEffect, useState } from 'react';
import './TreeComponent.css';

const TreeComponent = () => {
  const [data, setData] = useState([]);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());
  const [selectedData, setSelectedData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch the initial tree data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://ubique.img.ly/frontend-tha/data.json');
        const data = await response.json();
        setData(data);

        // Process data to generate keys
        const processedData = data.map((node) => generateKey(node));
        console.log(processedData); // Display processed data with keys in the console
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Generate a unique key for each node based on its path
  const generateKey = (node, parentKey = '') => {
    let key;
    if (parentKey) {
      key = `${parentKey}-${node.label}`; // Combine parentKey and node.label to form a unique key
    } else {
      key = node.label; // Use node.label as the key for root nodes
    }

    let newNode = {
      ...node, // Copy all properties from node into newNode
      key,
    };

    if (node.children) {
      newNode.children = node.children.map((child) => generateKey(child, key));
    } else {
      newNode.children = []; // Ensure children is an empty array if no children exist
    }

    return newNode;
  };

  const dataWithKeys = data.map((node) => generateKey(node));

  // Toggle highlight for a node and its descendants and fetch data if it's a leaf node
  const toggleHighlight = async (node, isHighlighted) => {
    const newHighlightedNodes = new Set(highlightedNodes);

    const toggle = (node) => {
      if (isHighlighted) {
        newHighlightedNodes.delete(node.key); // Remove key from the set if currently highlighted
      } else {
        newHighlightedNodes.add(node.key); // Add key to the set if not currently highlighted
      }

      if (node.children) {
        node.children.forEach(toggle); // Recursively toggle highlight for children
      }
    };

    toggle(node);
    setHighlightedNodes(newHighlightedNodes);

    if (!node.children.length) {
      try {
        const response = await fetch(`https://ubique.img.ly/frontend-tha/entries/${node.id}.json`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Data not found');
          }
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSelectedData(data);
        setError(null);
      } catch (error) {
        setError(error.message);
        setSelectedData(null);
      }
    } else {
      setSelectedData(null);
    }
  };

  // Check if a node is highlighted
  const isNodeHighlighted = (node) => {
    return highlightedNodes.has(node.key); // Return true if the node is in the highlighted set
  };

  // Render the tree recursively
  const renderTree = (nodes) => (
    <ul>
      {nodes.map((node) => {
        const highlighted = isNodeHighlighted(node);
        return (
          <li
            key={node.key}
            onClick={(e) => {
              e.stopPropagation(); // Prevent click event from bubbling up
              toggleHighlight(node, highlighted); // Toggle highlight on click
            }}
            className={highlighted ? 'highlighted' : ''} // Apply highlighted class if node is highlighted
          >
            {node.label}
            {node.children && renderTree(node.children)} {/* Render children recursively if they exist */}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      <div>
        <h1>Tree Structure</h1>
        {renderTree(dataWithKeys)}
      </div>
      <div>
        <h2>Selected Data</h2>
        {error && <p>{error}</p>}
        {selectedData && !error && (
          <pre>{JSON.stringify(selectedData, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default TreeComponent;
