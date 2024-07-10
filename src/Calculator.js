import React, { useState, useMemo, useEffect } from 'react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [operation, setOperation] = useState(null);
  const [prevValue, setPrevValue] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState(['全ての履歴', '未分類']);
  const [selectedTag, setSelectedTag] = useState('未分類');
  const [newTag, setNewTag] = useState('');
  const [lastClearTime, setLastClearTime] = useState(0);
  const [historyMemos, setHistoryMemos] = useState({});

  useEffect(() => {
  const savedMemos = localStorage.getItem('calculatorHistoryMemos');
  if (savedMemos) setHistoryMemos(JSON.parse(savedMemos));
}, []);

useEffect(() => {
  localStorage.setItem('calculatorHistoryMemos', JSON.stringify(historyMemos));
}, [historyMemos]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    const savedTags = localStorage.getItem('calculatorTags');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedTags) setTags(JSON.parse(savedTags));
  }, []);

  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calculatorTags', JSON.stringify(tags));
  }, [tags]);

  const addMemoToHistory = (index) => {
  const memo = prompt('メモを入力してください:');
  if (memo) {
    setHistoryMemos(prevMemos => ({
      ...prevMemos,
      [index]: memo
    }));
  }
};

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleNumberClick = (num) => {
    const newDisplay = display === '0' ? num : display + num;
    setDisplay(newDisplay);
    setEquation(prevEquation => {
      if (operation) {
        return `${prevEquation}${num}`;
      } else {
        return formatNumber(newDisplay);
      }
    });
  };

  const handleOperationClick = (op) => {
    setOperation(op);
    setPrevValue(parseFloat(display));
    setDisplay('0');
    setEquation(prevEquation => `${prevEquation} ${op} `);
  };

  const roundUpTo1000 = (num) => {
    return Math.ceil(num / 1000) * 1000;
  };

  const handleEqualsClick = () => {
    const current = parseFloat(display);
    let result;
    switch (operation) {
      case '+': result = prevValue + current; break;
      case '-': result = prevValue - current; break;
      case '*': result = prevValue * current; break;
      case '/': result = prevValue / current; break;
      default: return;
    }
    const roundedResult = roundUpTo1000(result);
    const calculation = `${formatNumber(prevValue)} ${operation} ${formatNumber(current)} = ${formatNumber(roundedResult)}`;
    const newHistoryItem = { 
      id: Date.now(),
      calculation,
      tag: currentTag || '未選択', 
      result: roundedResult 
    };
    setHistory([newHistoryItem, ...history]);
    setDisplay(roundedResult.toString());
    setEquation('');
    setOperation(null);
    setPrevValue(null);
  };

const handleClear = () => {
  const now = Date.now();
  if (now - lastClearTime < 300) { // ダブルクリックとみなす時間間隔（ミリ秒）
    setDisplay('0');
    setEquation('');
    setOperation(null);
    setPrevValue(null);
  } else {
    if (display !== '0') {
      setDisplay(display.slice(0, -1) || '0');
    }
    setEquation(prevEquation => {
      const newEquation = prevEquation.trim().slice(0, -1).trim();
      return newEquation || '';
    });
    if (operation && display === '0') {
      setOperation(null);
    }
  }
  setLastClearTime(now);
};

  const handleClearHistory = () => {
  setHistory([]);
  setTags(['全ての履歴', '未分類']);
  setSelectedTag('全ての履歴');
  localStorage.removeItem('calculatorHistory');
  localStorage.removeItem('calculatorTags');
};

  const handleAddTag = () => {
  if (newTag && !tags.includes(newTag)) {
    setTags(['全ての履歴', ...tags.filter(tag => tag !== '全ての履歴'), newTag]);
    setSelectedTag(newTag);
    setCurrentTag(newTag);
    setNewTag('');
  }
};

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    setCurrentTag(tag);
    setEquation('');
    setDisplay('0');
    setOperation(null);
    setPrevValue(null);
  };

  const sortedTagTotals = useMemo(() => {
    const totals = history.reduce((acc, item) => {
      if (!acc[item.tag]) {
        acc[item.tag] = 0;
      }
      acc[item.tag] += item.result;
      return acc;
    }, {});

    const sortedEntries = Object.entries(totals)
      .sort(([, a], [, b]) => b - a);

    const highestTotal = sortedEntries[0]?.[1] || 0;

    return sortedEntries.map(([tag, total], index) => {
      const difference = index === 0 ? 0 : highestTotal - total;
      let rank = '';
      if (index === 0) {
        rank = '金';
      } else if (difference >= 225000 && difference <= 280000) {
        rank = '黒';
      } else if (difference >= 113000 && difference <= 224000) {
        rank = '金2';
      } else if (difference >= 71000 && difference <= 112000) {
        rank = '金';
      } else if (difference >= 1000 && difference <= 70000) {
        rank = '銀';
      }
      return { tag, total, difference, rank };
    });
  }, [history]);

  const filteredHistory = selectedTag === '全ての履歴'
  ? history
  : history.filter(item => item.tag === selectedTag);

  const getRankColor = (rank) => {
    switch (rank) {
      case '金':
      case '金2':
        return 'bg-yellow-500 text-black';
      case '銀':
        return 'bg-gray-300 text-black';
      case '黒':
        return 'bg-black text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-96 mx-auto bg-gray-200 p-4 rounded-lg shadow-lg">
      <div className="bg-white p-2 mb-2 rounded text-right text-lg h-8 overflow-hidden">
        {equation}
      </div>
      <div className="bg-white p-2 mb-4 rounded text-right text-2xl h-12 overflow-hidden">
        {formatNumber(display)}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[7, 8, 9, '+', 4, 5, 6, '-', 1, 2, 3, '*', 0, '00', '.', '/', 'C', '='].map((item, index) => (
          <button
            key={index}
            onClick={() => {
              if (typeof item === 'number' || item === '00' || item === '.') handleNumberClick(item.toString());
              else if (item === 'C') handleClear();
              else if (item === '=') handleEqualsClick();
              else handleOperationClick(item);
            }}
            className={`p-2 text-lg ${
              item === '=' ? 'col-span-2 bg-blue-500 hover:bg-blue-600' :
              item === 'C' ? 'bg-red-500 hover:bg-red-600 text-white' :
              'bg-gray-300 hover:bg-gray-400'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <select 
          value={currentTag} 
          onChange={(e) => handleTagChange(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <div className="flex">
          <input
            placeholder="新しいタグ"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="flex-grow p-2 border rounded-l"
          />
          <button onClick={handleAddTag} className="bg-blue-500 text-white p-2 rounded-r">
            追加
          </button>
        </div>
      </div>
      <div className="bg-white p-2 rounded mb-4">
        <h3 className="text-lg font-bold mb-2">現在の売上TOP</h3>
        <div className="h-60 overflow-y-auto">
          {sortedTagTotals.map(({ tag, total, difference, rank }, index) => (
            <div key={tag} className="mb-2 p-2 border rounded">
              <div className="py-2">
                <h4 className="text-sm font-bold">{tag}</h4>
              </div>
              <div className="py-2 flex justify-between items-center">
                <p className="font-bold">{formatNumber(total)}</p>
                <div className="flex items-center">
                  {index !== 0 && (
                    <p className="text-red-500 text-sm mr-2">
                      (-{formatNumber(difference)})
                    </p>
                  )}
                  {rank && (
                    <span className={`${getRankColor(rank)} font-bold px-2 py-1 rounded`}>
                      {rank}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-2 rounded">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">計算履歴</h3>
          <button onClick={handleClearHistory} className="bg-red-500 hover:bg-red-600 text-white text-sm p-2 rounded">
            履歴を削除
          </button>
        </div>
        <select 
          value={selectedTag} 
          onChange={(e) => handleTagChange(e.target.value)}
          className="w-full mb-2 p-2 border rounded"
        >
          {tags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <div className="h-40 overflow-y-auto">
  {filteredHistory.map((item, index) => (
    <div key={index} className="mb-1 text-sm">
      <div 
        className="cursor-pointer"
        onClick={() => addMemoToHistory(index)}
      >
        <span className="font-bold">[{item.tag}]</span> {item.calculation}
      </div>
      {historyMemos[index] && (
        <div className="text-xs text-gray-600 ml-4">メモ: {historyMemos[index]}</div>
      )}
    </div>
  ))}
</div>
      </div>
    </div>
  );
};

export default Calculator;
