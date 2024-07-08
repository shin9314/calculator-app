import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [operation, setOperation] = useState(null);
  const [prevValue, setPrevValue] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState(['未分類']);
  const [selectedTag, setSelectedTag] = useState('未分類');
  const [newTag, setNewTag] = useState('');

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
    const newHistoryItem = { calculation, tag: currentTag || '未分類', result: roundedResult };
    setHistory([newHistoryItem, ...history]);
    setDisplay(roundedResult.toString());
    setEquation('');
    setOperation(null);
    setPrevValue(null);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setOperation(null);
    setPrevValue(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setTags(['未分類']);
    setSelectedTag('未分類');
  };

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
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

  const filteredHistory = selectedTag === '未分類'
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
          <Button
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
          </Button>
        ))}
      </div>
      <div className="mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button className="w-full justify-between">
              {currentTag || "タグを選択"}
              <span className="ml-2">▼</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <ScrollArea className="h-[200px]">
              {tags.map((tag) => (
                <Button
                  key={tag}
                  className="w-full justify-start"
                  variant="ghost"
                  onClick={() => handleTagChange(tag)}
                >
                  {tag}
                </Button>
              ))}
            </ScrollArea>
            <div className="flex p-2">
              <Input
                placeholder="新しいタグ"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleAddTag} className="ml-2">
                追加
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="bg-white p-2 rounded mb-4">
        <h3 className="text-lg font-bold mb-2">タグごとの合計 (降順)</h3>
        <ScrollArea className="h-40">
          {sortedTagTotals.map(({ tag, total, difference, rank }, index) => (
            <Card key={tag} className="mb-2">
              <CardHeader className="py-2">
                <CardTitle className="text-sm">{tag}</CardTitle>
              </CardHeader>
              <CardContent className="py-2 flex justify-between items-center">
                <p className="font-bold">{formatNumber(total)}</p>
                <div className="flex items-center">
                  {index !== 0 && (
                    <p className="text-red-500 text-sm mr-2">
                      (-{formatNumber(difference)})
                    </p>
                  )}
                  {rank && (
                    <Badge className={`${getRankColor(rank)} font-bold`}>
                      {rank}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </ScrollArea>
      </div>
      <div className="bg-white p-2 rounded">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">計算履歴</h3>
          <Button onClick={handleClearHistory} className="bg-red-500 hover:bg-red-600 text-white text-sm">
            履歴をクリア
          </Button>
        </div>
        <Select value={selectedTag} onValueChange={handleTagChange}>
          <SelectTrigger className="w-full mb-2">
            <SelectValue placeholder="タグでフィルタ" />
          </SelectTrigger>
          <SelectContent>
            {tags.map((tag) => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ScrollArea className="h-40">
          {filteredHistory.map((item, index) => (
            <div key={index} className="mb-1 text-sm">
              <span className="font-bold">[{item.tag}]</span> {item.calculation}
            </div>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default Calculator;