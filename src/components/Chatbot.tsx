import { useState } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful travel assistant.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      const aiMessage = data.choices?.[0]?.message;
      if (aiMessage) {
        setMessages([...newMessages, aiMessage]);
      }
    } catch (err) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, there was an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-xl shadow-2xl border flex flex-col z-50">
      <div className="p-3 border-b font-bold bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-t-xl">AI Chatbot</div>
      <div className="flex-1 p-3 overflow-y-auto max-h-96 space-y-2">
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <div key={i} className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-right ml-10' : 'bg-orange-100 mr-10'}`}>{msg.content}</div>
        ))}
        {loading && <div className="text-gray-400">Thinking...</div>}
      </div>
      <div className="flex border-t">
        <input
          className="flex-1 p-2 outline-none rounded-bl-xl"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything..."
          disabled={loading}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-br-xl hover:bg-blue-600 disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot; 