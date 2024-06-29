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
      key = `${parentKey}-${node.label}`;
    } else {
      key = node.label;
    }

    let newNode = {
      ...node,
      key,
    };

    if (node.children) {
      newNode.children = node.children.map((child) => generateKey(child, key));
    } else {
      newNode.children = [];
    }

    return newNode;
  };

  const dataWithKeys = data.map((node) => generateKey(node));

  // Toggle highlight for a node and its descendants and fetch data if it's a leaf node
  const toggleHighlight = async (node, isHighlighted) => {
    const newHighlightedNodes = new Set(highlightedNodes);

    const toggle = (node) => {
      if (isHighlighted) {
        newHighlightedNodes.delete(node.key);
      } else {
        newHighlightedNodes.add(node.key);
      }

      if (node.children) {
        node.children.forEach(toggle);
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
    return highlightedNodes.has(node.key);
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
            className={highlighted ? 'highlighted' : ''}
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
