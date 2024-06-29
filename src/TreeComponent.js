import React, { useEffect, useState } from 'react';
const TreeComponent = () => {
  const [data, setData] = useState([]);

  // Fetch the initial tree data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://ubique.img.ly/frontend-tha/data.json');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Render the tree recursively
  const renderTree = (nodes) => (
    <ul>
      {nodes.map((node) => (
        <li>
          {node.label}
          {node.children && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <h1>Tree Structure</h1>
      {renderTree(data)}
    </div>
  );
};

export default TreeComponent;
